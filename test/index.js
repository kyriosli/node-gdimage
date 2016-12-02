var gd = require('..');
var assert = require('assert');

var image = gd.create(200, 100);
assert.strictEqual(image.width, 200);
assert.strictEqual(image.height, 100);

var white = image.allocateColor('#ffffff'),
    red = image.allocateColor('#ff0000'),
    green = image.allocateColor('#00800080');

image.fill(0, 0, 200, 100, white);
image.line(0, 0, 200, 100, red, true);
image.text('hello~', 30, 20, 18, green, -30);
try {
    assert.fail(true);
}
var buf = image.encode('png');

require('fs').writeFileSync('out.png', buf);
require('fs').writeFileSync('out.jpg', image.encode('jpg'));
require('fs').writeFileSync('out.bmp', image.encode('bmp'));
require('fs').writeFileSync('out.tiff', image.encode('tiff'));

image.destroy();

image = gd.decode(buf);
var green2 = image.allocateColor(0, 127, 0, 0.5);
image.line(0, 100, 200, 0, green2);
buf = image.encode('gif');
require('fs').writeFileSync('out.gif', buf);
image.destroy();
// setTimeout(sched, 100, 1000);

image = gd.decode(require('fs').readFileSync(__dirname + '/Portal-2.png'));

image.toTrueColor();

var color = image.allocateColor('#ff0000');
var color2 = image.allocateColor('#00ff00');
image.allocateColor('#0000ff');
var color3 = image.resolveColor('#ff0001');
var color4 = image.getClosestColor('#00ff01');
console.log(color, color3, color2, color4);
image.fill(0, 0, 200, 100, color);

require('fs').writeFileSync('out.gif', image.encode('gif'));

image.destroy();

image = gd.decode(require('fs').readFileSync('out.jpg'));
image = image.scale(300, 150, true);
console.log(image.width, image.height);
require('fs').writeFileSync('out2.gif', image.encode('gif'));

image.destroy();

function sched(n) {
    if (n) {
        process.stdout.write(' ' + n + '\r');
        image.png();
        image.png();
        image.png();
        image.png();
        new Buffer(1 << 24);
        return setTimeout(sched, 5, n - 1);
    }

    require('fs').writeFileSync('out.gif', buf);
    image.destroy();
}
