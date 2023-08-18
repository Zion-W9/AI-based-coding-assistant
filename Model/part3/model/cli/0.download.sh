#!/usr/bin/env bash

# This file is used to download data and model.

export PYTHONIOENCODING=utf-8
#HOME_DIR=$(realpath ..)
CLI_PATH=$(pwd)
DATA_PATH=$CLI_PATH/data
MODEL_PATH=$CLI_PATH/model
OUT_PATH=$CLI_PATH/out
mkdir -p $DATA_PATH/mix
mkdir -p $MODEL_PATH

function download_csn_data() {

    echo "Downloading CSN dataset"
    FILE=code-to-text.zip
    FIELD='1m1IvGgPhDBg-SL-LajtFGTLyAJVbD0i3'
    # https://drive.google.com/file/d/1m1IvGgPhDBg-SL-LajtFGTLyAJVbD0i3
    if [[ ! -d $DATA_PATH/csn ]]; then
        python3 $CLI_PATH/download.py --field $FIELD --output $FILE
        unzip ${FILE} && rm ${FILE}
        mv code-to-text $DATA_PATH/csn
    else
        echo "$FILE already exists, skip downloading"
    fi

}

function download_mix_data() {

    echo "Downloading MIX-Java dataset"
    FILE=java.zip
    FIELD='13o4MiELiQoomlly2TCTpbtGee_HdQZxl'
    # https://drive.google.com/open?id=13o4MiELiQoomlly2TCTpbtGee_HdQZxl
    if [[ ! -d $DATA_PATH/mix/java ]]; then
        python3 $CLI_PATH/download.py --field $FIELD --output $FILE
        unzip $FILE -d java && rm $FILE
        mv java $DATA_PATH/mix/java
    else
        echo "$FILE already exists, skip downloading"
    fi

    echo "Downloading MIX-Python dataset"
    FILE=python.zip
    FIELD='1XPE1txk9VI0aOT_TdqbAeI58Q8puKVl2'
    # https://drive.google.com/open?id=1XPE1txk9VI0aOT_TdqbAeI58Q8puKVl2
    if [[ ! -d $DATA_PATH/mix/python ]]; then
        python3 $CLI_PATH/download.py --field $FIELD --output $FILE
        unzip $FILE -d python && rm $FILE
        mv python $DATA_PATH/mix/python
    else
        echo "$FILE already exists, skip downloading"
    fi

}

function download_model() {

    echo "Downloading PLBART Model"
    FILE=plbart_base.pt
    FIELD='19OLKx0YY0yVorzZa-caFW0-hALVvX7gt'
    # https://drive.google.com/file/d/19OLKx0YY0yVorzZa-caFW0-hALVvX7gt
    if [[ ! -f $MODEL_PATH/plbart_base.pt ]]; then
        python3 $CLI_PATH/download.py --field $FIELD --output $FILE
        mv $FILE $MODEL_PATH
    else
        echo "$FILE already exists, skip downloading"
    fi

}

download_csn_data
download_mix_data
download_model
