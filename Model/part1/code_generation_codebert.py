# implementation of code generation with codebert and output the accurate rate
from progress_bar import progress_bar
from transformers import RobertaTokenizer, RobertaForMaskedLM, pipeline


def code_generation_codebert(data_to_do, num_of_outputs):
    model = RobertaForMaskedLM.from_pretrained("microsoft/codebert-base-mlm")
    tokenizer = RobertaTokenizer.from_pretrained("microsoft/codebert-base-mlm")
    fill_mask = pipeline('fill-mask', model=model, tokenizer=tokenizer, top_k=num_of_outputs)
    num_correct = 0
    for i in range(len(data_to_do)):
        outputs = fill_mask(data_to_do[i]['masked'])
        for o in outputs:
            if o['token_str'] == data_to_do[i]['mask']:
                num_correct = num_correct + 1
                break

        progress_bar(i, len(data_to_do))

    print("accurate rate:", round(100 * num_correct / len(data_to_do), 2), "%")
