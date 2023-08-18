# input: a list of code snippets
# output: a list of code snippets with LAST LINE deleted, and the origin snippet
import re


def delete_last_line(data):
    processed_data = []
    for s in data:
        if len(s) <= 512:
            indexes = [x.start() for x in re.finditer('\n', s)]
            if len(indexes)>1:
                deleted = s[:indexes[-2]+2]
                processed_data.append({'origin': s, 'deleted': deleted})
    return processed_data

