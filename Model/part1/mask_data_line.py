# input: a list of code snippets
# output: a list of code snippets with FIRST LINE masked, and the mask

def mask_data_line(data):
    masked_data = []
    for s in data:
        if "\n" in s and len(s)<=512: #make sure there is a function name in the code snippet and 512 is limited by model
            end = s.index('\n')

            mask = s[:end+2]
            s = "<mask>" + s[end+2:]
            masked_data.append({'masked': s, 'mask': mask})

    return masked_data
