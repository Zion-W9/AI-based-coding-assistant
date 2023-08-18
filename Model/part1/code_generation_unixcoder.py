# implementation of code generation with unixcoder and output the accurate rate
import torch
from unixcoder import UniXcoder
from progress_bar import progress_bar


def code_generation_unixcoder(data_to_do):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = UniXcoder("microsoft/unixcoder-base")
    model.to(device)

    context = """
    def <mask0>(data,file_path):
        data = json.dumps(data)
        with open(file_path, 'w') as f:
            f.write(data)
    """

    for s in data_to_do:
        s['masked'].replace('<mask>', '<mask0>')

    num_correct = 0
    for i in range(len(data_to_do)):
        context = data_to_do[i]
        tokens_ids = model.tokenize([context['masked']], max_length=512, mode="<encoder-decoder>")
        source_ids = torch.tensor(tokens_ids).to(device)
        prediction_ids = model.generate(source_ids, decoder_only=False, beam_size=3, max_length=128)
        predictions = model.decode(prediction_ids)
        predictions = [x.replace("<mask0>", "").strip() for x in predictions[0]]
        for o in predictions:
            if o == data_to_do[i]['mask']:
                num_correct = num_correct + 1
                break

        progress_bar(i, len(data_to_do))

    print("accurate rate:", round(100 * num_correct / len(data_to_do), 2), "%")