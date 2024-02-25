const { parser, lexer, eval } = require("./lib/asm.js");
const Image = require("./lib/image.js");

const ctx = {
    registers: {},
    instructions: {
        'init': {
            nArgs: 3,
            types: ['integer', 'integer', 'string'],
            f: (ctx, op_width, op_height, op_filename) => {
                const image = new Image({
                    width: op_width.value,
                    height: op_height.value,
                    outputFilepath: op_filename.value
                });

                if (!ctx.registers.images) {
                    ctx.registers.images = [];
                }

                ctx.registers.images.push(image);
                ctx.registers.currentImage = ctx.registers.images.length - 1;
            }
        },
        'fill': {
            nArgs: 4,
            types: ['integer', 'integer', 'integer', 'integer'],
            f: (ctx, op_x, op_y, op_w, op_h) => {
                const currentImage = ctx.registers.currentImage != null && ctx.registers.images[ctx.registers.currentImage];
                if (currentImage) {
                    currentImage.drawRect(op_x.value, op_y.value, op_w.value, op_h.value, '#FF0000');
                }
            }
        },
        'save': {
            nArgs: 0,
            types: [],
            f: (ctx) => {
                const currentImage = ctx.registers.currentImage != null && ctx.registers.images[ctx.registers.currentImage];
                if (currentImage) {
                    currentImage.save();
                }
            }
        }
    }
};

eval(ctx, parser(lexer(`
init 200, 200, "./image2.png"
fill 100, 100, 5, 5 ; pixel is 5by5
save
`)));
