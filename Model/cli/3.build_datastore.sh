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

MEMO_FOLDER=$OUT_PATH/csn/$SOURCE
WORK_FOLDER=$OUT_PATH/$CORPUS/$SOURCE
#DATASTORE_SIZE is the num of tokens of target training data
#DATASTORE_SIZE=2387231  # CSN Java
#DATASTORE_SIZE=3180390  # CSN Python
MEMO_DATASTORE_SIZE=$(wc -w $MEMO_FOLDER/train.spm.en_XX | cut -d' ' -f1)
WORK_DATASTORE_SIZE=$(wc -w $WORK_FOLDER/train.spm.en_XX | cut -d' ' -f1)
NORMAL_DATASTORE_FOLDER=$WORK_FOLDER/${LEVEL}_datastore
SHARED_DATASTORE_FOLDER=$WORK_FOLDER/${LEVEL}_shared_datastore
MERGED_DATASTORE_FOLDER=$WORK_FOLDER/${LEVEL}_merged_datastore
SAVE_FOLDER=$OUT_PATH/$CORPUS/${LEVEL}_base_${SOURCE}_${TARGET}

if [[ $MODE == 'shared' ]]; then
    # for the shared mode
    BIN_FOLDER=$MEMO_FOLDER
    DATASTORE_SIZE=$MEMO_DATASTORE_SIZE
    DATASTORE_FOLDER=$SHARED_DATASTORE_FOLDER
elif [[ $MODE == 'merged' ]]; then
    # for the merged mode
    # no need to define BIN_FOLDER
    DATASTORE_SIZE=$(($WORK_DATASTORE_SIZE+$MEMO_DATASTORE_SIZE))
    DATASTORE_FOLDER=$MERGED_DATASTORE_FOLDER
else
    # for the normal mode
    BIN_FOLDER=$WORK_FOLDER
    DATASTORE_SIZE=$WORK_DATASTORE_SIZE
    DATASTORE_FOLDER=$NORMAL_DATASTORE_FOLDER
fi

mkdir -p $DATASTORE_FOLDER

function build_datastore() {

    echo "Build Datastore"
    python3 $CLI_PATH/ds_build.py $BIN_FOLDER/data-bin \
        --langs $LANGS \
        --task translation_from_pretrained_bart \
        --train-subset train \
        --valid-subset train \
        --path $SAVE_FOLDER/checkpoint_best.pt \
        --dataset-impl mmap \
        --dstore-fp16 --dstore-size $DATASTORE_SIZE --dstore-mmap $DATASTORE_FOLDER \
        --max-tokens 4096 --decoder-embed-dim 768 --skip-invalid-size-inputs-valid-test

}

function merge_datastore() {

    echo "Merge Datastore"
    python3 $CLI_PATH/ds_merge.py \
        --memo_dstore_size $MEMO_DATASTORE_SIZE \
        --memo_dstore_mmap $SHARED_DATASTORE_FOLDER \
        --work_dstore_size $WORK_DATASTORE_SIZE \
        --work_dstore_mmap $NORMAL_DATASTORE_FOLDER \
        --dstore_size $DATASTORE_SIZE \
        --dstore_mmap $DATASTORE_FOLDER \
        --dimension 768 \
        --dstore_fp16

}

function build_index() {

    echo "Build Faiss Index"
    python3 $CLI_PATH/ds_train.py \
        --dstore_fp16 --dstore_size $DATASTORE_SIZE --dstore_mmap $DATASTORE_FOLDER \
        --faiss_index $DATASTORE_FOLDER/knn_index \
        --ncentroids 4096 --dimension 768 --probe 32

}

if [[ $MODE == 'merged' ]]; then
    merge_datastore
    build_index
else
    build_datastore
    build_index
fi
