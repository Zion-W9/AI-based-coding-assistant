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
MODE=${4:-normal}
TARGET=en_XX
LANGS=java,python,en_XX

DATA_FOLDER=$DATA_PATH/$CORPUS/$SOURCE
MEMO_FOLDER=$OUT_PATH/csn/$SOURCE
WORK_FOLDER=$OUT_PATH/$CORPUS/$SOURCE

BIN_FOLDER=$WORK_FOLDER
MEMO_DATASTORE_SIZE=$(wc -w $MEMO_FOLDER/train.spm.en_XX | cut -d' ' -f1)
WORK_DATASTORE_SIZE=$(wc -w $WORK_FOLDER/train.spm.en_XX | cut -d' ' -f1)
NORMAL_DATASTORE_FOLDER=$WORK_FOLDER/${LEVEL}_datastore
SHARED_DATASTORE_FOLDER=$WORK_FOLDER/${LEVEL}_shared_datastore
MERGED_DATASTORE_FOLDER=$WORK_FOLDER/${LEVEL}_merged_datastore

if [[ $MODE == 'shared' ]]; then
    # for the shared mode
    DATASTORE_SIZE=$MEMO_DATASTORE_SIZE
    DATASTORE_FOLDER=$SHARED_DATASTORE_FOLDER
elif [[ $MODE == 'merged' ]]; then
    # for the merged mode
    DATASTORE_SIZE=$(($WORK_DATASTORE_SIZE+$MEMO_DATASTORE_SIZE))
    DATASTORE_FOLDER=$MERGED_DATASTORE_FOLDER
else
    # for the normal mode
    DATASTORE_SIZE=$WORK_DATASTORE_SIZE
    DATASTORE_FOLDER=$NORMAL_DATASTORE_FOLDER
fi

SAVE_FOLDER=$OUT_PATH/$CORPUS/${LEVEL}_base_${SOURCE}_${TARGET}
ADA_FOLDER=$OUT_PATH/$CORPUS/${LEVEL}_ada_${MODE}_${SOURCE}_${TARGET}
SPM_FOLDER=$CLI_PATH/sentencepiece
mkdir -p $ADA_FOLDER
if [[ $CORPUS == 'csn' ]]; then
    GROUND_TRUTH_FILE=$DATA_FOLDER/test.jsonl
else
    GROUND_TRUTH_FILE=$DATA_FOLDER/test/javadoc.original
fi

function adaption() {

    fairseq-train $BIN_FOLDER/data-bin \
        --user-dir $CLI_PATH \
        --arch mbart_base \
        --langs $LANGS \
        --task translation_from_pretrained_bart \
        --restore-file $SAVE_FOLDER/checkpoint_best.pt \
        --bpe 'sentencepiece' \
        --sentencepiece-model $SPM_FOLDER/sentencepiece.bpe.model \
        --layernorm-embedding \
        --source-lang $SOURCE \
        --target-lang $TARGET \
        --criterion label_smoothed_cross_entropy \
        --label-smoothing 0.1 \
        --batch-size 32 \
        --batch-size-valid 32 \
        --max-epoch 1 \
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
        --save-dir $ADA_FOLDER \
        --partially-finetune \
        --dstore-size $DATASTORE_SIZE \
        --dstore-filename $DATASTORE_FOLDER \
        --dstore-fp16 \
        --use-knn-datastore \
        --use-gpu-to-search \
        --move-dstore-to-mem \
        --k 2 \
        --knn-lambda 0.5 \
        --knn-temperature 10 \
        --knn-sim-metric IP \
        2>&1 | tee $ADA_FOLDER/finetune.log

}

adaption
