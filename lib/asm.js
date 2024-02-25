const lookAhead = (input, index, n) => input[index + n];
const isDigit = (x) => x >= '0' && x <= '9';
const isIdentifier = (x) => /^[a-zA-Z]+$/.test(x);
const isQuotation = (x) => ['\"'].includes(x);
const isNewline = (x) => /^[\n|\r\n]+$/.test(x);
const isInstructionValid = ([opcode, ...operands]) => opcode.type === 'identifier';
const isComment = (x) => x === ';';

function lexer(input) {
    const tokens = [];
    let currentIndex = 0;
    let insideComment = false;

    while (currentIndex < input.length) {
        const char = input[currentIndex];

        if (isDigit(char)) {
            let i = 1;
            let digits = char;

            while (i < input.length) {
                const next = lookAhead(input, currentIndex, i);
                if (isDigit(next)) {
                    digits += next;
                } else {
                    break;
                }
                i++;
            }

            tokens.push({ type: 'integer', value: Number(digits) });
            currentIndex += digits.length;
        } else if (isIdentifier(char)) {
            let i = 1;
            let word = char;

            while (i < input.length) {
                const next = lookAhead(input, currentIndex, i);
                if (isIdentifier(next)) {
                    word += next;
                } else {
                    break;
                }
                i++;
            }

            tokens.push({ type: 'identifier', value: word });
            currentIndex += word.length;
        } else if (isQuotation(char)) {
            let i = 1;
            let value = "";
            const quotes = [char];

            while (i < input.length) {
                const next = lookAhead(input, currentIndex, i);
                if (isQuotation(next)) {
                    quotes.push(next);
                    break;
                }

                value += next;
                i++;
            }

            if (quotes.length == 2) {
                tokens.push({ type: 'string', value });
                currentIndex += value.length + 2;
            } else {
                throw new Error("Failed to lex a string");
            }
        } else if (isComment(char)) {
            let i = 1;
            while (i < input.length) {
                const next = lookAhead(input, currentIndex, i);
                if (isNewline(next)){
                    break;
                }
                i++;
            }
            currentIndex += i;
        } else if (isNewline(char)) {
            tokens.push({ type: 'newline' });
            currentIndex++;
        } else {
            currentIndex++;
        }
    }

    return tokens;
}

function parser(tokens) {
    const instructions = [];
    let instruction = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === 'newline') {
            if (instruction.length > 0) {
                if (!isInstructionValid(instruction)) {
                    throw new Error("Could not parse instruction");
                }

                const [opcode, ...operands] = instruction;
                instructions.push({ opcode: opcode.value, operands });
                instruction = [];
            }
        } else {
            instruction.push(token);
        }
    }

    return instructions;
}

function eval(ctx, instructions) {
    for (let i = 0; i < instructions.length; i++) {
        const { opcode, operands } = instructions[i];

        const instruction = ctx.instructions[opcode];
        if (!instruction) {
            throw new Error(`Undefined opcode '${opcode}'`);
        }

        const valid = operands.length === instruction.nArgs
            && instruction.types.reduce((a, c, i) => a && (c === "*" || c === operands[i].type, true), []);

        if (!valid) {
            throw new Error(`opcode '${opcode}' called with incorrect number of arguments, or incorrect type`);
        }

        instruction.f(ctx, ...operands);
    }
}

module.exports = {
    lexer,
    parser,
    eval
};
