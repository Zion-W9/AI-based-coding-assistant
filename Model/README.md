# SSR
Memory Augmentation Methods for Continuous Code Summarization

## Dependency

Please check `conda.yml` to install all dependencies

You need to install `torch-scatter`, `nlg-eval`, `rouge_score` manually 

Since we customized `fairseq==0.10.2`, it is recommended to install this repo using this command:

```
pip3 install --editable ./
```

## Implementation

There are two parts of implementation:
- the customized FairSeq, including `config`, `examples`, `fairseq` and `fairseq-cli` folders
- the scripts and code to use FairSeq, under the `cli` folder

Compared to `fairseq==0.10.2`, we made following changes:
- `fairseq/models/adaptive_block.py` (appended)
- `fairseq/models/transformer.py` (changed)
- `fairseq/modules/knn_datastore.py` (appended)
- `fairseq/options.py` (changed)
- `fairseq/tasks/translation_from_pretrained_bart.py` (changed)

## Guide (Step by Step)

### Pipeline

Go to the `cli` folder, you can see 6 scripts numbered from 0 to 5, corresponding to the main steps for experiments
They are the general pipeline for reproduce the experiments. We would adjust parameters for each research question
You could specify the steps to take in `cpu.job` and `gpu.job` separately (if you need to distinguish devices)

### Settings

There are 4 options to specify when we run scripts:
- `lang`, the valid values are (`java`, `python`)
- `corpus`, the valid values are (`csn`, `mix`)
- `level`, the valid values are (`full`, `half`, `4th`, `8th`, `zero`)
- `mode`, the valid values are (`normal`, `shared`, `merged`)

Script 0, no need to make any changes

Script 1, no need to make any changes

Script 2, we need to change `max-epoch` to different numbers manually, for different convergence level
- for the `full` case, keep the default `max-epoch=50`. It is enough for both `Java` and `Python`
- for the `zero` case, you could skip this finetune step, directly use the pretrained model checkpoint
- for other cases, make `max-epoch` be the specific epoch number needed, as shown below:

```
+----------+------+------+-----+-----+------+
|          | Full | Half | 4th | 8th | Zero |
+----------+------+------+-----+-----+------+
| Java     |   41 |   21 |  10 |   5 |    0 |
| Python   |   30 |   15 |   8 |   4 |    0 |
+----------+------+------+-----+-----+------+
```

Script 3, no need to make any changes

Script 4. we discuss for each occasion as follows:
- If it is for RQ1 or RQ2, you could skip it
- If it is for RQ3, no need to make any changes

Script 5, we discuss for each occasion as follows:
- for `generate_mt`, no need to make any changes
- for `generate_kmt`, we discuss for each occasion as follows:
  - If it is for RQ1, you might need to specify `k` or `knn_lambda`
  - If it is for RQ2, you might need to specify `knn_lambda`
  - If it is for RQ3, you need to specify `knn_lambda` for different `mode`, as shown below:
- for `generate_amt`, we discuss for each occasion as follows:
  - If it is for RQ1 or RQ2, you could skip it
  - If it is for RQ3, you need to specify `knn_lambda` for different `mode`, as shown below:

```
+------------+------+------+-----+-----+-------+
|            | Full | Half | 4th | 8th |  Zero |
+------------+------+------+-----+-----+-------+
| KNN-lambda |  0.2 |  0.2 | 0.5 | 0.8 | 0.999 |
+------------+------+------+-----+-----+-------+
```

Some tips:
- if we need to specify different adaptive blocks, go to edit `Line#701` in `fairseq/models/transformer.py`
- if we use CPU for Faiss retrieval, for example, when `mode=merged` the GPU memory would be exhausted:
  - in `generate_kmt` and `generate_amt`, disable `use_gpu_to_search` and `move_dstore_to_mem`
  - go to edit corresponding parts in `fairseq/modules/knn_datastore.py`
- if you run Script 3, 4 and 5, just make sure `level` and `mode` are correctly specified

## Outputs

We have collected our experiment logs and results:

- logs are uploaded to **`docs/logs`**
- results are uploaded to **`docs/results`**

You could reuse our datastores, checkpoints as well:

- [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.7047682.svg)](https://doi.org/10.5281/zenodo.7047682)

## Repo

The whole repo structure looks like this, when `max-depth=1`:

```markdown
**cli** our code and scripts
**config** required when you install this repo
**docs** our logs and results
**examples** required when you install this repo
**fairseq** our customized `fairseq`
**fairseq_cli** required when you install this repo
```

The working folder is `cli`, in experiments, following folders and files will be created:

```markdown
**data** for the datasets
----**csn** the placeholder directory for the csn data
----**sit** the placeholder directory for the sit data
**model** for the pretrained model
----`plbart_base.pt` it is the pretrained backbone model
**out** for the datastores and checkpints
----**csn** the placeholder directory for the csn experiments
----**sit** the placeholder directory for the sit experiments
```

## Data

Run the `download.sh` script inside the `cli` directory

### [MIX-Java](https://github.com/xing-hu/TL-CodeSum)

```
+--------------------+---------+---------+---------+----------+
| Attribute          |   Train |   Valid |    Test |    Total |
+--------------------+---------+---------+---------+----------+
| Records            |   69708 |    8714 |    8714 |    87136 |
| Code Tokens        | 8371911 | 1042466 | 1055733 | 10470110 |
| Text Tokens        | 1235295 |  155876 |  153407 |  1544578 |
| Unique Code Tokens |   36202 |   15317 |   15131 |    66650 |
| Unique Text Tokens |   28047 |    9555 |    9293 |    46895 |
| Avg. Code Length   |  120.10 |  119.63 |  121.15 |   120.16 |
| Avg. Text Length   |   17.72 |   17.89 |   17.60 |    17.73 |
+--------------------+---------+---------+---------+----------+
```

### [MIX-Python](https://github.com/EdinburghNLP/code-docstring-corpus)

```
+--------------------+---------+--------+--------+---------+
| Attribute          |   Train |  Valid |   Test |   Total |
+--------------------+---------+--------+--------+---------+
| Records            |   55538 |  18505 |  18502 |   92545 |
| Code Tokens        | 2670849 | 887331 | 882013 | 4440193 |
| Text Tokens        |  525524 | 175429 | 176673 |  877626 |
| Unique Code Tokens |  159968 |  73862 |  73766 |  307596 |
| Unique Text Tokens |   27197 |  14462 |  14530 |   56189 |
| Avg. Code Length   |   48.09 |  47.95 |  47.67 |   47.98 |
| Avg. Text Length   |    9.46 |   9.48 |   9.55 |    9.48 |
+--------------------+---------+--------+--------+---------+
```

### Acknowledgement

### About Data
There are various copies/versions of datasets on the web, and meanwhile, the raw data require additional preprocessing
To avoid confusion, we recommend the data pack used in `PLBART` and `NeuralCodeSum` for future study, like how we did
The data are already preprocessed and ready to experiments, and their statistics exactly fit those claimed in raw data

- Thank the authors of [PLBART](https://github.com/wasiahmad/PLBART) for sharing the **CSN** dataset
- Thank the authors of [NeuralCodeSum](https://github.com/wasiahmad/NeuralCodeSum) for sharing the **MIX** dataset

### About Implementation
Our implementation is inspired by `knn-lm` and `adaptive-knn-lm`

- Thank the authors of [knnlm](https://github.com/urvashik/knnlm) for sharing the implementation
- Thank the authors of [adaptive-knn-mt](https://github.com/zhengxxn/adaptive-knn-mt) for sharing the implementation
