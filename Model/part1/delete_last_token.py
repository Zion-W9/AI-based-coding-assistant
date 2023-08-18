# input: a list of code snippets
# output: a list of code lines with LAST TOKEN deleted, and the origin line
import re


def delete_last_token(data):
    processed_data = []
    for s in data:
        while '\n' in s and len(s) <=512:
            i = s.find('\n')
            sentence = s[:i]
            s = s[i+2:]
            if ' ' in sentence:
                j = sentence.rfind(' ')
                deleted = sentence[:j]
                processed_data.append({'origin': sentence, 'deleted': deleted})

    return processed_data
