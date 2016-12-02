## Yet Another GD Graphics Library Wrapper For Node.JS

This software wraps popular LibGD graphics library into Node.JS module which helps interpreting graphics inside Node.JS. 
Rather than writing dozens of native codes, this software uses `ffi` to wrap libgd api methods into JavaScript functions.

### Usage

`gdimage` requires `ref` and `node-ffi` which are native modules, so you need a C++ compiler (gcc, llvm, msvc etc.)
before installing it.

Also, GD native library is required. In Linux / OSX, you can install it with a package manager

```sh
npm install gdimage
(sudo) apt-get install libgd3 # in debian/ubuntu
(sudo) yum install gd # in fedora/centos
brew install gd # in osx
```

In Windows, you need to download and install `libgd` manually, see [Gd for Windows](http://gnuwin32.sourceforge.net/packages/gd.htm)

Usage example: 

```js
var gd = require('gdimage');

var image = gd.create(200, 100);
var white = image.allocateColor('#ffffff'),
    red = image.allocateColor('#ff0000');

image.fill(0, 0, 200, 100, white);
image.line(0, 0, 200, 100, red, true);

var buf = image.encode('png');
require('fs').writeFileSync('out.png', buf);
```

## API Reference

### function create

```js
function create(int width, int height, boolean trueColor = true): GDImage
```

Creates a new `GDImage` instance.

When `trueColor` set to `true`, the image is in TrueColor mode, the total color count is unlimited.
 
Parameters:

  - `width` the image width, in pixels
  - `height` the image height, in pixels
  - `trueColor` whether TrueColor mode is enabled, default to true.

Returns:

  a new `GDImage` instance

### function decode
 
```js
function decode(Buffer buf, string format = 'auto'): GDImage
```

Decodes a image file content into a GDImage instance.
 
Parameters:

  - `buf` a buffer that contains file content.
  - `format` a string or mime type denoting the format of the image. The format name is case insensitive.
    When set to `'auto'`, the file format is guessed by the file head. Supported image formats are:
    - `bmp` `image/bmp` `application/x-ms-bmp` `application/x-bmp`
    - `jpg` `jpe` `jpeg` `jfif` `jfi` `jif` `image/jpeg`
    - `gif` `image/gif`
    - `png` `image/png`
    - `tiff` `tif` `image/tiff`

Returns:

  a `GDImage` instance, which maybe TrueColor or not, depending on the file format.

### class GDImage

A `GDImage` object wraps a native libgd image instance, and wraps several native methods into javascript functions 
which helps us working with it. Methods and fields available are as follows.

### `int` GDImage::width, `int` GDImage::height

the width and height of the image, in pixels.

### GDImage::destroy

```js
function destroy()
```

Destroys the image, frees memories and resources. A `GDImage` must be freed manually to prevent memory leak. 

### GDImage::allocateColor(`int` r, `int` g, `int` b, `int` a): `Color`

Allocates a color in the color space. `allocateColor` accepts several types of arguments:

  - `'#RRGGBB'` where `RRGGBB` is hex color codes.
  - `'#RRGGBBAA'`
  - (r, g, b) where `r` `g` `b` are digits between `0` ~ `255`
  - (r, g, b, a) where `a` is number between `0` and `1`

For example `#ff00ff` is equivalent to `#ff00ffff`, as well as `(255, 0, 255, 1)`

If the image is decoded from a `PNG8` or `GIF` file, whose platte has 256 colors, the color allocation
may fail. To prevent the potential failure, you can

  - convert the image to true color mode by calling `toTrueColor()`, which supports millons of colors.
  - find an existing color from the platte by calling `getColor(rgba)`
  - find a closest color from the platte by calling `getClosestColor(rgba)`
  - use `resolveColor(rgba)`

### GDImage::getColor

```js
function getColor(int r, int g, int b, int a = 1): Color
function getColor(string rgb): Color
function getColor(string rgba): Color
```

Gets an existing color from the color space. If none matching, throws an exception.

### GDImage::getClosestColor

Gets an existing color closest to the rgba value from the color space.

### GDImage::resolveColor

This method will always return a color instance. First it tries to find a matching color, if none matching,
it tries to allocate a new color. If both failed, it returns a closest color from the color space.

### GDIMage::toTrueColor

```js
function toTrueColor(): GDImage
```

Converts a platte image to true color. Calling this on a true color image has no effects.

Returns the GDImage itself.

### GDImage::scale

```js
function scale(int new_width, int new_height, boolean auto_destroy = false): GDImage
```

Scales the image into new size. If auto_destroy is set to true, the current image is destroyed after the it is scaled.

Returns a new `GDImage` created.

### GDImage::line

```js
function line(int x1, int y1, int x2, int y2, Color color, boolean anti_aliased = false): GDImage
```

Draws a solid line from `(x1, y1)` to `(x2, y2)`. If `anti_aliased` is set to true, anti-aliasing is enabled

Returns the GDImage itself.

### GDImage::text

```js
function text(string str, int x, int y, double size, Color color, double angle = 0, string font = "arial"): GDImage
```

Writes text with true type font, returns a rect which wraps the text.

Parameters:

 - `str` text to write
 - `x` `y` start coordinate of the baseline
 - `size` text size in dots/pixels
 - `color` foreground color
 - `angle` angle of baseline, in degrees
 - `font` name of font, such as `arial` `times` `courier` etc.

### GDImage::encode

```js
function encode(string format, boolean auto_close  = false): Buffer
```

Encodes the image into image file content. Supported formats are:

  - `bmp`
  - `png`
  - `jpg` `jpeg`
  - `gif`
  - `tiff`
  - `Webp`
