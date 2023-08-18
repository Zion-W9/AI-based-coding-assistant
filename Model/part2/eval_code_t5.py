from transformers import RobertaTokenizer, T5ForConditionalGeneration
import json

test_file = 'test1.json'
tokenizer = RobertaTokenizer.from_pretrained('Salesforce/codet5-small')
model = T5ForConditionalGeneration.from_pretrained('Salesforce/codet5-small')

correct = 0
total = 0

with open(test_file) as f:
    for line in f:
        data = json.loads(line)
        context = data["input"].replace('<mask0>', '<extra_id_0>')
        input_ids = tokenizer(context, return_tensors="pt").input_ids
        generated_ids = model.generate(input_ids, max_length=1024)
        prediction = tokenizer.decode(generated_ids[0], skip_special_tokens=True)

        # print("==========================================================")
        # print(data["gt"])
        # print([x.replace("<mask0>", "").strip() for x in predictions[0]])

        total = total + 1
        if data['gt'] == prediction:
            correct = correct + 1

    print("EM: ", correct/total*100, "%")
