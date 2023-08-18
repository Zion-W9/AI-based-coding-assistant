
import evaluate
import torch
import torch.nn as nn
import json

import bitsandbytes as bnb
from bitsandbytes.nn import Linear8bitLt
from fuzzywuzzy import fuzz
from unixcoder import UniXcoder


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = UniXcoder("microsoft/unixcoder-base")
test_file = 'test.json'

correct = 0
total = 0

predictions = []
references = []

with open(test_file) as f:
    for line in f:
        data = json.loads(line)
        context = data["input"]
        tokens_ids = model.tokenize([context], max_length=512, mode="<encoder-decoder>")
        source_ids = torch.tensor(tokens_ids).to(device)
        source_ids = torch.tensor(tokens_ids)
        prediction_ids = model.generate(source_ids, decoder_only=False, beam_size=3, max_length=128)
        unix_predictions = model.decode(prediction_ids)
        unix_predictions = [x.replace("<mask0>", "").strip() for x in unix_predictions[0]]

        # print("==========================================================")
        # print(data["gt"])
        # print([x.replace("<mask0>", "").strip() for x in predictions[0]])

        edit_sim = 0
        total = total + 1
        if data['gt'] in unix_predictions:
            correct = correct + 1
        edit_sims = [fuzz.ratio(pred, data['gt']) for pred in unix_predictions]
        edit_sim += max(edit_sims)

        predictions.append(context.replace('<mask0>', unix_predictions[0]))
        references.append(context.replace('<mask0>', data['gt']))

    acc = evaluate.load("accuracy")
    acc_results = acc.compute(predictions=predictions, references=references)
    print(acc_results)
    print("pass@3: ", correct/total*100, "%")
    print("Edit sim: ", edit_sim/total*100)
