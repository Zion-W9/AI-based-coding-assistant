# # implementation of code completion with codegpt and output the accurate rate
import torch
from transformers import pipeline
from progress_bar import progress_bar
from transformers import AutoTokenizer, AutoModelForCausalLM


def code_completion_codegen(data_to_do):
    device = torch.device("cuda")
    # torch.set_default_tensor_type(torch.cuda.FloatTensor)
    model = AutoModelForCausalLM.from_pretrained("Salesforce/codegen-350M-mono")
    # model.to(device)
    tokenizer = AutoTokenizer.from_pretrained("Salesforce/codegen-350M-mono")
    text_generation = pipeline('text-generation', model=model, tokenizer=tokenizer, batch_size=1)
    num_correct = 0
    for i in range(len(data_to_do)):
        completed = text_generation(data_to_do[i]['deleted'], max_length=1024)
        if completed == data_to_do[i]['origin']:
            num_correct = num_correct + 1

        progress_bar(i, len(data_to_do))

    print("accurate rate:", round(100 * num_correct / len(data_to_do), 2), "%")