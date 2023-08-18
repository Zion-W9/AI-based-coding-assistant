import argparse
import os
import numpy as np
import faiss
import time

parser = argparse.ArgumentParser()
parser.add_argument('--dstore_mmap', type=str, help='memmap where keys and vals are stored')
parser.add_argument('--dstore_size', type=int, help='number of items saved in the datastore memmap')
parser.add_argument('--dimension', type=int, default=768, help='Size of each key')
parser.add_argument('--dstore_fp16', default=False, action='store_true')
parser.add_argument('--seed', type=int, default=1,
                    help='random seed for sampling the subset of vectors to train the cache')
parser.add_argument('--ncentroids', type=int, default=4096, help='number of centroids faiss should learn')
parser.add_argument('--code_size', type=int, default=64, help='size of quantized vectors')
parser.add_argument('--probe', type=int, default=32, help='number of clusters to query')
parser.add_argument('--faiss_index', type=str, help='file to write the faiss index')
parser.add_argument('--starting_point', type=int, default=0, help='index to start adding keys at')

args = parser.parse_args()

print(args)

res = faiss.StandardGpuResources()

keys = np.memmap(args.dstore_mmap + '/keys.npy', dtype=np.float16 if args.dstore_fp16 else np.float32,
                 mode='r', shape=(args.dstore_size, args.dimension))
vals = np.memmap(args.dstore_mmap + '/vals.npy', dtype=np.int, mode='r', shape=(args.dstore_size, 1))

print('done.')

if not os.path.exists(args.faiss_index + ".trained"):
    # Initialize faiss index
    quantizer = faiss.IndexFlatIP(args.dimension)
    # quantizer = faiss.IndexFlatL2(args.dimension)
    index = faiss.IndexIVFPQ(quantizer, args.dimension,
                             args.ncentroids, args.code_size, 8)
    index.nprobe = args.probe

    # TODO, we may remove useFloat16 when the GPU satisfy the condition
    print('Start put index to gpu')
    co = faiss.GpuClonerOptions()
    co.useFloat16 = True
    gpu_index = faiss.index_cpu_to_gpu(res, 0, index, co)

    print('Training Index')
    np.random.seed(args.seed)
    random_sample = np.random.choice(np.arange(vals.shape[0]), size=[min(1000000, vals.shape[0])], replace=False)
    start = time.time()
    # Faiss does not handle adding keys in fp16 as of writing this.
    # gpu_index.train(keys[random_sample].astype(np.float32))
    print(random_sample[:10])
    print(keys[random_sample][:10])
    gpu_index.train(keys[random_sample].astype(np.float32))
    print('Training took {} s'.format(time.time() - start))

    print('Writing index after training')
    start = time.time()
    faiss.write_index(faiss.index_gpu_to_cpu(gpu_index), args.faiss_index + ".trained")
    print('Writing index took {} s'.format(time.time() - start))

print('Adding Keys')
index = faiss.read_index(args.faiss_index + ".trained")
co = faiss.GpuClonerOptions()
co.useFloat16 = True
gpu_index = faiss.index_cpu_to_gpu(res, 0, index, co)
start = args.starting_point
start_time = time.time()
num_keys_to_add_at_a_time = 500000
while start < args.dstore_size:
    end = min(args.dstore_size, start + num_keys_to_add_at_a_time)
    to_add = keys[start:end].copy()
    gpu_index.add_with_ids(to_add.astype(np.float32), np.arange(start, end))
    start += num_keys_to_add_at_a_time

    if (start % 1000000) == 0:
        print('Added %d tokens so far' % start)
        print('Writing Index', start)
        faiss.write_index(faiss.index_gpu_to_cpu(gpu_index), args.faiss_index)

print("Adding total %d keys" % end)
print('Adding took {} s'.format(time.time() - start_time))
print('Writing Index')
start = time.time()
faiss.write_index(faiss.index_gpu_to_cpu(gpu_index), args.faiss_index)
print('Writing index took {} s'.format(time.time() - start))
