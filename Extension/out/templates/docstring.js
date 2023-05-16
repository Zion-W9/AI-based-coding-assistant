"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateDocstring = void 0;
exports.templateDocstring = `
def add_binary(a, b):
    '''
    Returns the sum of two decimal numbers in binary digits.

    Parameters:
            a (int): A decimal integer
            b (int): Another decimal integer

    Returns:
            binary_sum (str): Binary string of the sum of a and b
    '''
    binary_sum = bin(a+b)[2:]
    return binary_sum

<INPUT>
`;
//# sourceMappingURL=docstring.js.map