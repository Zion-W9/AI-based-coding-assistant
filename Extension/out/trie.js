"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trie = void 0;
const config = {
    END_WORD: "$",
    PERMS_MIN_LEN: 2,
};
class Trie {
    constructor(input) {
        this._trie = Trie._create(input);
    }
    getIndex() {
        return this._trie;
    }
    setIndex(trie) {
        this._trie = trie;
    }
    addWord(word) {
        const reducer = (previousValue, currentValue, currentIndex, array) => {
            return Trie._append(previousValue, currentValue, currentIndex, array);
        };
        const input = word /*.toLowerCase()*/
            .split("");
        input.reduce(reducer, this._trie);
        return this;
    }
    removeWord(word) {
        const { prefixFound, prefixNode } = Trie._checkPrefix(this._trie, word);
        if (prefixFound) {
            delete prefixNode[config.END_WORD];
        }
        return this;
    }
    getWords() {
        return Trie._recursePrefix(this._trie, "");
    }
    getPrefix(strPrefix) {
        // strPrefix = strPrefix.toLowerCase();
        if (!this._isPrefix(strPrefix)) {
            return [];
        }
        const { prefixNode } = Trie._checkPrefix(this._trie, strPrefix);
        return Trie._recursePrefix(prefixNode, strPrefix);
    }
    /**
     *
     *
     * @internal
     * @param {any} prefix
     * @returns
     *
     * @memberOf Trie
     */
    _isPrefix(prefix) {
        const { prefixFound } = Trie._checkPrefix(this._trie, prefix);
        return prefixFound;
    }
    /**
     *
     *
     * @internal
     * @static
     * @param {any} trie
     * @param {any} letter
     * @param {any} index
     * @param {any} array
     * @returns
     *
     * @memberOf Trie
     */
    static _append(trie, letter, index, array) {
        trie[letter] = trie[letter] || {};
        trie = trie[letter];
        if (index === array.length - 1) {
            trie[config.END_WORD] = 1;
        }
        return trie;
    }
    /**
     *
     *
     * @internal
     * @static
     * @param {any} prefixNode
     * @param {string} prefix
     * @returns
     *
     * @memberOf Trie
     */
    static _checkPrefix(prefixNode, prefix) {
        const input = prefix /*.toLowerCase()*/
            .split("");
        const prefixFound = input.every((letter, index) => {
            if (!prefixNode[letter]) {
                return false;
            }
            return (prefixNode = prefixNode[letter]);
        });
        return {
            prefixFound,
            prefixNode,
        };
    }
    /**
     *
     *
     * @internal
     * @static
     * @param {any} input
     * @returns
     *
     * @memberOf Trie
     */
    static _create(input) {
        const trie = (input || []).reduce((accumulator, item) => {
            item
                /*.toLowerCase()*/
                .split("")
                .reduce(Trie._append, accumulator);
            return accumulator;
        }, {});
        return trie;
    }
    /**
     *
     *
     * @internal
     * @static
     * @param {any} node
     * @param {any} prefix
     * @param {string[]} [prefixes=[]]
     * @returns
     *
     * @memberOf Trie
     */
    static _recursePrefix(node, prefix, prefixes = []) {
        let word = prefix;
        for (const branch in node) {
            if (branch === config.END_WORD) {
                prefixes.push(word);
                word = "";
            }
            Trie._recursePrefix(node[branch], prefix + branch, prefixes);
        }
        return prefixes.sort();
    }
}
exports.Trie = Trie;
//# sourceMappingURL=trie.js.map