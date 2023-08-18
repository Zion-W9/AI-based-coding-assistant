#!/usr/bin/env bash

module load generic

CONDA_BASE=$(conda info --base)
source $CONDA_BASE/etc/profile.d/conda.sh

conda activate ssr

sbatch cpu.job

conda deactivate
