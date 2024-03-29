<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [NRRD_TYPES_TO_TYPEDARRAY][1]
-   [Inflate][2]
    -   [Parameters][3]
    -   [push][4]
        -   -   [Example][5]
        -   [Parameters][6]
    -   [onData][7]
        -   [Parameters][8]
    -   [onEnd][9]
        -   [Parameters][10]
-   [Inflate][11]
    -   [Parameters][12]
    -   [push][13]
        -   -   [Example][14]
        -   [Parameters][15]
    -   [onData][16]
        -   [Parameters][17]
    -   [onEnd][18]
        -   [Parameters][19]
-   [Inflate][20]
    -   [Parameters][21]
    -   [push][22]
        -   -   [Example][23]
        -   [Parameters][24]
    -   [onData][25]
        -   [Parameters][26]
    -   [onEnd][27]
        -   [Parameters][28]
-   [Inflate][29]
    -   [Parameters][30]
    -   [push][31]
        -   -   [Example][32]
        -   [Parameters][33]
    -   [onData][34]
        -   [Parameters][35]
    -   [onEnd][36]
        -   [Parameters][37]
-   [Inflate][38]
    -   -   -   [Example:][39]
    -   [Parameters][40]
    -   [push][41]
        -   -   [Example][42]
        -   [Parameters][43]
    -   [onData][44]
        -   [Parameters][45]
    -   [onEnd][46]
        -   [Parameters][47]
-   [inflate][48]
    -   -   -   [Example:][49]
    -   [Parameters][50]
-   [inflateRaw][51]
    -   [Parameters][52]
-   [parse][53]
    -   [Parameters][54]
-   [ParserAsync][55]
    -   [Parameters][56]
-   [Toolbox][57]
    -   [getNumberOfComponentPerVoxel][58]
        -   [Parameters][59]
    -   [getNumberOfTimeSamples][60]
        -   [Parameters][61]
    -   [getSliceXY][62]
        -   [Parameters][63]
    -   [getSliceXZ][64]
        -   [Parameters][65]
    -   [getSliceYZ][66]
        -   [Parameters][67]
    -   [getValue][68]
        -   [Parameters][69]
    -   [getIndex1D][70]
        -   [Parameters][71]
    -   [getVoxelToWorldMatrix][72]
        -   [Parameters][73]
    -   [getWorldToVoxelMatrix][74]
        -   [Parameters][75]
    -   [getVoxelPositionFromWorldPosition][76]
        -   [Parameters][77]
    -   [getWorldValue][78]
        -   [Parameters][79]

## NRRD_TYPES_TO_TYPEDARRAY

This is the mapping from the NRRD datatype as written in the NRRD header
to the JS typed array equivalent.

## Inflate

class Inflate

Generic JS-style wrapper for zlib calls. If you don't need
streaming behaviour - use more simple functions: \[[inflate]]
and \[[inflateRaw]].
\*

### Parameters

-   `options`  

### push

Inflate#push(data[, flush_mode]) -> Boolean

-   data (Uint8Array|ArrayBuffer): input data
-   flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE
    flush modes. See constants. Skipped or `false` means Z_NO_FLUSH,
    `true` means Z_FINISH.

Sends input data to inflate pipe, generating \[[Inflate#onData]] calls with
new output chunks. Returns `true` on success. If end of stream detected,
\[[Inflate#onEnd]] will be called.

`flush_mode` is not needed for normal operation, because end of stream
detected automatically. You may try to use it for advanced things, but
this functionality was not tested.

On fail call \[[Inflate#onEnd]] with error code and return false.

##### Example

```javascript
push(chunk, false); // push one of data chunks
...
push(chunk, true);  // push last chunk
```

\*

#### Parameters

-   `data`  
-   `flush_mode`  

### onData

Inflate#onData(chunk) -> Void

-   chunk (Uint8Array|String): output data. When string output requested,
    each chunk will be string.

By default, stores data blocks in `chunks[]` property and glue
those in `onEnd`. Override this handler, if you need another behaviour.
\*

#### Parameters

-   `chunk`  

### onEnd

Inflate#onEnd(status) -> Void

-   status (Number): inflate status. 0 (Z_OK) on success,
    other if not.

Called either after you tell inflate that the input stream is
complete (Z_FINISH). By default - join collected chunks,
free memory and fill `results` / `err` properties.
\*

#### Parameters

-   `status`  

## Inflate

Inflate.result -> Uint8Array|String

Uncompressed result, generated by default \[[Inflate#onData]]
and \[[Inflate#onEnd]] handlers. Filled after you push last chunk
(call \[[Inflate#push]] with `Z_FINISH` / `true` param).
\*

### Parameters

-   `options`  

### push

Inflate#push(data[, flush_mode]) -> Boolean

-   data (Uint8Array|ArrayBuffer): input data
-   flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE
    flush modes. See constants. Skipped or `false` means Z_NO_FLUSH,
    `true` means Z_FINISH.

Sends input data to inflate pipe, generating \[[Inflate#onData]] calls with
new output chunks. Returns `true` on success. If end of stream detected,
\[[Inflate#onEnd]] will be called.

`flush_mode` is not needed for normal operation, because end of stream
detected automatically. You may try to use it for advanced things, but
this functionality was not tested.

On fail call \[[Inflate#onEnd]] with error code and return false.

##### Example

```javascript
push(chunk, false); // push one of data chunks
...
push(chunk, true);  // push last chunk
```

\*

#### Parameters

-   `data`  
-   `flush_mode`  

### onData

Inflate#onData(chunk) -> Void

-   chunk (Uint8Array|String): output data. When string output requested,
    each chunk will be string.

By default, stores data blocks in `chunks[]` property and glue
those in `onEnd`. Override this handler, if you need another behaviour.
\*

#### Parameters

-   `chunk`  

### onEnd

Inflate#onEnd(status) -> Void

-   status (Number): inflate status. 0 (Z_OK) on success,
    other if not.

Called either after you tell inflate that the input stream is
complete (Z_FINISH). By default - join collected chunks,
free memory and fill `results` / `err` properties.
\*

#### Parameters

-   `status`  

## Inflate

Inflate.err -> Number

Error code after inflate finished. 0 (Z_OK) on success.
Should be checked if broken data possible.
\*

### Parameters

-   `options`  

### push

Inflate#push(data[, flush_mode]) -> Boolean

-   data (Uint8Array|ArrayBuffer): input data
-   flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE
    flush modes. See constants. Skipped or `false` means Z_NO_FLUSH,
    `true` means Z_FINISH.

Sends input data to inflate pipe, generating \[[Inflate#onData]] calls with
new output chunks. Returns `true` on success. If end of stream detected,
\[[Inflate#onEnd]] will be called.

`flush_mode` is not needed for normal operation, because end of stream
detected automatically. You may try to use it for advanced things, but
this functionality was not tested.

On fail call \[[Inflate#onEnd]] with error code and return false.

##### Example

```javascript
push(chunk, false); // push one of data chunks
...
push(chunk, true);  // push last chunk
```

\*

#### Parameters

-   `data`  
-   `flush_mode`  

### onData

Inflate#onData(chunk) -> Void

-   chunk (Uint8Array|String): output data. When string output requested,
    each chunk will be string.

By default, stores data blocks in `chunks[]` property and glue
those in `onEnd`. Override this handler, if you need another behaviour.
\*

#### Parameters

-   `chunk`  

### onEnd

Inflate#onEnd(status) -> Void

-   status (Number): inflate status. 0 (Z_OK) on success,
    other if not.

Called either after you tell inflate that the input stream is
complete (Z_FINISH). By default - join collected chunks,
free memory and fill `results` / `err` properties.
\*

#### Parameters

-   `status`  

## Inflate

Inflate.msg -> String

Error message, if \[[Inflate.err]] != 0
\*

### Parameters

-   `options`  

### push

Inflate#push(data[, flush_mode]) -> Boolean

-   data (Uint8Array|ArrayBuffer): input data
-   flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE
    flush modes. See constants. Skipped or `false` means Z_NO_FLUSH,
    `true` means Z_FINISH.

Sends input data to inflate pipe, generating \[[Inflate#onData]] calls with
new output chunks. Returns `true` on success. If end of stream detected,
\[[Inflate#onEnd]] will be called.

`flush_mode` is not needed for normal operation, because end of stream
detected automatically. You may try to use it for advanced things, but
this functionality was not tested.

On fail call \[[Inflate#onEnd]] with error code and return false.

##### Example

```javascript
push(chunk, false); // push one of data chunks
...
push(chunk, true);  // push last chunk
```

\*

#### Parameters

-   `data`  
-   `flush_mode`  

### onData

Inflate#onData(chunk) -> Void

-   chunk (Uint8Array|String): output data. When string output requested,
    each chunk will be string.

By default, stores data blocks in `chunks[]` property and glue
those in `onEnd`. Override this handler, if you need another behaviour.
\*

#### Parameters

-   `chunk`  

### onEnd

Inflate#onEnd(status) -> Void

-   status (Number): inflate status. 0 (Z_OK) on success,
    other if not.

Called either after you tell inflate that the input stream is
complete (Z_FINISH). By default - join collected chunks,
free memory and fill `results` / `err` properties.
\*

#### Parameters

-   `status`  

## Inflate

new Inflate(options)

-   options (Object): zlib inflate options.

Creates new inflator instance with specified params. Throws exception
on bad params. Supported options:

-   `windowBits`
-   `dictionary`

[http://zlib.net/manual.html#Advanced][80]
for more information on these.

Additional options, for internal needs:

-   `chunkSize` - size of generated data chunks (16K by default)
-   `raw` (Boolean) - do raw inflate
-   `to` (String) - if equal to 'string', then result will be converted
    from utf8 to utf16 (javascript) string. When string output requested,
    chunk length can differ from `chunkSize`, depending on content.

By default, when no options set, autodetect deflate/gzip data format via
wrapper header.

##### Example:

```javascript
const pako = require('pako')
const chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
const chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);

const inflate = new pako.Inflate({ level: 3});

inflate.push(chunk1, false);
inflate.push(chunk2, true);  // true -> last chunk

if (inflate.err) { throw new Error(inflate.err); }

console.log(inflate.result);
```

\*

### Parameters

-   `options`  

### push

Inflate#push(data[, flush_mode]) -> Boolean

-   data (Uint8Array|ArrayBuffer): input data
-   flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE
    flush modes. See constants. Skipped or `false` means Z_NO_FLUSH,
    `true` means Z_FINISH.

Sends input data to inflate pipe, generating \[[Inflate#onData]] calls with
new output chunks. Returns `true` on success. If end of stream detected,
\[[Inflate#onEnd]] will be called.

`flush_mode` is not needed for normal operation, because end of stream
detected automatically. You may try to use it for advanced things, but
this functionality was not tested.

On fail call \[[Inflate#onEnd]] with error code and return false.

##### Example

```javascript
push(chunk, false); // push one of data chunks
...
push(chunk, true);  // push last chunk
```

\*

#### Parameters

-   `data`  
-   `flush_mode`  

### onData

Inflate#onData(chunk) -> Void

-   chunk (Uint8Array|String): output data. When string output requested,
    each chunk will be string.

By default, stores data blocks in `chunks[]` property and glue
those in `onEnd`. Override this handler, if you need another behaviour.
\*

#### Parameters

-   `chunk`  

### onEnd

Inflate#onEnd(status) -> Void

-   status (Number): inflate status. 0 (Z_OK) on success,
    other if not.

Called either after you tell inflate that the input stream is
complete (Z_FINISH). By default - join collected chunks,
free memory and fill `results` / `err` properties.
\*

#### Parameters

-   `status`  

## inflate

inflate(data[, options]) -> Uint8Array|String

-   data (Uint8Array): input data to decompress.
-   options (Object): zlib inflate options.

Decompress `data` with inflate/ungzip and `options`. Autodetect
format via wrapper header by default. That's why we don't provide
separate `ungzip` method.

Supported options are:

-   windowBits

[http://zlib.net/manual.html#Advanced][80]
for more information.

Sugar (options):

-   `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
    negative windowBits implicitly.
-   `to` (String) - if equal to 'string', then result will be converted
    from utf8 to utf16 (javascript) string. When string output requested,
    chunk length can differ from `chunkSize`, depending on content.

##### Example:

```javascript
const pako = require('pako');
const input = pako.deflate(new Uint8Array([1,2,3,4,5,6,7,8,9]));
let output;

try {
  output = pako.inflate(input);
} catch (err) {
  console.log(err);
}
```

\*

### Parameters

-   `input`  
-   `options`  

## inflateRaw

inflateRaw(data[, options]) -> Uint8Array|String

-   data (Uint8Array): input data to decompress.
-   options (Object): zlib inflate options.

The same as \[[inflate]], but creates raw data, without wrapper
(header and adler32 crc).
\*

### Parameters

-   `input`  
-   `options`  

## parse

Parse a buffer of a NRRD file.
Throws an exception if the file is not a proper NRRD file.

### Parameters

-   `nrrdBuffer` **[ArrayBuffer][81]** the NRRD file buffer
-   `options` **[Object][82]** the option object (optional, default `{}`)
    -   `options.headerOnly` **[boolean][83]** Parses only the header if true, parses header and data if false (default: false)

Returns **[Object][82]** NRRD header and data such as {header: Object, data: TypedArray }

## ParserAsync

Parse a buffer of a NRRD file.
Throws an exception if the file is not a proper NRRD file.

### Parameters

-   `nrrdBuffer` **[ArrayBuffer][81]** the NRRD file buffer
-   `options` **[Object][82]** the option object (optional, default `{}`)
    -   `options.headerOnly` **[boolean][83]** Parses only the header if true, parses header and data if false (default: false)

Returns **[Object][82]** NRRD header and data such as {header: Object, data: TypedArray }

## Toolbox

The Toolbox is a set of static methods to extract some data from a parsed NRRD
using the `header` and/or the `data` as returned by `nrrdjs.parse(...)`.

The NRRD format does not make any assumption about the naming of the axis
(X, Y, Z, A, B, C, etc.) but for the sake of accessibility, the Toolbox assumes
that if there is more than 1 components per voxel (ex: RGB), they are encoded
on the fastest axis. Otherwise:

-   The axis called `X` is encoded on the fastest axis
-   The axis called `Z` is encoded on the slowest axis
-   The axis called `Y` is encoded in between
-   The time axis, if any, is even slower than `Z`

Note: the fast axis is the one where element along it are contiguous on the buffer (stride: 1)

### getNumberOfComponentPerVoxel

Get the number of components per voxel. For example, for a RGB volume,
the ncpv is 3.

#### Parameters

-   `header` **[object][82]** the header object as returned by the parser

Returns **[number][84]** 

### getNumberOfTimeSamples

Get the number of time samples for this volume. If it's not a time sequence,
then there is only a single time sample.

#### Parameters

-   `header` **[object][82]** the header object as returned by the parser

Returns **[number][84]** 

### getSliceXY

Extract a slice of the XY plane in voxel coordinates. The horizontal axis of the
2D slice is along the X axis of the volume, the vertical axis on the 2D slice is
along the Y axis of the volume, origin is at top-left.

#### Parameters

-   `data` **[TypedArray][85]** the volumetric data
-   `header` **[Object][82]** the header object corresponding to the NRRD file
-   `sliceIndex` **[Number][84]** index of the slice

Returns **[Object][82]** as {width: Number, height: Number, data: TypedArray} where the data is
of the same type as the volume buffer.

### getSliceXZ

Extract a slice of the XZ plane in voxel coordinates. The horizontal axis of the
2D slice is along the X axis of the volume, the vertical axis on the 2D slice is
along the Z axis of the volume, origin is at top-left.

#### Parameters

-   `data` **[TypedArray][85]** the volumetric data
-   `header` **[Object][82]** the header object corresponding to the NRRD file
-   `sliceIndex` **[Number][84]** index of the slice

Returns **[Object][82]** as {width: Number, height: Number, data: TypedArray} where the data is
of the same type as the volume buffer.

### getSliceYZ

Extract a slice of the YZ plane in voxel coordinates. The horizontal axis of the
2D slice is along the Y axis of the volume, the vertical axis on the 2D slice is
along the Z axis of the volume, origin is at top-left.

#### Parameters

-   `data` **[TypedArray][85]** the volumetric data
-   `header` **[Object][82]** the header object corresponding to the NRRD file
-   `sliceIndex` **[Number][84]** index of the slice

Returns **[Object][82]** as {width: Number, height: Number, data: TypedArray} where the data is
of the same type as the volume buffer.

### getValue

Get the value at the position (x, y, z) in voxel coordinates.

#### Parameters

-   `data` **[TypedArray][85]** the volumetric data
-   `header` **[Object][82]** the header object corresponding to the NRRD file
-   `x` **[Number][84]** the x position (fastest varying axis)
-   `y` **[Number][84]** the y position
-   `z` **[Number][84]** the z position (slowest varying)

Returns **[Array][86]** as [v] because of compatibility to multiple components per voxel

### getIndex1D

Get the 1D index within the buffer for the given (x, y, z) in voxel coordinates

#### Parameters

-   `header` **[Object][82]** the header object corresponding to the NRRD file
-   `x` **[Number][84]** the x position (fastest varying axis)
-   `y` **[Number][84]** the y position
-   `z` **[Number][84]** the z position (slowest varying)
-   `value` **[Number][84]** at this position in 1D buffer

### getVoxelToWorldMatrix

Get the affine matrix for converting voxel coordinates into world/subject coordinates

#### Parameters

-   `header` **[Object][82]** the header object corresponding to the NRRD file

Returns **[Float32Array][87]** the matrix as a 4x4 column major

### getWorldToVoxelMatrix

Get the affine matrix for converting world/subject coordinates into voxel coordinates

#### Parameters

-   `header` **[Object][82]** the header object corresponding to the NRRD file

Returns **[Float32Array][87]** the matrix as a 4x4 column major

### getVoxelPositionFromWorldPosition

Get the position voxel coordinates providing a position in world coordinates

#### Parameters

-   `header` **[Object][82]** the header object corresponding to the NRRD file
-   `x` **[Number][84]** the x position (fastest varying axis)
-   `y` **[Number][84]** the y position
-   `z` **[Number][84]** the z position (slowest varying)

Returns **[Array][86]** as [x, y, z]

### getWorldValue

Get the value at the given world coordinates.
Note: the voxel coordinates is rounded

#### Parameters

-   `data` **[TypedArray][85]** the volumetric data
-   `header` **[Object][82]** the header object corresponding to the NRRD file
-   `x` **[Number][84]** the x position (fastest varying axis)
-   `y` **[Number][84]** the y position
-   `z` **[Number][84]** the z position (slowest varying)

Returns **[Array][86]** as [v] because of compatibility to multiple components per voxel

[1]: #nrrd_types_to_typedarray

[2]: #inflate

[3]: #parameters

[4]: #push

[5]: #example

[6]: #parameters-1

[7]: #ondata

[8]: #parameters-2

[9]: #onend

[10]: #parameters-3

[11]: #inflate-1

[12]: #parameters-4

[13]: #push-1

[14]: #example-1

[15]: #parameters-5

[16]: #ondata-1

[17]: #parameters-6

[18]: #onend-1

[19]: #parameters-7

[20]: #inflate-2

[21]: #parameters-8

[22]: #push-2

[23]: #example-2

[24]: #parameters-9

[25]: #ondata-2

[26]: #parameters-10

[27]: #onend-2

[28]: #parameters-11

[29]: #inflate-3

[30]: #parameters-12

[31]: #push-3

[32]: #example-3

[33]: #parameters-13

[34]: #ondata-3

[35]: #parameters-14

[36]: #onend-3

[37]: #parameters-15

[38]: #inflate-4

[39]: #example-4

[40]: #parameters-16

[41]: #push-4

[42]: #example-5

[43]: #parameters-17

[44]: #ondata-4

[45]: #parameters-18

[46]: #onend-4

[47]: #parameters-19

[48]: #inflate-5

[49]: #example-6

[50]: #parameters-20

[51]: #inflateraw

[52]: #parameters-21

[53]: #parse

[54]: #parameters-22

[55]: #parserasync

[56]: #parameters-23

[57]: #toolbox

[58]: #getnumberofcomponentpervoxel

[59]: #parameters-24

[60]: #getnumberoftimesamples

[61]: #parameters-25

[62]: #getslicexy

[63]: #parameters-26

[64]: #getslicexz

[65]: #parameters-27

[66]: #getsliceyz

[67]: #parameters-28

[68]: #getvalue

[69]: #parameters-29

[70]: #getindex1d

[71]: #parameters-30

[72]: #getvoxeltoworldmatrix

[73]: #parameters-31

[74]: #getworldtovoxelmatrix

[75]: #parameters-32

[76]: #getvoxelpositionfromworldposition

[77]: #parameters-33

[78]: #getworldvalue

[79]: #parameters-34

[80]: http://zlib.net/manual.html#Advanced

[81]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer

[82]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[83]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[84]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number

[85]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

[86]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array

[87]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
