var gd = require('..');
var assert = require('assert');

var image = gd.create(200, 100);
assert.strictEqual(image.width, 200);
assert.strictEqual(image.height, 100);

var white = gd.trueColor('#ffffff'),
    red = gd.trueColor('#ff0000'),
    green = gd.trueColor('#00800080');

image.rect(0, 0, 200, 100, white, true);
image.line(0, 0, 200, 100, red, true);
image.text('hello~', 30, 20, 18, green, -30);
var buf = image.encode('png');

require('fs').writeFileSync('out.png', buf);
require('fs').writeFileSync('out.jpg', image.encode('jpg'));
require('fs').writeFileSync('out.bmp', image.encode('bmp'));
require('fs').writeFileSync('out.tiff', image.encode('tiff', true));

image = gd.decode(buf);
var green2 = image.allocateColor(0, 127, 0, 0.5);
image.line(0, 100, 200, 0, green2);

buf = image.encode('gif', true);
require('fs').writeFileSync('out.gif', buf);

image = gd.decode(buf);


image.toTrueColor();

var red = image.allocateColor('#ff0000');
var lime = image.allocateColor('#00ff00');
image.allocateColor('#0000ff');
var color3 = image.resolveColor('#ff0001');
var color4 = image.getClosestColor('#00ff01');
console.log(red, color3, lime, color4);
image.rect(0, 10, 10, 10, red, true);

require('fs').writeFileSync('out.gif', image.encode('gif', true));

image = gd.decode(require('fs').readFileSync('out.jpg'));
image = image.scale(300, 150, true);
console.log(image.width, image.height);
require('fs').writeFileSync('out2.gif', image.encode('gif', true));