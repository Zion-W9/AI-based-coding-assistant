import subprocess
from tqdm import tqdm
from prettytable import PrettyTable


def count_file_lines(file_path):
    """
    Counts the number of lines in a file using wc utility.
    :param file_path: path to file
    :return: int, no of lines
    """
    num = subprocess.check_output(['wc', '-l', file_path])
    num = num.decode('utf-8').split()
    return int(num[0])


def main():
    records = {'train': 0, 'valid': 0, 'test': 0}
    code_tokens = {'train': 0, 'valid': 0, 'test': 0}
    text_tokens = {'train': 0, 'valid': 0, 'test': 0}
    unique_code_tokens = {'train': set(), 'valid': set(), 'test': set()}
    unique_text_tokens = {'train': set(), 'valid': set(), 'test': set()}

    attribute_list = ["Records", "Code Tokens", "Text Tokens",
                      "Unique Code Tokens", "Unique Text Tokens"]

    def read_data(split):
        source = '%s/code.original_subtoken' % split
        target = '%s/javadoc.original' % split
        with open(source) as f1, open(target) as f2:
            for src, tgt in tqdm(zip(f1, f2),
                                 total=count_file_lines(source)):
                func_tokens = src.strip().split()
                comm_tokens = tgt.strip().split()
                records[split] += 1
                code_tokens[split] += len(func_tokens)
                text_tokens[split] += len(comm_tokens)
                unique_code_tokens[split].update(func_tokens)
                unique_text_tokens[split].update(comm_tokens)

    read_data('train')
    read_data('valid')
    read_data('test')

    table = PrettyTable()
    table.field_names = ["Attribute", "Train", "Valid", "Test", "Total"]
    table.align["Attribute"] = "l"
    table.align["Train"] = "r"
    table.align["Valid"] = "r"
    table.align["Test"] = "r"
    table.align["Total"] = "r"
    for attr in attribute_list:
        var = eval('_'.join(attr.lower().split()))
        val1 = len(var['train']) if isinstance(var['train'], set) else var['train']
        val2 = len(var['valid']) if isinstance(var['valid'], set) else var['valid']
        val3 = len(var['test']) if isinstance(var['test'], set) else var['test']
        total = val1 + val2 + val3
        table.add_row([attr, val1, val2, val3, total])

    avg = (code_tokens['train'] + code_tokens['valid'] + code_tokens['test']) / (
            records['train'] + records['valid'] + records['test'])
    table.add_row([
        'Avg. Code Length',
        '%.2f' % (code_tokens['train'] / records['train']),
        '%.2f' % (code_tokens['valid'] / records['valid']),
        '%.2f' % (code_tokens['test'] / records['test']),
        '%.2f' % avg
    ])
    avg = (text_tokens['train'] + text_tokens['valid'] + text_tokens['test']) / (
            records['train'] + records['valid'] + records['test'])
    table.add_row([
        'Avg. Text Length',
        '%.2f' % (text_tokens['train'] / records['train']),
        '%.2f' % (text_tokens['valid'] / records['valid']),
        '%.2f' % (text_tokens['test'] / records['test']),
        '%.2f' % avg
    ])
    print(table)


if __name__ == '__main__':
    main()
