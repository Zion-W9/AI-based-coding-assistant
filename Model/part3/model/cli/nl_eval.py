import json
import argparse
from metric import Metric


def collect_lines(prediction_file, reference_file, is_json_refs):
    with open(prediction_file, 'r', encoding='utf-8') as file:
        lines = file.readlines()
        lines = [line.strip().lower() for line in lines]
        prediction_lines = lines

    with open(reference_file, 'r', encoding='utf-8') as file:
        lines = file.readlines()
        lines = [line.strip().lower() for line in lines]
        if is_json_refs:
            lines = [' '.join(json.loads(line)['docstring_tokens']) for line in lines]
        reference_lines = lines

    assert len(prediction_lines) == len(reference_lines)
    return prediction_lines, reference_lines


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Evaluate leaderboard predictions for BigCloneBench dataset.')
    parser.add_argument('--prediction_file', help="filename of the predictions, in txt format.")
    parser.add_argument('--reference_file', help="filename of the references, in txt format.")
    parser.add_argument('--json_refs', action='store_true', help='reference files are in JSON')

    args = parser.parse_args()

    prediction_file = args.prediction_file
    reference_file = args.reference_file
    predictions, references = collect_lines(prediction_file, reference_file, args.json_refs)
    Metric.report(predictions, references)
