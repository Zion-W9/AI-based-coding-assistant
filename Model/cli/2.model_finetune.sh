#!/usr/bin/env bash

export PYTHONIOENCODING=utf-8
#HOME_DIR=$(realpath ..)
CLI_PATH=$(pwd)
DATA_PATH=$CLI_PATH/data
MODEL_PATH=$CLI_PATH/model
OUT_PATH=$CLI_PATH/out

SOURCE=$1
CORPUS=$2
LEVEL=${3:-full}
TARGET=en_XX
LANGS=java,python,en_XX

BIN_FOLDER=$OUT_PATH/$CORPUS/$SOURCE
SAVE_FOLDER=$OUT_PATH/$CORPUS/${LEVEL}_base_${SOURCE}_${TARGET}
SPM_FOLDER=$CLI_PATH/sentencepiece
mkdir -p $SAVE_FOLDER

function finetune() {

    fairseq-train $BIN_FOLDER/data-bin \
        --user-dir $CLI_PATH \
        --arch mbart_base \
        --langs $LANGS \
        --task translation_from_pretrained_bart \
        --restore-file $MODEL_PATH/plbart_base.pt \
        --bpe 'sentencepiece' \
        --sentencepiece-model $SPM_FOLDER/sentencepiece.bpe.model \
        --layernorm-embedding \
        --source-lang $SOURCE \
        --target-lang $TARGET \
        --criterion label_smoothed_cross_entropy \
        --label-smoothing 0.1 \
        --batch-size 32 \
        --batch-size-valid 32 \
        --max-epoch 50 \
        --optimizer adam \
        --adam-eps 1e-06 \
        --adam-betas '(0.9, 0.98)' \
        --lr-scheduler polynomial_decay \
        --lr 5e-05 \
        --warmup-updates 1000 \
        --seed 42 \
        --patience 5 \
        --log-format json \
        --log-interval 100 \
        --reset-optimizer \
        --reset-meters \
        --reset-dataloader \
        --reset-lr-scheduler \
        --eval-bleu \
        --eval-bleu-detok space \
        --eval-tokenized-bleu \
        --eval-bleu-remove-bpe sentencepiece \
        --eval-bleu-args '{"beam": 6}' \
        --best-checkpoint-metric bleu \
        --maximize-best-checkpoint-metric \
        --no-epoch-checkpoints \
        --ddp-backend no_c10d \
        --save-dir $SAVE_FOLDER \
        2>&1 | tee $SAVE_FOLDER/finetune.log

}

finetune
