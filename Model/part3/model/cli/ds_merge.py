import argparse
import numpy as np

parser = argparse.ArgumentParser()

parser.add_argument('--memo_dstore_size', type=int, help='number of items saved in the datastore memmap')
parser.add_argument('--work_dstore_size', type=int, help='number of items saved in the datastore memmap')
parser.add_argument('--dstore_size', type=int, help='number of items saved in the datastore memmap')
parser.add_argument('--memo_dstore_mmap', type=str, help='memmap where keys and vals are stored')
parser.add_argument('--work_dstore_mmap', type=str, help='memmap where keys and vals are stored')
parser.add_argument('--dstore_mmap', type=str, help='memmap where keys and vals are stored')
parser.add_argument('--dimension', type=int, default=768, help='Size of each key')
parser.add_argument('--dstore_fp16', default=False, action='store_true')

args = parser.parse_args()

print(args)

memo_keys = np.memmap(args.memo_dstore_mmap + '/keys.npy', dtype=np.float16 if args.dstore_fp16 else np.float32,
                      mode='r', shape=(args.memo_dstore_size, args.dimension))
memo_vals = np.memmap(args.memo_dstore_mmap + '/vals.npy', dtype=np.int, mode='r', shape=(args.memo_dstore_size, 1))

work_keys = np.memmap(args.work_dstore_mmap + '/keys.npy', dtype=np.float16 if args.dstore_fp16 else np.float32,
                      mode='r', shape=(args.work_dstore_size, args.dimension))
work_vals = np.memmap(args.work_dstore_mmap + '/vals.npy', dtype=np.int, mode='r', shape=(args.work_dstore_size, 1))

if args.dstore_fp16:
    print('Saving fp16')
    dstore_keys = np.memmap(args.dstore_mmap + '/keys.npy', dtype=np.float16, mode='w+',
                            shape=(args.dstore_size, args.dimension))
    dstore_vals = np.memmap(args.dstore_mmap + '/vals.npy', dtype=np.int, mode='w+',
                            shape=(args.dstore_size, 1))
else:
    print('Saving fp32')
    dstore_keys = np.memmap(args.dstore_mmap + '/keys.npy', dtype=np.float32, mode='w+',
                            shape=(args.dstore_size, args.dimension))
    dstore_vals = np.memmap(args.dstore_mmap + '/vals.npy', dtype=np.int, mode='w+',
                            shape=(args.dstore_size, 1))

dstore_keys[:args.memo_dstore_size, :] = memo_keys
dstore_vals[:args.memo_dstore_size, :] = memo_vals

dstore_keys[args.memo_dstore_size:, :] = work_keys
dstore_vals[args.memo_dstore_size:, :] = work_vals

print('done.')
