import * as glMatrix from 'gl-matrix'

/**
 * The Toolbox is a set of static methods to extract some data from a parsed NRRD
 * using the `header` and/or the `data` as returned by `nrrdjs.parse(...)`.
 *
 * The NRRD format does not make any assumption about the naming of the axis
 * (X, Y, Z, A, B, C, etc.) but for the sake of accessibility, the Toolbox assumes
 * that if there is more than 1 components per voxel (ex: RGB), they are encoded
 * on the fastest axis. Otherwise:
 * - The axis called `X` is encoded on the fastest axis
 * - The axis called `Z` is encoded on the slowest axis
 * - The axis called `Y` is encoded in between
 * - The time axis, if any, is even slower than `Z`
 *
 * Note: the fast axis is the one where element along it are contiguous on the buffer (stride: 1)
 */
class Toolbox {

  /**
   * Get the number of components per voxel. For example, for a RGB volume,
   * the ncpv is 3.
   * @param {object} header - the header object as returned by the parser
   * @return {number}
   */
  static getNumberOfComponentPerVoxel(header){
    if(header['dimension'] === header['space dimension'] ||
       header['space directions'][0] !== null){
      return 1
    }

    // when the first 'space directions' is 'none' it means the fastest axis
    // is the components per pixe (rgb, vector, quat, etc.)
    return header['sizes'][0]
  }


  /**
   * Get the number of time samples for this volume. If it's not a time sequence,
   * then there is only a single time sample.
   * @param {object} header - the header object as returned by the parser
   * @return {number}
   */
  static getNumberOfTimeSamples(header){
    if(header['dimension'] === header['space dimension'] ||
       header['space directions'][header['space directions'].length-1] !== null){
      return 1
    }

    return header['sizes'][header['sizes'].length-1]
  }

  /**
   * Extract a slice of the XY plane in voxel coordinates. The horizontal axis of the
   * 2D slice is along the X axis of the volume, the vertical axis on the 2D slice is
   * along the Y axis of the volume, origin is at top-left.
   * @param {TypedArray} data - the volumetric data
   * @param {Object} header - the header object corresponding to the NRRD file
   * @param {Number} sliceIndex - index of the slice
   * @return {Object} as {width: Number, height: Number, data: TypedArray} where the data is
   * of the same type as the volume buffer.
   */
  static getSliceXY(data, header, sliceIndex){
    if(sliceIndex < 0 || sliceIndex >= header.sizes[2]){
      throw new Error(`The slice index is out of bound. Must be in [0, ${header.sizes[2]-1}]`)
    }

    let ncpv = Toolbox.getNumberOfComponentPerVoxel(header)
    let sliceStride = header.sizes[0] * header.sizes[1]
    let byteOffset = ncpv * sliceIndex * sliceStride * data.BYTES_PER_ELEMENT
    let nbElem = sliceStride * ncpv
    let output = new data.constructor(data.buffer, byteOffset, nbElem)
    return {
      width: header.sizes[0],
      height: header.sizes[1],
      ncpv: ncpv,
      data: output
    }
  }


  /**
   * Extract a slice of the XZ plane in voxel coordinates. The horizontal axis of the
   * 2D slice is along the X axis of the volume, the vertical axis on the 2D slice is
   * along the Z axis of the volume, origin is at top-left.
   * @param {TypedArray} data - the volumetric data
   * @param {Object} header - the header object corresponding to the NRRD file
   * @param {Number} sliceIndex - index of the slice
   * @return {Object} as {width: Number, height: Number, data: TypedArray} where the data is
   * of the same type as the volume buffer.
   */
  static getSliceXZ(data, header, sliceIndex){
    // TODO add NCPP
    let outputWidth = header.sizes[0]
    let outputHeight = header.sizes[2]
    let ncpv = Toolbox.getNumberOfComponentPerVoxel(header)
    let output = new data.constructor(outputWidth * outputHeight * ncpv)
    let tempData = []

    for(let j=0; j<outputHeight; j++){
      let byteOffset = Toolbox.getIndex1D(header, 0, sliceIndex, j) * data.BYTES_PER_ELEMENT
      let row = new data.constructor(data.buffer, byteOffset, outputWidth * ncpv)
      output.set(row, j * outputWidth * ncpv)
    }

    return {
      width: header.sizes[0],
      height: header.sizes[2],
      ncpv: ncpv,
      data: output
    }
  }


  /**
   * Extract a slice of the YZ plane in voxel coordinates. The horizontal axis of the
   * 2D slice is along the Y axis of the volume, the vertical axis on the 2D slice is
   * along the Z axis of the volume, origin is at top-left.
   * @param {TypedArray} data - the volumetric data
   * @param {Object} header - the header object corresponding to the NRRD file
   * @param {Number} sliceIndex - index of the slice
   * @return {Object} as {width: Number, height: Number, data: TypedArray} where the data is
   * of the same type as the volume buffer.
   */
  static getSliceYZ(data, header, sliceIndex){
    // TODO add NCPP
    let outputWidth = header.sizes[1]
    let outputHeight = header.sizes[2]
    let ncpv = Toolbox.getNumberOfComponentPerVoxel(header)
    let output = new data.constructor(outputWidth * outputHeight * ncpv)
    let counter = 0

    // doing that on ncpv = 1 is much faster than using a generic method so we separate.
    // This is due to slicing on YZ planes not being able to leverage any buffer connexity
    if(ncpv === 1){
      for(let j=0; j<outputHeight; j++){
        for(let i=0; i<outputWidth; i++){
          let index1D = sliceIndex * header.extra.stride[0] + i * header.extra.stride[1] + j * header.extra.stride[2]
          output[counter] = data[index1D]
          counter ++
        }
      }
    } else {
      for(let j=0; j<outputHeight; j++){
        for(let i=0; i<outputWidth; i++){
          let index1D = (sliceIndex * header.extra.stride[0] + i * header.extra.stride[1] + j * header.extra.stride[2]) * ncpv
          let byteOffset = index1D * data.BYTES_PER_ELEMENT
          let spectrum = new data.constructor(data.buffer, byteOffset, ncpv)
          output.set( spectrum, counter )
          counter += ncpv
        }
      }
    }

    return {
      width: header.sizes[1],
      height: header.sizes[2],
      ncpv: ncpv,
      data: output
    }
  }


  /**
   * Get the value at the position (x, y, z) in voxel coordinates.
   * @param {TypedArray} data - the volumetric data
   * @param {Object} header - the header object corresponding to the NRRD file
   * @param {Number} x - the x position (fastest varying axis)
   * @param {Number} y - the y position
   * @param {Number} z - the z position (slowest varying)
   * @return {Array} as [v] because of compatibility to multiple components per voxel
   */
  static getValue(data, header, x, y, z){
    if(x < 0 || x >= header.sizes[0] ||
       y < 0 || y >= header.sizes[1] ||
       z < 0 || z >= header.sizes[2]){
      throw new Error(`The position is out of range.`)
    }
    let ncpv = Toolbox.getNumberOfComponentPerVoxel(header)
    let index1D = (x * header.extra.stride[0] + y * header.extra.stride[1] + z * header.extra.stride[2]) * ncpv
    // return data[index1D]
    return data.slice(index1D, index1D * ncpv)
  }


  /**
   * Get the 1D index within the buffer for the given (x, y, z) in voxel coordinates
   * @param {Object} header - the header object corresponding to the NRRD file
   * @param {Number} x - the x position (fastest varying axis)
   * @param {Number} y - the y position
   * @param {Number} z - the z position (slowest varying)
   * @param {Number} value at this position in 1D buffer
   */
  static getIndex1D(header, x, y, z){
    if(x < 0 || x >= header.sizes[0] ||
       y < 0 || y >= header.sizes[1] ||
       z < 0 || z >= header.sizes[2]){
      throw new Error(`The position is out of range.`)
    }
    let ncpv = Toolbox.getNumberOfComponentPerVoxel(header)
    return (x * header.extra.stride[0] + y * header.extra.stride[1] + z * header.extra.stride[2]) * ncpv
  }


  /**
   * Get the affine matrix for converting voxel coordinates into world/subject coordinates
   * @param {Object} header - the header object corresponding to the NRRD file
   * @return {Float32Array} the matrix as a 4x4 column major
   */
  static getVoxelToWorldMatrix(header){
    let offset = 'space origin' in header ? header['space origin'] : [0, 0, 0]
    let sc = 'space directions' in header ?
                header['space directions'].filter(v => v !== null) :
                [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ]
    let v2w = glMatrix.mat4.fromValues(sc[0][0], sc[0][1], sc[0][2], 0,
                                       sc[1][0], sc[1][1], sc[1][2], 0,
                                       sc[2][0], sc[2][1], sc[2][2], 0,
                                       offset[0], offset[1], offset[2], 1)
    return v2w
  }


  /**
   * Get the affine matrix for converting world/subject coordinates into voxel coordinates
   * @param {Object} header - the header object corresponding to the NRRD file
   * @return {Float32Array} the matrix as a 4x4 column major
   */
  static getWorldToVoxelMatrix(header){
    let v2w = Toolbox.getVoxelToWorldMatrix(header)
    let w2v = glMatrix.mat4.create()
    glMatrix.mat4.invert(w2v, v2w)
    return w2v
  }


  /**
   * Get the position voxel coordinates providing a position in world coordinates
   * @param {Object} header - the header object corresponding to the NRRD file
   * @param {Number} x - the x position (fastest varying axis)
   * @param {Number} y - the y position
   * @param {Number} z - the z position (slowest varying)
   * @return {Array} as [x, y, z]
   */
  static getVoxelPositionFromWorldPosition(header, x, y, z){
    let worldPos = glMatrix.vec3.fromValues(x, y, z)
    let w2v = Toolbox.getWorldToVoxelMatrix(header)
    let voxelPos = glMatrix.vec3.create()
    glMatrix.vec3.transformMat4(voxelPos, worldPos, w2v)
    return voxelPos.map(n => Math.round(n))
  }


  /**
   * Get the value at the given world coordinates.
   * Note: the voxel coordinates is rounded
   * @param {TypedArray} data - the volumetric data
   * @param {Object} header - the header object corresponding to the NRRD file
   * @param {Number} x - the x position (fastest varying axis)
   * @param {Number} y - the y position
   * @param {Number} z - the z position (slowest varying)
   * @return {Array} as [v] because of compatibility to multiple components per voxel
   */
  static getWorldValue(data, header, x, y, z){
    let voxelPosition = Toolbox.getVoxelPositionFromWorldPosition(header, x, y, z)
    return Toolbox.getValue(data, header, ...voxelPosition)
  }


}


export default Toolbox
