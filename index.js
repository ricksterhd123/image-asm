const lookAhead = (input, index, n) => input[index + n];
const isDigit = (x) => x >= '0' && x <= '9';
const isIdentifier = (x) => /^[a-zA-Z]+$/.test(x);
const isWord = (x) => /^\w+$/.test(x);
const isQuotation = (x) => ['\"'].includes(x);
const isNewline = (x) => /^[\n|\r\n]+$/.test(x);
const isInstructionValid = ([opcode, ...operands]) => opcode.type === 'identifier';

// Really shoddy lexer just for simple assembler
// may include expressions later
function lexer(input) {
    const tokens = [];
    let currentIndex = 0;

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

const ctx = {
    registers: {},
    instructions: {
        'print': {
            nArgs: 1, types: ['*'], f: (ctx, x) => {
                if (x.type === 'identifier') {
                    console.log(ctx.registers[x.value]);
                } else {
                    console.log(x.value);
                }
            }
        },
        'set': {
            nArgs: 2, types: ['string', 'integer'], f: (ctx, op_name, op_value) => {
                ctx.registers[op_name.value] = op_value.value;
            }
        },
        'add': {
            nArgs: 2, types: ['string', 'integer'], f: (ctx, op_name, op_value) => {
                ctx.registers[op_name.value] += op_value.value;
            }
        }
    }
};

function eval(ctx, instructions) {
    for (let i = 0; i < instructions.length; i++) {
        const { opcode, operands } = instructions[i];

        const instruction = ctx.instructions[opcode];
        if (!instruction) {
            throw new Error(`Undefined opcode '${opcode}'`);
        }

        const valid = operands.length === instruction.nArgs
            && instruction.types.reduce((a, c, i) => a && (c === "*" || c === operands[i].type, true));

        if (!valid) {
            throw new Error(`opcode '${opcode}' called with incorrect number of arguments, or incorrect type`);
        }

        instruction.f(ctx, ...operands);
    }
}

eval(ctx, parser(lexer(`
set x, 1
add x, 1
add x, 1
add x, 1
add x, 1
add x, 1
add x, 1
print x
print "Hello test!"
`)));
