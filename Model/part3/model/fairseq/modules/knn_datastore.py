import torch
import faiss
import numpy as np
import time
import math
import faiss.contrib.torch_utils


class KNN_Dstore(object):
    def __init__(self, args, trg_vocab_size):
        self.half = args.fp16
        self.dimension = args.decoder_embed_dim
        self.dstore_size = args.dstore_size
        self.dstore_fp16 = args.dstore_fp16
        self.use_gpu_to_search = args.use_gpu_to_search
        self.vocab_size = trg_vocab_size
        self.index = self.setup_faiss(args)
        self.time_for_retrieve = 0.
        self.retrieve_count = 0.
        self.time_for_setup_prob = 0.
        # set knn hyper-parameters
        self.k = args.k
        self.knn_lambda = args.knn_lambda
        self.temperature = args.knn_temperature
        self.knn_sim_metric = args.knn_sim_metric

    def setup_faiss(self, args):
        if not args.dstore_filename:
            raise ValueError('Cannot build a datastore without the data.')
        start = time.time()
        index = faiss.read_index(args.dstore_filename + '/knn_index', faiss.IO_FLAG_ONDISK_SAME_DIR)
        if self.use_gpu_to_search:
            print('put index from cpu to gpu')
            res = faiss.StandardGpuResources()
            self.res = res
            co = faiss.GpuClonerOptions()
            co.useFloat16 = True
            index = faiss.index_cpu_to_gpu(res, 0, index, co)

        print('Reading datastore took {} s'.format(time.time() - start))
        print('the datastore is {}, size is {}, and dim is {} '.
              format(args.dstore_filename, self.dstore_size, self.dimension))

        index.nprobe = args.probe

        # if args.dstore_fp16:
        #     print('Keys are fp16 and vals are int32')
        #     self.keys = np.memmap(args.dstore_filename + '/keys.npy', dtype=np.float16, mode='r',
        #                           shape=(self.dstore_size, 1))
        # else:
        #     print('Keys are fp32 and vals are int32')
        #     self.keys = np.memmap(args.dstore_filename + '/keys.npy', dtype=np.float32, mode='r',
        #                           shape=(self.dstore_size, 1))
        self.vals = np.memmap(args.dstore_filename + '/vals.npy', dtype=np.int, mode='r',
                              shape=(self.dstore_size, 1))

        # If you wish to load all the keys into memory
        # CAUTION: Only do this if your RAM can handle it!
        if args.move_dstore_to_mem:
            print('Loading to memory...')
            start = time.time()

            # del self.keys
            # if args.dstore_fp16:
            #     self.keys_from_memmap = np.memmap(args.dstore_filename + '/keys.npy',
            #                                       dtype=np.float16, mode='r',
            #                                       shape=(self.dstore_size, 1))
            #     self.keys = np.zeros((self.dstore_size, 1), dtype=np.float16)
            #     self.keys = (self.keys_from_memmap[:]).astype(np.float16)
            # else:
            #     self.keys_from_memmap = np.memmap(args.dstore_filename + '/keys.npy',
            #                                       dtype=np.float32, mode='r',
            #                                       shape=(self.dstore_size, 1))
            #     self.keys = np.zeros((self.dstore_size, 1), dtype=np.float32)
            #     self.keys = (self.keys_from_memmap[:]).astype(np.float32)
            del self.vals
            self.vals_from_memmap = np.memmap(args.dstore_filename + '/vals.npy',
                                              dtype=np.int, mode='r',
                                              shape=(self.dstore_size, 1))
            self.vals = np.zeros((self.dstore_size, 1), dtype=np.int)
            self.vals = (self.vals_from_memmap[:]).astype(np.int)

            if self.use_gpu_to_search:
                # self.keys = torch.from_numpy(self.keys)
                self.vals = torch.from_numpy(self.vals)
                if torch.cuda.is_available():
                    # self.keys = self.keys.cuda()
                    self.vals = self.vals.cuda()

            print('Loading to memory took {} s'.format(time.time() - start))

        return index

    def dist_func(self, d, function):
        # Default behavior for IP metric is to return faiss distances.
        # Default behavior for L2 metric is to recompute distances.
        if function == 'IP':
            return d
        if function == 'L2':
            return -1 * d
        raise ValueError("Invalid knn similarity function!")

    def retrieve(self, queries, remove_nearest=False):
        # queries are [Batch, seq len, Hid Size]
        # retrieve
        bsz = queries.size(0)
        seq_len = queries.size(1)

        queries = queries.contiguous().view(-1, queries.size(-1))
        # 'use_gpu_to_search': True, 'move_dstore_to_mem': True
        dists, indices = self.index.search(queries, self.k)  # [Batch * seq len, K]
        tgt_index = self.vals[indices].to(queries.device).squeeze(-1)  # [Batch size * Seq len, K]
        # 'use_gpu_to_search': False, 'move_dstore_to_mem': False
        # queries = queries.cpu()
        # dists, indices = self.index.search(queries, self.k)  # [Batch * seq len, K]
        # queries = queries.cuda()  # 'use_gpu_to_search': False, 'move_dstore_to_mem': False
        # indices = indices.cpu()
        # tgt_index = self.vals[indices]  # [Batch size * Seq len, K]
        # tgt_index = torch.from_numpy(tgt_index)
        # tgt_index = tgt_index.to(queries.device)  # [Batch size * Seq len, K]
        # tgt_index = tgt_index.squeeze(-1)  # [Batch size * Seq len, K]
        tgt_index = tgt_index.view(bsz, seq_len, -1)  # [B, S, K]
        dists = dists.view(bsz, seq_len, -1)  # [Batch, Seq len, k]
        similarities = self.dist_func(dists, function=self.knn_sim_metric)  # [B, S, K]

        # remove the nearest neighbor
        if remove_nearest and self.k > 1:
            similarities = similarities[:, :, 1:]
            tgt_index = tgt_index[:, :, 1:]

        return {'similarity': similarities, 'tgt_index': tgt_index}

    def calculate_probs(self,
                        queries: torch.Tensor,  # [B, S, H]
                        similarities: torch.Tensor,  # [B, S, K]
                        tgt_index: torch.Tensor,  # [B, S, K]
                        ):
        bsz = queries.size(0)
        seq_len = queries.size(1)

        scaled_dists = similarities / self.temperature
        knn_weight = torch.softmax(scaled_dists, dim=-1).unsqueeze(-1)  # [B, S, K, 1]

        # set the target index for each neighbor
        knn_tgt_prob = torch.zeros(bsz, seq_len, self.k, self.vocab_size).to(queries.device)  # [B, S, K, Vocab Size]
        tgt_index = tgt_index.unsqueeze_(-1)  # [B, S, K, 1]

        # 'use_gpu_to_search': False, 'move_dstore_to_mem': False
        # knn_weight = knn_weight.cuda()
        # knn_tgt_prob = knn_tgt_prob.cuda()
        # tgt_index = tgt_index.cuda()

        from torch_scatter import scatter
        scatter(src=knn_weight.float(), out=knn_tgt_prob, index=tgt_index, dim=-1)
        # knn_tgt_prob = knn_tgt_prob.scatter_(dim=-1, index=tgt_index, src=knn_weight.float())
        # print('set the target prob for each neighbor (need do scatter operation for {} tensor), took {} s'.
        #       format(knn_tgt_prob.size(), time.time() - start))
        knn_probs = knn_tgt_prob.sum(dim=-2)  # [Batch Size, seq len, vocab size]

        # reimplement this with scatter add
        # knn_tgt_prob = torch.zeros(bsz, seq_len, self.vocab_size).to(queries.device)  # [B, S, Vocab Size]
        # tgt_index = tgt_index  # [B, S, K]
        # knn_weight = knn_weight.squeeze(-1)
        # scatter(src=knn_weight, )
        return knn_probs
