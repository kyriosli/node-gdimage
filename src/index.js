var ref = require('ref');
var ptrLen = ref.sizeof.pointer, intLen = ref.sizeof.int;
var $void = ref.types.void,
    $int = ref.types.int32,
    $voidPtr = ref.refType($void),
    $intPtr = ref.refType($int),
    $gdImagePtr = ref.refType({
        size: ptrLen + intLen + intLen,
        indirection: 1,
        get: function (buffer) {
            return new GDImgage(buffer)
        }, set: function () {
        }
    }),
    $charPtr = ref.refType(ref.types.uint16),
    $gdFontPtr = $voidPtr;

var gdAntiAliased = -7;

var types = {
    bmp: 'Bmp', 'image/bmp': 'Bmp', 'application/x-bmp': 'Bmp', 'application/x-ms-bmp': 'Bmp',
    png: 'Png', 'image/png': 'Png',
    gif: 'Gif', 'image/gif': 'Gif',
    jpg: 'Jpeg', jpe: 'Jpeg', jpeg: 'Jpeg', jfif: 'Jpeg', jfi: 'Jpeg', jif: 'Jpeg', 'image/jpeg': 'Jpeg',
    tiff: 'Tiff', tif: 'Tiff', 'image/tiff': 'Tiff',
    webp: 'Webp', 'image/webp': 'Webp'
};

var file_headers = {
    'GIF8': 'gif',
    '\x89PNG': 'png',
    'II*\0': 'tiff',
    'MM*\0': 'tiff',
    '\xff\xd8\xff\xe0': 'jfif'
};


var libgd = require('ffi').Library('libgd', function () {
    var $fiveInt = [$void, [$gdImagePtr, $int, $int, $int, $int, $int]],
        $encoder = [$voidPtr, [$gdImagePtr, $intPtr]],
        $decoder = [$gdImagePtr, [$int, $voidPtr]];
    return {
        gdFontGetLarge: [$gdFontPtr, []],
        gdFree: [$void, [$voidPtr]],
        // gdImageAlphaBlending: [$voidPtr, [$gdImagePtr, $int]],
        gdImageBmpPtr: $encoder,
        gdImageColorAllocateAlpha: [$int, [$gdImagePtr, $int, $int, $int, $int]],
        gdImageColorClosestAlpha: [$int, [$gdImagePtr, $int, $int, $int, $int]],
        gdImageColorExactAlpha: [$int, [$gdImagePtr, $int, $int, $int, $int]],
        gdImageColorResolveAlpha: [$int, [$gdImagePtr, $int, $int, $int, $int]],
        gdImageCreate: [$gdImagePtr, [$int, $int]],
        gdImageCreateFromBmpPtr: $decoder,
        gdImageCreateFromGifPtr: $decoder,
        gdImageCreateFromJpegPtr: $decoder,
        gdImageCreateFromPngPtr: $decoder,
        gdImageCreateFromTiffPtr: $decoder,
        gdImageCreateTrueColor: [$gdImagePtr, [$int, $int]],
        gdImageDestroy: [$void, [$gdImagePtr]],
        gdImageFilledRectangle: $fiveInt,
        gdImageGifPtr: $encoder,
        gdImageJpegPtr: $encoder,
        gdImageLine: $fiveInt,
        gdImagePaletteToTrueColor: [$int, [$gdImagePtr]],
        gdImagePngPtr: $encoder,
        gdImageScale: [$gdImagePtr, [$gdImagePtr, $int, $int]],
        gdImageSetAntiAliased: [$voidPtr, [$gdImagePtr, $int]],
        gdImageString16: [$void, [$gdImagePtr, $gdFontPtr, $int, $int, $charPtr, $int]],
        gdImageTiffPtr: $encoder,
        gdImageWebpPtr: $encoder
    }
}());

function GDImgage($ref) {
    this.$ref = $ref;
    this.width = ref.get($ref, ptrLen, $int);
    this.height = ref.get($ref, ptrLen + intLen, $int);
}

var intPtr = ref.alloc($int);

var malloc = Buffer.allocUnsafe || Buffer;

var rRGBA = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?$/i;

function colorGetter(api) {
    return function (r, g, b, a) {
        if (arguments.length === 1 && typeof r === 'string') {
            var m = rRGBA.exec(r);
            if (!m) throw new Error('bad argument');

            r = parseInt(m[1], 16);
            g = parseInt(m[2], 16);
            b = parseInt(m[3], 16);
            a = m[4] ? 127 - (parseInt(m[4], 16) >> 1) : 0;
        } else {
            r &= 0xff;
            g &= 0xff;
            b &= 0xff;

            a = arguments.length > 3 ? a > 1 ? 0 : a < 0 ? 127 : (1 - a) * 127 | 0 : 0;
        }
        var $ref = api(this.$ref, r, g, b, a);
        if ($ref < 0) {
            var err = new Error('failed');
            err.code = $ref;
            throw err;
        }
        return {$ref: $ref}
    }
}

GDImgage.prototype = {
    constructor: GDImgage,

    allocateColor: colorGetter(libgd.gdImageColorAllocateAlpha),
    getClosestColor: colorGetter(libgd.gdImageColorClosestAlpha),
    getColor: colorGetter(libgd.gdImageColorExactAlpha),
    resolveColor: colorGetter(libgd.gdImageColorResolveAlpha),
    fill: function (x1, y1, x2, y2, color) {
        libgd.gdImageFilledRectangle(this.$ref, x1, y1, x2, y2, color.$ref);
        return this;
    },
    line: function (x1, y1, x2, y2, color, antiAliased) {
        var $color = color.$ref;
        if (antiAliased) {
            libgd.gdImageSetAntiAliased(this.$ref, $color);
            $color = gdAntiAliased;
        }
        libgd.gdImageLine(this.$ref, x1, y1, x2, y2, $color);
        return this;
    },
    text: function (str, x1, y1, color) {
        var buf = new Buffer(str + '\0', 'ucs2');
        // buf.writeUInt16LE(0, str.length << 1);
        buf.type = $charPtr;
        var font = libgd.gdFontGetLarge();
        libgd.gdImageString16(this.$ref, font, x1, y1, buf, color.$ref);
        return this;
    },
    encode: function (format) {
        var method = libgd['gdImage' + types[format.toLowerCase()] + 'Ptr'];
        if (!method) {
            throw new Error(format + ' is not supported');
        }
        var ptr = method(this.$ref, intPtr);
        var len = intPtr.deref(), ret = malloc(len);
        ref.reinterpret(ptr, len, 0).copy(ret);
        libgd.gdFree(ptr);
        return ret;
    },
    scale: function (width, height, auto_destroy) {
        var ret = libgd.gdImageScale(this.$ref, width, height).deref();
        if (auto_destroy) {
            this.destroy();
        }
        return ret;
    },
    toTrueColor: function () {
        var ret = libgd.gdImagePaletteToTrueColor(this.$ref);
        if (ret !== 1) {
            var err = new Error('failed');
            err.code = ret;
            throw err;
        }
        return this;
    },
    destroy: function () {
        var $ref = this.$ref;
        if ($ref === null) {
            throw new Error('image has already been destroyed');
        }

        this.$ref = null;
        libgd.gdImageDestroy($ref);
    }
};

exports.create = function (width, height, trueColor) {
    var method = trueColor || arguments.length === 2 ? libgd.gdImageCreateTrueColor : libgd.gdImageCreate;
    return method(width, height).deref()
};

exports.decode = function (buf, format) {
    if (!format || format === 'auto') {
        format = file_headers[buf.toString('binary', 0, 4)] || (buf[0] === 0x42 && buf[1] === 0x4d ? 'bmp' : 'unknown');
    }

    var method = libgd['gdImageCreateFrom' + types[format.toLowerCase()] + 'Ptr'];
    if (!method) {
        throw new Error(format + ' is not supported');
    }

    buf.type = $voidPtr;
    return method(buf.length, buf).deref()
};