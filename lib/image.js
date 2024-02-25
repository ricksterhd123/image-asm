const { createCanvas } = require('canvas');
const fs = require('fs');

class Image {
    constructor(config) {
        const {
            width,
            height,
            outputFilepath,
            outputFormat = "image/png",
            context = "2d",
            backgroundColor = "#FFFFFF",
        } = config;

        this.canvas = createCanvas(width, height);
        this.context = this.canvas.getContext(context);

        this.context.fillStyle = backgroundColor;
        this.context.fillRect(0, 0, width, height);

        this.outputFilepath = outputFilepath;
        this.outputFormat = outputFormat;
    }

    drawRect(x, y, w, h, color) {
        this.context.fillStyle = color;
        this.context.fillRect(x, y, w, h);
    }

    drawText(text, x, y, maxWidth, color) {
        this.context.fillStyle = color;
        this.context.fillText(text, x, y, maxWidth);
    }

    save() {
        fs.writeFileSync(
            this.outputFilepath,
            this.canvas.toBuffer(this.outputFormat)
        );
    }
}

module.exports = Image;
