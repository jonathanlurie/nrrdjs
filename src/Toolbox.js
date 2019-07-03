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

    let sliceStride = header.sizes[0] * header.sizes[1]
    let byteOffset = sliceIndex * sliceStride * data.BYTES_PER_ELEMENT
    let nbElem = sliceStride
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
    let output = new data.constructor(outputWidth * outputHeight)
    let tempData = []

    for(let j=0; j<outputHeight; j++){
      let index1Dbegin = Toolbox.getIndex1D(header, 0, sliceIndex, j)
      let index1Dend = index1Dbegin + outputWidth
      let byteOffset = index1Dbegin * data.BYTES_PER_ELEMENT
      let row = new data.constructor(data.buffer, byteOffset, outputWidth)
      output.set(row, j*outputWidth)
    }

    return output
  }


  static getSliceYZ(data, header, sliceIndex, options){
    // TODO add NCPP
    let outputWidth = header.sizes[1]
    let outputHeight = header.sizes[2]
    let output = new data.constructor(outputWidth * outputHeight)
    let counter = 0

    for(let j=0; j<outputHeight; j++){
      for(let i=0; i<outputWidth; i++){
        let index1D = sliceIndex * header.extra.stride[0] + i * header.extra.stride[1] + j * header.extra.stride[2]
        output[counter] = data[index1D]
        counter ++
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

    let index1D = x * header.extra.stride[0] + y * header.extra.stride[1] + z * header.extra.stride[2]
    return data[index1D]
  }

  static getIndex1D(header, x, y, z){
    if(x < 0 || x >= header.sizes[0] ||
       y < 0 || y >= header.sizes[1] ||
       z < 0 || z >= header.sizes[2]){
      throw new Error(`The position is out of range.`)
    }

    return x * header.extra.stride[0] + y * header.extra.stride[1] + z * header.extra.stride[2]
  }


}


export default Toolbox
