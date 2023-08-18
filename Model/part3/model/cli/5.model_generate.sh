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
if [[ $CORPUS == 'csn' ]]; then
    GROUND_TRUTH_FILE=$DATA_FOLDER/test.jsonl
else
    GROUND_TRUTH_FILE=$DATA_FOLDER/test/javadoc.original
fi

function generate_mt() {

    FILE_PREF=$SAVE_FOLDER/output_mt
    RESULT_FILE=$SAVE_FOLDER/result_mt.txt

    fairseq-generate $BIN_FOLDER/data-bin \
        --user-dir $CLI_PATH \
        --langs $LANGS \
        --gen-subset test \
        --path $SAVE_FOLDER/checkpoint_best.pt \
        --task translation_from_pretrained_bart \
        --source-lang $SOURCE \
        --target-lang $TARGET \
        --batch-size 32 \
        --beam 6 \
        --scoring sacrebleu \
        --remove-bpe 'sentencepiece' >$FILE_PREF

    cat $FILE_PREF | grep -P "^H" | sort -V | cut -f 3- | sed 's/\[$TARGET\]//g' >$FILE_PREF.hyp
    if [[ $CORPUS == 'csn' ]]; then
        python3 $CLI_PATH/nl_eval.py --json_refs \
            --prediction_file $FILE_PREF.hyp \
            --reference_file $GROUND_TRUTH_FILE 2>&1 | tee $RESULT_FILE
    else
        python3 $CLI_PATH/nl_eval.py \
            --prediction_file $FILE_PREF.hyp \
            --reference_file $GROUND_TRUTH_FILE 2>&1 | tee $RESULT_FILE
    fi

}

function generate_kmt() {

    FILE_PREF=$SAVE_FOLDER/output_kmt_${MODE}
    RESULT_FILE=$SAVE_FOLDER/result_kmt_${MODE}.txt

    python3 $CLI_PATH/generate.py $BIN_FOLDER/data-bin \
        --user-dir $CLI_PATH \
        --langs $LANGS \
        --gen-subset test \
        --path $SAVE_FOLDER/checkpoint_best.pt \
        --task translation_from_pretrained_bart \
        --source-lang $SOURCE \
        --target-lang $TARGET \
        --batch-size 32 \
        --beam 6 \
        --min-len 4 \
        --scoring sacrebleu \
        --remove-bpe 'sentencepiece' \
        --model-overrides "{'use_knn_datastore': True, 'dstore_filename': '$DATASTORE_FOLDER',
        'dstore_size': $DATASTORE_SIZE, 'dstore_fp16': True, 'use_gpu_to_search': True, 'move_dstore_to_mem': True,
        'k': 1, 'probe': 32, 'knn_lambda': 0.2, 'knn_temperature': 10, 'knn_sim_metric': 'IP', }" >$FILE_PREF

    cat $FILE_PREF | grep -P "^H" | sort -V | cut -f 3- | sed 's/\[$TARGET\]//g' >$FILE_PREF.hyp
    if [[ $CORPUS == 'csn' ]]; then
        python3 $CLI_PATH/nl_eval.py --json_refs \
            --prediction_file $FILE_PREF.hyp \
            --reference_file $GROUND_TRUTH_FILE 2>&1 | tee $RESULT_FILE
    else
        python3 $CLI_PATH/nl_eval.py \
            --prediction_file $FILE_PREF.hyp \
            --reference_file $GROUND_TRUTH_FILE 2>&1 | tee $RESULT_FILE
    fi

}

function generate_amt() {

    FILE_PREF=$ADA_FOLDER/output_amt
    RESULT_FILE=$ADA_FOLDER/result_amt.txt

    python3 $CLI_PATH/generate.py $BIN_FOLDER/data-bin \
        --user-dir $CLI_PATH \
        --langs $LANGS \
        --gen-subset test \
        --path $ADA_FOLDER/checkpoint_best.pt \
        --task translation_from_pretrained_bart \
        --source-lang $SOURCE \
        --target-lang $TARGET \
        --batch-size 32 \
        --beam 6 \
        --min-len 4 \
        --scoring sacrebleu \
        --remove-bpe 'sentencepiece' \
        --model-overrides "{'use_knn_datastore': True, 'dstore_filename': '$DATASTORE_FOLDER',
        'dstore_size': $DATASTORE_SIZE, 'dstore_fp16': True, 'use_gpu_to_search': True, 'move_dstore_to_mem': True,
        'k': 1, 'probe': 32, 'knn_lambda': 0.2, 'knn_temperature': 10, 'knn_sim_metric': 'IP', }" >$FILE_PREF

    cat $FILE_PREF | grep -P "^H" | sort -V | cut -f 3- | sed 's/\[$TARGET\]//g' >$FILE_PREF.hyp
    if [[ $CORPUS == 'csn' ]]; then
        python3 $CLI_PATH/nl_eval.py --json_refs \
            --prediction_file $FILE_PREF.hyp \
            --reference_file $GROUND_TRUTH_FILE 2>&1 | tee $RESULT_FILE
    else
        python3 $CLI_PATH/nl_eval.py \
            --prediction_file $FILE_PREF.hyp \
            --reference_file $GROUND_TRUTH_FILE 2>&1 | tee $RESULT_FILE
    fi

}

generate_mt
# generate_kmt
# generate_amt
