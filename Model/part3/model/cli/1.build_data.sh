#!/usr/bin/env bash

export PYTHONIOENCODING=utf-8
#HOME_DIR=$(realpath ..)
#使用${}作为单词边界。使用${}作为单词边界。
CLI_PATH=$(pwd)
DATA_PATH=$CLI_PATH/data
MODEL_PATH=$CLI_PATH/model
OUT_PATH=$CLI_PATH/out

LANG=$1
CORPUS=$2

BIN_FOLDER=$OUT_PATH/$CORPUS/$LANG
DATA_FOLDER=$DATA_PATH/$CORPUS/$LANG
SPM_FOLDER=$CLI_PATH/sentencepiece
mkdir -p $OUT_PATH/$CORPUS/$LANG

function spm_preprocess_csn() {

    for SPLIT in train valid test; do
        if [[ ! -f $BIN_FOLDER/$SPLIT.spm.$LANG ]]; then
          #tgt is the input to decoder
            if [[ $SPLIT == 'test' ]]; then
                MAX_TGT_LEN=1000 # we do not truncate test sequences
            elif [[ $LANG == 'java' ]]; then
                MAX_TGT_LEN=100
            else
                MAX_TGT_LEN=80
            fi
            #src is the input to encoder
            if [[ $LANG == 'java' ]]; then
                MAX_SRC_LEN=400
            else
                MAX_SRC_LEN=300
            fi
            if [[ $LANG == 'java' ]]; then
                SRC_FIELD='code_tokens'
            else
                SRC_FIELD='code'
            fi
            #这些命令都是Jian自己定义的，在encode_csn里
            python encode_csn.py \
                --model-file $SPM_FOLDER/sentencepiece.bpe.model \
                --input_file $DATA_FOLDER/$SPLIT.jsonl \
                --output_dir $BIN_FOLDER \
                --src_field $SRC_FIELD \
                --tgt_field docstring_tokens \
                --src_lang $LANG \
                --tgt_lang en_XX \
                --pref $SPLIT \
                --max_src_len $MAX_SRC_LEN \
                --max_tgt_len $MAX_TGT_LEN \
                --workers 60
        fi
    done

}

function spm_preprocess_mix() {

    for SPLIT in train valid test; do
        if [[ ! -f $BIN_FOLDER/$SPLIT.spm.$LANG ]]; then
            if [[ $SPLIT == 'test' ]]; then
                MAX_TGT_LEN=1000 # we do not truncate test sequences
            elif [[ $LANG == 'java' ]]; then
                MAX_TGT_LEN=100
            else
                MAX_TGT_LEN=80
            fi
            if [[ $LANG == 'java' ]]; then
                MAX_SRC_LEN=400
            else
                MAX_SRC_LEN=300
            fi
            if [[ $SPLIT == 'valid' ]]; then
                ALIAS='dev'
            else
                ALIAS=$SPLIT
            fi
            python encode_mix.py \
                --model-file $SPM_FOLDER/sentencepiece.bpe.model \
                --src_input_file $DATA_FOLDER/$ALIAS/code.original_subtoken \
                --tgt_input_file $DATA_FOLDER/$ALIAS/javadoc.original \
                --output_dir $BIN_FOLDER \
                --src_lang $LANG \
                --tgt_lang en_XX \
                --pref $SPLIT \
                --max_src_len $MAX_SRC_LEN \
                --max_tgt_len $MAX_TGT_LEN \
                --workers 60
        fi
    done

}

function binarize() {

    if [[ ! -d $BIN_FOLDER/data-bin ]]; then
      # fairseq-preprocess: Data pre-processing: build vocabularies and binarize training data
        fairseq-preprocess \
            --source-lang $LANG \
            --target-lang en_XX \
            --trainpref $BIN_FOLDER/train.spm \
            --validpref $BIN_FOLDER/valid.spm \
            --testpref $BIN_FOLDER/test.spm \
            --destdir $BIN_FOLDER/data-bin \
            --thresholdtgt 0 \
            --thresholdsrc 0 \
            --workers 60 \
            --srcdict $SPM_FOLDER/dict.txt \
            --tgtdict $SPM_FOLDER/dict.txt
    fi

}

if [[ $CORPUS == 'csn' ]]; then
    spm_preprocess_csn
else
    spm_preprocess_mix
fi
binarize
