#!/usr/bin/env python
# Copyright (c) Facebook, Inc. and its affiliates.
# All rights reserved.
#
# This source code is licensed under the license found in the
# LICENSE file in the root directory of this source tree.

import argparse
import os
from tqdm import tqdm

from multiprocessing import Pool
import sentencepiece as spm


class MultiprocessingEncoder(object):

    def __init__(self, args):
        self.args = args

    def initializer(self):
        global sp
        sp = spm.SentencePieceProcessor(model_file=self.args.model_file)

    def _encode(self, line):
        global sp
        return sp.encode(line, out_type=str)

    def _decode(self, tokens):
        global sp
        return sp.decode(tokens)

    def encode(self, example):
        assert isinstance(example, dict)
        assert 'src' in example and 'tgt' in example
        if len(example['src']) == 0 and not self.args.keep_empty:
            return None
        if len(example['tgt']) == 0 and not self.args.keep_empty:
            return None
        src_tokens = self._encode(example['src'])[:self.args.max_src_len]
        tgt_tokens = self._encode(example['tgt'])[:self.args.max_tgt_len]
        return {'src': " ".join(src_tokens), 'tgt': " ".join(tgt_tokens)}


def load_data(src_input_file, tgt_input_file):
    data = []
    src_lines = list()
    tgt_lines = list()
    with open(src_input_file, 'r', encoding='utf-8') as f:
        for line in f:
            src_lines.append(line.strip())
    with open(tgt_input_file, 'r', encoding='utf-8') as f:
        for line in f:
            tgt_lines.append(line.strip())

    for src, tgt in zip(src_lines, tgt_lines):
        data.append({'src': src, 'tgt': tgt})

    return data


def process(args):
    dataset = load_data(args.src_input_file, args.tgt_input_file)

    encoder = MultiprocessingEncoder(args)
    pool = Pool(args.workers, initializer=encoder.initializer)

    processed_dataset = []
    with tqdm(total=len(dataset), desc='Processing') as pbar:
        for i, ex in enumerate(pool.imap(encoder.encode, dataset, 100)):
            pbar.update()
            processed_dataset.append(ex)

    out_src = os.path.join(args.output_dir, '{}.spm.{}'.format(args.pref, args.src_lang))
    out_tgt = os.path.join(args.output_dir, '{}.spm.{}'.format(args.pref, args.tgt_lang))
    with open(out_src, 'w', encoding='utf-8') as src_writer, \
            open(out_tgt, 'w', encoding='utf-8') as tgt_writer:
        for ex in processed_dataset:
            if ex is not None:
                src_writer.write(ex['src'] + '\n')
                tgt_writer.write(ex['tgt'] + '\n')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--model-file",
        help='path to *.model file',
    )
    parser.add_argument(
        "--src_input_file",
        type=str,
        default=['-'],
        help="input files of source data (lines) to filter/encode",
    )
    parser.add_argument(
        "--tgt_input_file",
        type=str,
        default=['-'],
        help="input files of target data (lines) to filter/encode",
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default=['_'],
        help="path of the output directory",
    )
    parser.add_argument(
        "--src_lang",
        type=str,
        default=['_'],
        help="name of the source language",
    )
    parser.add_argument(
        "--tgt_lang",
        type=str,
        default=['_'],
        help="name of the target language",
    )
    parser.add_argument(
        "--pref",
        type=str,
        default=['_'],
        help="file prefix",
    )
    parser.add_argument(
        "--keep-empty",
        action="store_true",
        help="keep empty lines",
    )
    # the maximum input or output length for PLBART is 512
    parser.add_argument("--max_src_len", type=int, default=512)
    parser.add_argument("--max_tgt_len", type=int, default=512)
    parser.add_argument("--workers", type=int, default=60)
    args = parser.parse_args()
    process(args)


if __name__ == "__main__":
    main()
