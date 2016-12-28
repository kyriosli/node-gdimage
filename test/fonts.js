var gd = require('..');
var assert = require('assert');

var image = gd.create(600, 1200);
assert.strictEqual(image.width, 600);
assert.strictEqual(image.height, 1200);

var gray = image.allocateColor('#eeeeee');

var fs = require('fs');

var line = 1, col = 0, LINEHEIGHT = 24, FONTSIZE = 12;

for (var filename of fs.readdirSync('/Library/Fonts')) {
    if (filename === 'NISC18030.ttf')
        continue;
    var ext = filename.slice(-4);
    if (ext === '.ttf' /*|| ext === '.ttc'*/) {
        var font = filename.slice(0, -4);
        console.error(font);
        image.text(font, col * FONTSIZE, line * LINEHEIGHT, FONTSIZE, gray, 0, font);
        col = (col + font.length + 7) & ~7;
        if (col > 30) {
            line++;
            col = 0;
        }
    }
}

line++;
var rect = image.text('微软雅黑中文123~~', 100, line * LINEHEIGHT, FONTSIZE, gray, 0, __dirname + '/msyh.ttf');
console.log(rect);

require('fs').writeFileSync('fonts_out.gif', image.encode('gif', true));
