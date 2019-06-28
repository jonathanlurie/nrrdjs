class Toolbox {

  /**
   * Extract a native slice in voxel coordinates. The "native slice" is the one
   * that has the fastest dimension (axis) of the volume as width and the second
   * fastest dimension as height. Then, the slowest varying axis is the index of
   * the slice.
   * @param {TypedArray} data - the volumetric data
   * @param {Object} header - the header object corresponding to the NRRD file
   * @param {Number} sliceIndex - index of the slice
   * @param {Object} options - the option object
   * @param {Boolean} options.uint8 - frame the values in the [0, 255] interval (default: false)
   * @param {Boolean} options.shallow - returns a shallow slice (if slice is modified, the volume will as well) (default: true)
   * @return {TypedArray} - the array is a slice in the native TypedArray, unless options.uint8 is true,
   * then an Uint8Array is returned
   */
  static getNativeSlice(data, header, sliceIndex, options){
    if(sliceIndex < 0 || sliceIndex >= header.sizes[2]){
      throw new Error(`The slice index is out of bound. Must be in [0, ${header.sizes[2]-1}]`)
    }

    let uint8 = 'uint8' in options ? options.uint8 : false
    let shallow = 'shallow' in options ? options.shallow : true


    let sliceStride = header.sizes[0] * header.sizes[1]
    let slice = null

    if(shallow){
      let byteOffset = sliceIndex * sliceStride * data.BYTES_PER_ELEMENT
      let byteEnd = sliceStride
      slice = new data.constructor(data.buffer, byteOffset, byteEnd)
    } else {
      slice = data.slice(sliceIndex * sliceStride, (sliceIndex + 1) * sliceStride)
    }

    if(uint8){
      let uint8Slice = new Uint8Array(slice.length)
      let span = header.extra.max - header.extra.min
      for(let i=0; i<slice.length; i++){
        uint8Slice[i] = ((slice[i] - header.extra.min) / span ) * 255
      }
      return uint8Slice
    } else {
      return slice
    }
  }


}


export default Toolbox
