# # implementation of code completion with codegpt and output the accurate rate
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM


def code_completion_codegpt(data_to_do):
    model = AutoModelForCausalLM.from_pretrained("microsoft/CodeGPT-small-py")
    tokenizer = AutoTokenizer.from_pretrained("microsoft/CodeGPT-small-py")
    text_generation = pipeline('text-generation', model=model, tokenizer=tokenizer)
    num_correct = 0
    for i in range(len(data_to_do)):
        completed = text_generation(data_to_do[i]['deleted'], max_length=1024)
        if completed == data_to_do[i]['origin']:
            num_correct = num_correct + 1

        progress_bar(i, len(data_to_do))

    print("accurate rate:", round(100 * num_correct / len(data_to_do), 2), "%")