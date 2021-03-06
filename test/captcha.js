var gdimage = require('..');
var charList = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ', charLen = charList.length;
var fonts = ['arial', 'times', 'courier'], fontsLen = fonts.length;
var rnd = Math.random;

var width = 10, height = 16;

exports.setSize = function (_width, _height) {
    width = _width;
    height = _height;
};

exports.generate = function (length) {
    var img = gdimage.create(length * width, height, true), chars = '';
    var white = img.allocateColor(255, 255, 255);
    img.rect(0, 0, img.width, height, white, true);
    for (var i = 0; i < length; i++) {
        var char = charList[rnd() * charLen | 0];
        chars += char;
        img.text(char, i * width + 2, height - 4, width, randomColor(1), 15 - rnd() * 30, fonts[rnd() * fontsLen | 0]);
    }
    // random dots
    for (var i = 0; i < length << 3; i++) {
        img.circle(rnd() * length * width, rnd() * height, rnd() * 8, randomColor(rnd() * 0.6), 1);

        img.rect(rnd() * length * width, rnd() * height, 2, 2, randomColor(rnd() * 0.3), 1)
    }
    return {buffer: img.encode('gif', true), chars: chars};

    function randomColor(alpha) {
        var rgb = hsl2rgb(rnd(), 0.6 + rnd() * 0.4, 0.2 + rnd() * 0.4);
        return img.resolveColor(rgb.r * 255, rgb.g * 255, rgb.b * 255, alpha);
    }
};


/**
 *
 * @param h 0~1
 * @param s 0~1
 * @param l 0~1
 */
function hsl2rgb(h, s, l) {
    var v1, v2;
    if (s === 0) { // gray
        return {r: l, g: l, b: l};
    } else {
        v2 = l < 0.5 ? l * s + l : l + s - l * s;
        v1 = 2 * l - v2;

        return {
            r: hue2Color(h + 1 / 3),
            g: hue2Color(h),
            b: hue2Color(h - 1 / 3),
        }
    }

    function hue2Color(hue) {
        if (hue < 0)
            hue += 1;
        else if (hue > 1)
            hue -= 1;
        return hue < 1 / 6 ? v1 + (v2 - v1) * 6 * hue
            : hue < 1 / 2 ? v2
            : hue < 2 / 3 ? v1 + (v2 - v1) * 6 * (2 / 3 - hue)
            : v1
    }
}
