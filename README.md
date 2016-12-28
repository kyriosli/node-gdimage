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
function create(width:int, height:int, trueColor:boolean = true): GDImage
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
function decode(buf:Buffer, format:string = 'auto'): GDImage
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

### function trueColor

```js
function trueColor(r, g, b, a): Color
function trueColor(rgb:string): Color
function trueColor(rgba:string): Color
```

Resolves a 32 bit RGBA true color. `trueColor` accepts several types of arguments:

  - `gd.trueColor('#RRGGBB')`, where 'RRGGBB' is hex color codes. For Example `#FF0000` denotes `red`
  - `gd.trueColor('#RRGGBBAA')`
  - `gd.trueColor(r, g, b)`, where `r`, `g`, `b` are digits between `0` ~ `255`
  - `gd.trueColor(r, g, b, a)`, where `a` is a number between `0` and `1`

So `gd.trueColor('#ff00ff')` is equivalent to `gd.trueColor('#ff00ffff')`, as well as `gd.trueColor(255, 0, 255, 1)`

### class GDImage

A `GDImage` object wraps a native libgd image instance, and wraps several native methods into javascript functions 
which helps us working with it. Methods and fields available are as follows.

### `int` GDImage::width, `int` GDImage::height

the width and height of the image, in pixels.

### GDIMage::toTrueColor

```js
function toTrueColor(): GDImage
```

Converts a platte image to true color. Calling this on a true color image has no effects.

Returns the GDImage itself.

### GDImage::destroy

```js
function destroy()
```

Destroys the image, frees memories and resources. A `GDImage` must be freed manually to prevent memory leak. 

### GDImage::allocateColor

```js
function allocateColor(r, g, b, a): Color
```

Allocates a color in the color space. `image.allocateColor` accepts same arguments as `gd.trueColor`.

If the image is in true color mode, `image.allocateColor` acts like `gd.trueColor`.

If the image is in platte mode, for example it is decoded from a `PNG8` or `GIF` file, the color allocation
may fail because the color platte cannot have more colors. To prevent the potential failure, you can

  - convert the image to true color mode by calling `image.toTrueColor()`.
  - find a closest color from the platte by calling `image.getClosestColor(rgba)`
  - use `image.resolveColor(rgba)`

### GDImage::getColor

Gets an existing color from the color space. If none matching, an exception is thrown.

 `image.getColor` accepts same arguments as `gd.trueColor`.

Not that `image.GetColor` acts like `gd.trueColor` in true color mode, it will never fail. 

### GDImage::getClosestColor

Gets an existing color closest to the rgba value from the color space.

 `image.getClosestColor` accepts same arguments as `gd.trueColor`.

Not that `image.GetColor` acts like `gd.trueColor` in true color mode, it will never fail.

### GDImage::resolveColor

This method will always return a color instance. First it tries to find a matching color, if none matching,
it tries to allocate a new color. If both failed, it returns a closest color from the color space.

Not that `image.GetColor` acts like `gd.trueColor` in true color mode, it will never fail.

### GDImage::scale

```js
function scale(new_width:int, new_height:int, auto_destroy:boolean = false): GDImage
```

Scales the image into new size. If auto_destroy is set to true, the current image is destroyed after the it is scaled.

Returns a new `GDImage` created.


### GDImage::rotate
```js
function rotate(angle:float, bg_color:Color = null, auto_close:boolean = false): GDImage
```

Rotates the image clockwise. `angle` shold be between `0~360`. When `angle` is not `90` `180` `270`, the `bg_color` is used
 to fill the empty.

Returns a new `GDImage` created.

### GDImage::line

```js
function line(x1:int, y1:int, x2:int, y2:int, color:Color, anti_aliased:boolean = false): GDImage
```

Draws a solid line from `(x1, y1)` to `(x2, y2)`. If `anti_aliased` is set to true, anti-aliasing is enabled

Returns the GDImage itself.

### GDImage::text

```js
function text(str:string, x:int, y:int, size:double, color:Color, angle:float = 0, font:string = "arial"): Array.<number>
```

Writes text with true type font, returns a rect which wraps the text. Only true type fonts are supported.

Parameters:

 - `str` text to write
 - `x` `y` start coordinate of the baseline
 - `size` text size in dots/pixels
 - `color` foreground color
 - `angle` angle of baseline, in degrees
 - `font` name/path of font, such as `arial` `times` `courier`, or `Symbol.ttf`, or `/System/Library/Fonts/Symbol.ttf` etc. You can supply multi names with `;`

Returns an array of 4 digits denoting an rectangle of the bounds: `[x, y, w, h]`

#### Find out system font names:

In Windows, check `C:\WINDOWS\FONTS` `C:\WINNT\FONTS` for files named `*.ttf`.
In Unix/Linux, check `/usr/share/fonts/TrueType` `/usr/lib/X11/fonts` etc.
In Mac/OSX, check `/Library/Fonts` `/System/Library/Fonts`.

Note that modern os uses `ttc` file format which is not supported by libgd.
If you want to use some fonts that the os does not supply, you should download and install the font files
in `ttf` format or put them in your project directory and specify the font path as below.

#### Use Your custom font paths:

To use custom font paths, you can supply an environment variable with the paths, separated with `:` or`;`

```sh
# in posix shell:
GDFONTPATH="/Users/kyrios.li/fonts:/Library/Fonts" node start

# in windows cmd:
set GDFONTPATH="C:\\Users\\kyrios.li\\fonts;C:\\Windows\\Fonts"
```

Or just set the font path in node.js:

```js
process.env.GDFONTPATH = require('path').resolve(__dirname, 'fonts') + ':/Library/Fonts';
```

### GDImage::encode

```js
function encode(format:string, auto_close:boolean = false): Buffer
```

Encodes the image into image file content. Supported formats are:

  - `bmp`
  - `png`
  - `jpg` `jpeg`
  - `gif`
  - `tiff`
  - `Webp`
