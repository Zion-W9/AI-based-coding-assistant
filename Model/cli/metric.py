import numpy as np
from evaluate import load
from nlgeval import NLGEval


class Metric:
    @staticmethod
    def report(predictions, references):
        c_bleu_score, s_bleu_score = Metric.report_bleu(predictions, references)
        meteor_score = Metric.report_meteor(predictions, references)
        rouge_score = Metric.report_rouge(predictions, references)
        print(f'c_bleu = {c_bleu_score} | s_bleu = {s_bleu_score} | meteor = {meteor_score} | rouge = {rouge_score}')
        rouge_score_coco = Metric.report_rouge_coco(predictions, references)
        print(f'rouge_coco = {rouge_score_coco}')
        return c_bleu_score, s_bleu_score, meteor_score, rouge_score

    @staticmethod
    def report_bleu(predictions, references):
        predictions = [prediction for prediction in predictions]
        references = [[reference] for reference in references]
        metric = load('bleu')
        corpus_bleu_score = metric.compute(predictions=predictions, references=references)['bleu']
        sum_sentence_bleu = 0.0
        for reference, prediction in zip(references, predictions):
            sum_sentence_bleu += metric.compute(predictions=[prediction], references=[reference], smooth=True)['bleu']
        sentence_bleu_score = sum_sentence_bleu / len(predictions)
        return round(corpus_bleu_score * 100, 2), round(sentence_bleu_score * 100, 2)

    @staticmethod
    def report_meteor(predictions, references, version=1.5):
        if version == 1.5:
            # version 1.5 https://aclanthology.org/W14-3348.pdf
            metric = NLGEval()
            meteor15_score = metric.compute_metrics([references], predictions)['METEOR']
            return round(meteor15_score * 100, 2)
        else:
            assert version == 1.0
            # version 1.0 https://aclanthology.org/W07-0734.pdf
            predictions = [prediction for prediction in predictions]
            references = [reference for reference in references]
            metric = load('meteor')
            meteor10_score = metric.compute(predictions=predictions, references=references)['meteor']
            return round(meteor10_score * 100, 2)

    @staticmethod
    def report_rouge(predictions, references):
        predictions = [prediction for prediction in predictions]
        references = [reference for reference in references]
        metric = load('rouge')
        rougeL_score = metric.compute(predictions=predictions, references=references)['rougeL']
        return round(rougeL_score * 100, 2)

    @staticmethod
    def report_rouge_coco(predictions, references):
        predictions = [[prediction] for prediction in predictions]
        references = [[reference] for reference in references]
        rougeL_score = Rouge().compute_score(predictions, references)
        return round(rougeL_score * 100, 2)


def my_lcs(string, sub):
    """
    Calculates longest common subsequence for a pair of tokenized strings
    :param string : list of str : tokens from a string split using whitespace
    :param sub : list of str : shorter string, also split using whitespace
    :returns: length (list of int): length of the longest common subsequence between the two strings
    Note: my_lcs only gives length of the longest common subsequence, not the actual LCS
    """
    if len(string) < len(sub):
        sub, string = string, sub

    lengths = [[0 for i in range(0, len(sub) + 1)] for j in range(0, len(string) + 1)]

    for j in range(1, len(sub) + 1):
        for i in range(1, len(string) + 1):
            if string[i - 1] == sub[j - 1]:
                lengths[i][j] = lengths[i - 1][j - 1] + 1
            else:
                lengths[i][j] = max(lengths[i - 1][j], lengths[i][j - 1])

    return lengths[len(string)][len(sub)]


class Rouge:
    '''
    Class for computing ROUGE-L score for a set of candidate sentences for the MS COCO test set
    '''

    def __init__(self):
        # vrama91: updated the value below based on discussion with Hovey
        self.beta = 1.2

    def calc_score(self, candidate, refs):
        """
        Compute ROUGE-L score given one candidate and references for an image
        :param candidate: str : candidate sentence to be evaluated
        :param refs: list of str : COCO reference sentences for the particular image to be evaluated
        :returns score: int (ROUGE-L score for the candidate evaluated against references)
        """
        assert (len(candidate) == 1)
        assert (len(refs) > 0)
        prec = []
        rec = []

        # split into tokens
        token_c = candidate[0].split(" ")

        for reference in refs:
            # split into tokens
            token_r = reference.split(" ")
            # compute the longest common subsequence
            lcs = my_lcs(token_r, token_c)
            prec.append(lcs / float(len(token_c)))
            rec.append(lcs / float(len(token_r)))

        prec_max = max(prec)
        rec_max = max(rec)

        if prec_max != 0 and rec_max != 0:
            score = ((1 + self.beta ** 2) * prec_max * rec_max) / float(rec_max + self.beta ** 2 * prec_max)
        else:
            score = 0.0
        return score

    def compute_score(self, res, gts):
        """
        Computes Rouge-L score given a set of reference and candidate sentences for the dataset
        Invoked by evaluate_captions.py
        :param gts: list : candidate / test sentences with "image name" key and "tokenized sentences" as values
        :param res: list : reference MS-COCO sentences with "image name" key and "tokenized sentences" as values
        :returns: average_score: float (mean ROUGE-L score computed by averaging scores for all the images)
        """
        rouge_scores = list()
        for hypo, ref in zip(res, gts):
            # Sanity check.
            assert (type(hypo) is list)
            assert (len(hypo) == 1)
            assert (type(ref) is list)
            assert (len(ref) > 0)

            rouge_score = self.calc_score(hypo, ref)
            rouge_scores.append(rouge_score)

        average_score = np.mean(np.array(rouge_scores))
        return average_score


if __name__ == '__main__':
    predictions = ["It is a guide to action which ensures that the military always obeys the commands of the party"]
    references = ["It is a guide to action that ensures that the military will forever heed Party commands"]
    Metric.report(predictions, references)
