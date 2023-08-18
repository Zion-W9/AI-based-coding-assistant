# replace random token in the code to <mask0>
import json
import random
import re


def mask_rand(line):
    replace_to = '<mask0>'

    line = line.replace("<EOL>", '\n')
    line = line.replace("<s>", '\n')
    line = line.replace("</s>", '')
    lines = line.splitlines(True)

    num_rows = len(lines)
    token_masked = False
    token = ''
    rand_time = 5
    while not token_masked and rand_time > 0:
        rand_time -= 1
        row_idx = random.randint(0, num_rows - 1)
        row = lines[row_idx].split()
        num_tokens = len(row)
        if num_tokens != 0:
            token_idx = random.randint(0, num_tokens - 1)
            token = row[token_idx]
            if re.search("[a-z]", token) and token != '<STR_LIT>':
                lines[row_idx] = lines[row_idx].replace(token, replace_to)
                token_masked = True

    line = ''
    for l in lines:
        line = line + l

    return line, token


with open("test1.txt", "r") as f:
    for line in f:
        line, gt = mask_rand(line)
        test_dict = {"input": line, "gt": gt}
        with open("test1.json", "a") as f2:
            if gt != '':
                f2.write(json.dumps(test_dict) + '\n')
