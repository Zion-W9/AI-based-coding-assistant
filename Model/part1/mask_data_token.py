# input: a list of code snippets
# output: a list of code snippets with FUNCTION NAME masked, and the mask
def mask_data_token(data):
    masked_data = []
    for s in data:
        if "(" in s and len(s)<=512: #make sure there is a function name in the code snippet and 512 is limited by model
            start = 4
            end = s.index('(')

            mask = s[start:end]
            s = "def <mask>" + s[end:]
            masked_data.append({'masked': s, 'mask': mask})

    return masked_data
