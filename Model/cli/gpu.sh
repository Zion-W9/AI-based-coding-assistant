#!/usr/bin/env bash

module load volta nvidia/cuda10.2-cudnn7.6.5
# module load volta nvidia/cuda11.2-cudnn8.1.0

# module load vesta nvidia/cuda10.2-cudnn7.6.5

CONDA_BASE=$(conda info --base)
source $CONDA_BASE/etc/profile.d/conda.sh

conda activate ssr

sbatch gpu.job

conda deactivate
