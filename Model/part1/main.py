import torch
from import_data import import_data
from mask_data_token import mask_data_token
from mask_data_line import mask_data_line
from delete_last_line import delete_last_line
from delete_last_token import delete_last_token
from code_generation_codebert import code_generation_codebert
from code_completion_codegpt import code_completion_codegpt
from code_generation_unixcoder import code_generation_unixcoder
from code_completion_codegen import code_completion_codegen
from transformers import AutoTokenizer, AutoModelForCausalLM

# configuration
top_k = 1  # number of outputs
data_method = "delete-last-line"
do = dict(codebert=0, codegpt=0, unixcoder=0, codegen=1)

# prepare data
print('preparing data...')
data = import_data('dataset/')
if data_method == "mask-token":
    data_to_do = mask_data_token(data)
elif data_method == "mask-line":
    data_to_do = mask_data_line(data)
elif data_method == "delete-last-line":
    data_to_do = delete_last_line(data)
elif data_method == "delete-last-token":
    data_to_do = delete_last_token(data)
print('data preparing done!')

# code generation CodeBERT
if do['codebert']:
    print('completing code CodeBERT...')
    code_generation_codebert(data_to_do, top_k)

# code completion CodeGPT
if do['codegpt']:
    print('completing code CodeGPT...')
    code_completion_codegpt(data_to_do)

if do['unixcoder']:
    print('completing code UnixCoder...')
    code_generation_unixcoder(data_to_do)

if do['codegen']:
    print('completing code Codegen...')
    code_completion_codegen(data_to_do)