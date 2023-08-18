from tree_sitter import Language, Parser
import json

# This code is to preprocess dataset by specific meaning of tokens.

def mask_code(src_string, mask_token='<mask0>', mask_which='function_call',  do_how='mask'):
    # INPUT:
    #   src_string: code to be modified by replacing some token with the mask_token
    #   mask_which: "function_name" or "function_call"
    #   mask_token: what to replace the masked token with
    #   do_how: 'mask', mask token; 'prefix', do prefix

    Language.build_library(
        # Store the library in the `build` directory
        'build/my-languages.so',

        # Include one or more languages
        ['vendor/tree-sitter-python']
    )

    PY_LANGUAGE = Language('build/my-languages.so', 'python')

    parser = Parser()
    parser.set_language(PY_LANGUAGE)
    src = bytes(src_string, "utf8")
    tree = parser.parse(src)

    if mask_which == "function_name":
        query = PY_LANGUAGE.query("""
        (function_definition
            name: (identifier) @function.def)
        """)
    elif mask_which == "function_call":
        query = PY_LANGUAGE.query("""
        (call
            function: (identifier) @function.call)
        """)
    # elif mask_which == "operator":
    #     query = PY_LANGUAGE.query("""
    #     (comparison_operator
    #         () @operator)
    #     """)
    elif mask_which == "variable":
        query = PY_LANGUAGE.query("""
        (assignment
            left: (identifier) @variable)
        """)
    elif mask_which == "integer":
        query = PY_LANGUAGE.query("""
        (assignment
            right: (integer) @integer)
        """)
    elif mask_which == "argument":
        query = PY_LANGUAGE.query("""
                (argument_list (identifier) @argument
                    )
                """)

    masked_src = ''
    ground_truth = ''
    captures = query.captures(tree.root_node)

    if len(captures) > 0:
        start_row = captures[0][0].start_point[0]
        start_col = captures[0][0].start_point[1]
        end_row = captures[0][0].end_point[0]
        end_col = captures[0][0].end_point[1]

        end_point = captures[0][0].end_point

        src_lines = src_string.splitlines(True)
        assert start_row == end_row
        row = start_row

        if do_how == 'mask':
            ground_truth = src_lines[row][start_col:end_col]
            src_lines[row] = src_lines[row][:start_col] + mask_token + src_lines[row][end_col:]
            for src_line in src_lines:
                masked_src += src_line
        elif do_how == 'prefix':
            ground_truth = src_lines[row][start_col:]
            for src_line in src_lines[row+1:]:
                ground_truth += src_line
            src_lines[row] = src_lines[row][:start_col] + mask_token
            for src_line in src_lines[:row+1]:
                masked_src += src_line

    return masked_src, ground_truth


# Do
output_file = 'variable_pre.json'
mode = 'variable' # [function_name, function_call, variable, integer, argument]
mask_token = '<mask0>'
how = 'prefix'

with open("test2.txt", "r") as f:
    replace_to = '<mask0>'
    for line in f:
        line = line.replace("<EOL>", '\n')
        line = line.replace("<s>", '\n')
        line = line.replace("</s>", '')
        line, gt = mask_code(line, mask_token, mode, how)

        test_dict = {"input": line, "gt": gt}
        with open(output_file, "a") as f2:
            if gt != '':
                f2.write(json.dumps(test_dict) + '\n')
