import * as glMatrix from 'gl-matrix'


class Toolbox {

  static getNumberOfComponentPerVoxel(header){
    if(header['dimension'] === header['space dimension'] ||
       header['space directions'][0] !== null){
      return 1
    }

    // when the first 'space directions' is 'none' it means the fastest axis
    // is the components per pixe (rgb, vector, quat, etc.)
    return header['sizes'][0]
  }


  static getNumberOfTimeSamples(header){
    if(header['dimension'] === header['space dimension'] ||
       header['space directions'][header['space directions'].length-1] !== null){
      return 1
    }

    return header['sizes'][header['sizes'].length-1]
  }

  /**
   * Extract a native slice in voxel coordinates. The "native slice" is the one
   * that has the fastest dimension (axis) of the volume as width and the second
   * fastest dimension as height. Then, the slowest varying axis is the index of
   * the slice.
   * @param {TypedArray} data - the volumetric data
   * @param {Object} header - the header object corresponding to the NRRD file
   * @param {Number} sliceIndex - index of the slice
   * @return {TypedArray} - the array is a slice in the native TypedArray, unless options.uint8 is true,
   * then an Uint8Array is returned
   */
  static getNativeSlice(data, header, sliceIndex, options){
    if(sliceIndex < 0 || sliceIndex >= header.sizes[2]){
      throw new Error(`The slice index is out of bound. Must be in [0, ${header.sizes[2]-1}]`)
    }

    let ncpv = Toolbox.getNumberOfComponentPerVoxel(header)

    let sliceStride = header.sizes[0] * header.sizes[1]
    let byteOffset = ncpv * sliceIndex * sliceStride * data.BYTES_PER_ELEMENT
    let nbElem = sliceStride * ncpv
    let slice = new data.constructor(data.buffer, byteOffset, nbElem)
    return slice
  }


  static getSliceXY(data, header, sliceIndex, options){
    return Toolbox.getNativeSlice(data, header, sliceIndex, options)
  }


  static getSliceXZ(data, header, sliceIndex, options){
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

    return output
  }


  static getSliceYZ(data, header, sliceIndex, options){
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

    return output
  }


  /**
   * xyz here are voxel coords, where x is the fastest axis and z is the slowest
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

  static getIndex1D(header, x, y, z){
    if(x < 0 || x >= header.sizes[0] ||
       y < 0 || y >= header.sizes[1] ||
       z < 0 || z >= header.sizes[2]){
      throw new Error(`The position is out of range.`)
    }
    let ncpv = Toolbox.getNumberOfComponentPerVoxel(header)
    return (x * header.extra.stride[0] + y * header.extra.stride[1] + z * header.extra.stride[2]) * ncpv
  }


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


  static getWorldToVoxelMatrix(header){
    let v2w = Toolbox.getVoxelToWorldMatrix(header)
    let w2v = glMatrix.mat4.create()
    glMatrix.mat4.invert(w2v, v2w)
    return w2v
  }


  static getVoxelPositionFromWorldPosition(header, x, y, z){
    let worldPos = glMatrix.vec3.fromValues(x, y, z)
    let w2v = Toolbox.getWorldToVoxelMatrix(header)
    let voxelPos = glMatrix.vec3.create()
    glMatrix.vec3.transformMat4(voxelPos, worldPos, w2v)
    return voxelPos.map(n => Math.round(n))
  }


  static getWorldValue(data, header, x, y, z){
    let voxelPosition = Toolbox.getVoxelPositionFromWorldPosition(header, x, y, z)
    return Toolbox.getValue(data, header, ...voxelPosition)
  }


}


export default Toolbox
