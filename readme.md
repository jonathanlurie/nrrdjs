**Pure Javascript NRRD parser for browser and Node**

[EXAMPLE](https://github.com/jonathanlurie/nrrdjs/blob/master/examples/slicexy.html)  
[DOC](https://github.com/jonathanlurie/nrrdjs/blob/master/documentation.md)

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
