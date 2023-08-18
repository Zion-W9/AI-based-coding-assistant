# Replace the last token with <mask0>
import re
import json

with open("test2.txt", "r") as f:
    replace_to = '<mask0>'
    for line in f:
        line = line.replace("<EOL>", '\n')
        line = line.replace("<s>", '\n')
        line = line.replace("</s>", '')

        idx_r = -1
        idx_l = -1
        for i in range(len(line)):
            if line[idx_r] != " ":
                idx_r = idx_r - 1
            idx_l = idx_l - 1

            if idx_l < -1*len(line): # in case of going out
                gt = ''
                break

            if line[idx_r] == " " and line[idx_l] == " ":
                if re.search("[a-z]", line[idx_l:idx_r]):
                    gt = line[idx_l+1:idx_r]
                    line = line[:idx_l + 1] + replace_to + line[idx_r:]
                    break
                else:
                    idx_r = idx_l
        test_dict = {"input": line, "gt": gt}
        with open("test.json", "a") as f2:
            if gt != '':
                f2.write(json.dumps(test_dict) + '\n')
