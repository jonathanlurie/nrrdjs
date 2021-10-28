**Pure Javascript NRRD parser for browser and Node**

# Install
```
npm install @jonathanlurie/nrrdjs
```

# Usage
[EXAMPLE](https://github.com/jonathanlurie/nrrdjs/blob/master/examples/slicexy.html)  
[DOC](https://github.com/jonathanlurie/nrrdjs/blob/master/documentation.md)

Use `nrrdjs.parse(...)` or `await nrrdjs.parseAsync(...)` for async/webworker.

The `dist/` (umd) and the `es/` production build contain both `parse()` and `parseAsync()` while the `lib/` (cjs) contains only the `parse()` since it shoul be web worker free to work on Node.

ES6 import can be done like that:
```js
import { parse, parseAsync, Toolbox } from 'nrrdjs'
// ...
parse(...)
```

or could also be done as such:
```js
import * as nrrdjs from 'nrrdjs'
// ...
nrrdjs.parse(...)
```

The latter is convenient when in a dual context such as with Nextjs, where import are happening on both the server and the client. Then, importing all makes `parseAsync` available on client side, while explicitely importing in would crash on server side.

The encoding supported are: raw, ascii and gzip.

In addition to the parser, a toolbox is available under `nrrdjs.Toolbox`. There, some handy tools are provided:
- getting the number of components per voxel
- getting the number of time samples
- getting slices in the native orthogonal axis
- getting the *voxel-two-world* and *world-to-voxel* matrix
- getting values in world and voxel coordinates

TODO:
- Toolbox: better handle time index
- Toolbox: extract a time volume at a given `t`

Unsupported:
- `block` type (quite unstable from a machine to another)
- `data file`/`datafile` (when the header and the data are contained in two separate files)
- `line skip`/`lineskip` (because applies only to detached headers)
- `byte skip`/`byteskip` (because applies only to detached headers)
- hexadecimal encoding (when `encoding: hex` in the header)
- bzip2 compression
