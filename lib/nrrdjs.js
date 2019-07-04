'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var pako = _interopDefault(require('pako'));
var glMatrix = require('gl-matrix');

/**
 * This is the mapping from the NRRD datatype as written in the NRRD header
 * to the JS typed array equivalent.
 */
const NRRD_TYPES_TO_TYPEDARRAY = {
  "signed char": Int8Array,
  "int8": Int8Array,
  "int8_t": Int8Array,
  "uchar": Uint8Array,
  "unsigned char": Uint8Array,
  "uint8": Uint8Array,
  "uint8_t": Uint8Array,
  "short": Int16Array,
  "short int": Int16Array,
  "signed short": Int16Array,
  "signed short int": Int16Array,
  "int16": Int16Array,
  "int16_t": Int16Array,
  "ushort": Uint16Array,
  "unsigned short": Uint16Array,
  "unsigned short int": Uint16Array,
  "uint16": Uint16Array,
  "uint16_t": Uint16Array,
  "int": Int32Array,
  "signed int": Int32Array,
  "int32": Int32Array,
  "int32_t": Int32Array,
  "uint": Uint32Array,
  "unsigned int": Uint32Array,
  "uint32": Uint32Array,
  "uint32_t": Uint32Array,
  "longlong": BigInt64Array,           // OK for Node/V8/Chrome but not Firefox
  "long long": BigInt64Array,
  "long long int": BigInt64Array,
  "signed long long": BigInt64Array,
  "signed long long int": BigInt64Array,
  "int64": BigInt64Array,
  "int64_t": BigInt64Array,
  "ulonglong": BigUint64Array,
  "unsigned long long": BigUint64Array,
  "unsigned long long int": BigUint64Array,
  "uint64": BigUint64Array,
  "uint64_t": BigUint64Array,
  "float": Float32Array,
  "double": Float64Array
};



const NRRD_TYPES_TO_VIEW_GET = {
  "signed char": 'getInt8',
  "int8": 'getInt8',
  "int8_t": 'getInt8',
  "uchar": 'getUint8',
  "unsigned char": 'getUint8',
  "uint8": 'getUint8',
  "uint8_t": 'getUint8',
  "short": 'getInt16',
  "short int": 'getInt16',
  "signed short": 'getInt16',
  "signed short int": 'getInt16',
  "int16": 'getInt16',
  "int16_t": 'getInt16',
  "ushort": 'getUint16',
  "unsigned short": 'getUint16',
  "unsigned short int": 'getUint16',
  "uint16": 'getUint16',
  "uint16_t": 'getUint16',
  "int": 'getInt32',
  "signed int": 'getInt32',
  "int32": 'getInt32',
  "int32_t": 'getInt32',
  "uint": 'getUint32',
  "unsigned int": 'getUint32',
  "uint32": 'getUint32',
  "uint32_t": 'getUint32',
  "longlong": null,
  "long long": null,
  "long long int": null,
  "signed long long": null,
  "signed long long int": null,
  "int64": null,
  "int64_t": null,
  "ulonglong": null,
  "unsigned long long": null,
  "unsigned long long int": null,
  "uint64": null,
  "uint64_t": null,
  "float": 'getFloat32',
  "double": 'getFloat64'
};


const SPACE_TO_SPACEDIMENSIONS = {
  'right-anterior-superior': 3,
  'ras': 3,
  'left-anterior-superior': 3,
  'las': 3,
  'left-posterior-superior': 3,
  'lps': 3,
  'right-anterior-superior-time': 4,
  'rast': 4,
  'left-anterior-superior-time': 4,
  'last': 4,
  'left-posterior-superior-time': 4,
  'lpst': 4,
  'scanner-xyz': 3,
  'scanner-xyz-time': 4,
  '3d-right-handed': 3,
  '3d-left-handed': 3,
  '3d-right-handed-time': 4,
  '3d-left-handed-time': 4
};

// in NRRD, some "kinds" have to respect a certain size. For example, the kind
// "quaternion" has to be of size 4 (xyzw).
// When the value is 'null', then no enforcement is made.
// Note: the fields have been turned to lowercase here
const KIND_TO_SIZE = {
  'domain': null,
  'space': null,
  'time': null,
  'list': null,
  'point': null,
  'vector': null,
  'covariant-vector': null,
  'normal': null,
  'stub': 1,
  'scalar': 1,
  'complex': 2,
  '2-vector': 2,
  '3-color': 3,
  'rgb-color': 3,
  'hsv-color': 3,
  'xyz-color': 3,
  '4-color': 4,
  'rgba-color': 4,
  '3-vector': 3,
  '3-gradient': 3,
  '3-normal': 3,
  '4-vector': 4,
  'quaternion': 4,
  '2d-symmetric-matrix': 3,
  '2d-masked-symmetric-matrix': 4,
  '2d-matrix': 4,
  '2d-masked-matrix': 4,
  '3d-symmetric-matrix': 6,
  '3d-masked-symmetric-matrix': 7,
  '3d-matrix': 9,
  '3d-masked-matrix': 10,
  '???': null
};

/**
 * Parse a buffer of a NRRD file.
 * Throws an exception if the file is not a proper NRRD file.
 * @param {ArrayBuffer} nrrdBuffer - the NRRD file buffer
 * @param {Object} options - the option object
 * @param {boolean} options.headerOnly - Parses only the header if true, parses header and data if false (default: false)
 * @return {Object} NRRD header and data such as {header: Object, data: TypedArray }
 */
function parse(nrrdBuffer, options){
  let magicControl = 'NRRD000';
  let magicTest = String.fromCharCode.apply(null, new Uint8Array(nrrdBuffer, 0, magicControl.length));

  if(magicControl !== magicTest){
    throw new Error('This file is not a NRRD file')
  }

  let {header, dataByteOffset} = parseHeader(nrrdBuffer);

  if('headerOnly' in options && options.headerOnly ){
    return {header: header, data: null}
  }

  let data = parseData(nrrdBuffer, header, dataByteOffset);
  return {header: header, data: data}
}


/**
 * @private
 * Parses the header
 */
function parseHeader(nrrdBuffer){
  let byteArrayHeader = [];
  let dataStartPosition = null;
  let view = new DataView(nrrdBuffer);

  for(let i=0; i<nrrdBuffer.byteLength; i++){
    byteArrayHeader.push(String.fromCharCode(view.getUint8(i)));

    if(i>0 && byteArrayHeader[i-1] === '\n' && byteArrayHeader[i] === '\n'){
      dataStartPosition = i + 1;
      break
    }
  }

  if(dataStartPosition === null){
    throw new Error('The NRRD header is corrupted.')
  }

  let comments = [];

  let headerLines = byteArrayHeader.join('').trim().split(/\r\n|\n/).map(l => l.trim());

  let preMap = headerLines.slice(1)
  .filter( s => { // removing empty lines
    return s.length > 0
  })
  .filter( s => { // removing comments
    if(s[0] === '#'){
      comments.push(s.slice(1).trim());
    }
    return (s[0] !== '#')
  })
  .map( s => {
    let keyVal = s.split(':');
    return {
      key: keyVal[0].trim(),
      val: keyVal[1].trim()
    }
  });

  let nrrdHeader = {};

  preMap.forEach( field => {
    nrrdHeader[field.key] = field.val;
  });

  // parsing each fields of the header
  if(nrrdHeader['sizes']){
    nrrdHeader['sizes'] = nrrdHeader.sizes.split(/\s+/).map( n => parseInt(n));
  }

  if(nrrdHeader['space dimension']){
    nrrdHeader['space dimension'] = parseInt(nrrdHeader['space dimension']);
  }

  if(nrrdHeader['space']){
    nrrdHeader['space dimension'] = SPACE_TO_SPACEDIMENSIONS[nrrdHeader['space'].toLowerCase()];
  }

  if(nrrdHeader['dimension']){
    nrrdHeader['dimension'] = parseInt(nrrdHeader['dimension']);
  }

  if(nrrdHeader['space directions']){
    nrrdHeader['space directions'] = nrrdHeader['space directions'].split(/\s+/)
        .map(triple => {
          if(triple.trim() === 'none'){
            return null
          }
          return triple.slice(1, triple.length-1)
                       .split(',')
                       .map(n => parseFloat(n))
        });

    if(nrrdHeader['space directions'].length !== nrrdHeader['dimension']){
      throw new Error('"space direction" property has to contain as many elements as dimensions. Non-spatial dimesnsions must be refered as "none". See http://teem.sourceforge.net/nrrd/format.html#spacedirections for more info.')
    }
  }

  if(nrrdHeader['space units']){
    nrrdHeader['space units'] = nrrdHeader['space units'].split(/\s+/);
  }

  if(nrrdHeader['space origin']){
    nrrdHeader['space origin'] = nrrdHeader['space origin']
        .slice(1, nrrdHeader['space origin'].length-1)
        .split(',')
        .map(n => parseFloat(n));
  }

  if(nrrdHeader['measurement frame']){
    nrrdHeader['measurement frame'] = nrrdHeader['measurement frame'].split(/\s+/)
        .map(triple => {
          if(triple.trim() === 'none'){
            return null
          }
          return triple.slice(1, triple.length-1)
                       .split(',')
                       .map(n => parseFloat(n))
        });
  }

  if(nrrdHeader['kinds']){
    nrrdHeader['kinds'] = nrrdHeader['kinds'].split(/\s+/);

    if(nrrdHeader['kinds'].length !== nrrdHeader['sizes'].length){
      throw new Error(`The "kinds" property is expected to have has many elements as the "size" property.`)
    }

    nrrdHeader['kinds'].forEach((k, i) => {
      let expectedLength = KIND_TO_SIZE[k.toLowerCase()];
      let foundLength = nrrdHeader['sizes'][i];
      if(expectedLength !== null && expectedLength !== foundLength){
        throw new Error(`The kind "${k}" expect a size of ${expectedLength} but ${foundLength} found`)
      }
    });

  }

  if(nrrdHeader['min']){
    nrrdHeader['min'] = parseFloat(nrrdHeader['min']);
  }

  if(nrrdHeader['max']){
    nrrdHeader['max'] = parseFloat(nrrdHeader['max']);
  }

  if(nrrdHeader['old min']){
    nrrdHeader['old min'] = parseFloat(nrrdHeader['old min']);
  }

  if(nrrdHeader['old max']){
    nrrdHeader['old max'] = parseFloat(nrrdHeader['old max']);
  }

  if(nrrdHeader['spacings']){
    nrrdHeader['spacings'] = nrrdHeader['spacings'].split(/\s+/).map(n => parseFloat(n));
  }

  if(nrrdHeader['thicknesses']){
    nrrdHeader['thicknesses'] = nrrdHeader['thicknesses'].split(/\s+/).map(n => parseFloat(n));
  }

  if(nrrdHeader['axis mins']){
    nrrdHeader['axis mins'] = nrrdHeader['axis mins'].split(/\s+/).map(n => parseFloat(n));
  }

  if(nrrdHeader['axismins']){
    nrrdHeader['axismins'] = nrrdHeader['axismins'].split(/\s+/).map(n => parseFloat(n));
  }

  if(nrrdHeader['axis maxs']){
    nrrdHeader['axis maxs'] = nrrdHeader['axis maxs'].split(/\s+/).map(n => parseFloat(n));
  }

  if(nrrdHeader['axismaxs']){
    nrrdHeader['axismaxs'] = nrrdHeader['axismaxs'].split(/\s+/).map(n => parseFloat(n));
  }

  if(nrrdHeader['centers']){
    nrrdHeader['centers'] = nrrdHeader['centers'].split(/\s+/).map(mode => {
      if(mode === 'cell' || mode === 'node'){
        return mode
      } else {
        return null
      }
    });
  }


  if(nrrdHeader['labels']){
    nrrdHeader['labels'] = nrrdHeader['labels'].split(/\s+/);
  }

  // some additional metadata that are not part of the header will be added here
  nrrdHeader.extra = {};

  // adding the comments from lines starting with #
  nrrdHeader.extra.comments = comments;

  // having the stride can be handy.
  nrrdHeader.extra.stride = [1];
  for(let i=1; i<nrrdHeader.sizes.length; i++){
    nrrdHeader.extra.stride.push(nrrdHeader.extra.stride[i-1] * nrrdHeader.sizes[i-1]);
  }

  return {
    header: nrrdHeader,
    dataByteOffset: dataStartPosition
  }
}

/**
 * @private
 * Parses the data
 */
function parseData(nrrdBuffer, header, dataByteOffset){
  let dataBuffer = null;
  let arrayType = NRRD_TYPES_TO_TYPEDARRAY[header.type];
  let nbElementsFromHeader = header.sizes.reduce((prev, curr) => prev * curr);
  let min = +Infinity;
  let max = -Infinity;
  let data = null;

  let isTextEncoded = header.encoding === 'ascii' || header.encoding === 'txt' || header.encoding === 'text';

  if(header.encoding === 'raw'){
    dataBuffer = nrrdBuffer;
  } else if(isTextEncoded){
    let numbers = String.fromCharCode.apply(null, new Uint8Array(nrrdBuffer, dataByteOffset))
              .split(/\r\n|\n|\s/)
              .map(s => s.trim())
              .filter(s => s !== '')
              .map(s => {
                let numValue = parseFloat(s);
                min = Math.min(min, numValue);
                max = Math.max(max, numValue);
                return numValue
              });
    data = new arrayType(numbers);
  } else if(header.encoding === 'gzip' || header.encoding === 'gz'){
    dataBuffer = pako.inflate(new Uint8Array(nrrdBuffer).slice(dataByteOffset)).buffer;
  } else {
    throw new Error('Only "raw", "ascii" and "gzip" encoding are supported.')
  }

  if(isTextEncoded){
    if(nbElementsFromHeader !== data.length){
      throw new Error('Unconsistency in data buffer length')
    }
  } else {
    let nbElementsFromBufferAndType = dataBuffer.byteLength / arrayType.BYTES_PER_ELEMENT;

    if(nbElementsFromHeader !== nbElementsFromBufferAndType){
      throw new Error('Unconsistency in data buffer length')
    }

    data = new arrayType(nbElementsFromHeader);
    let dataView = new DataView(dataBuffer);
    let viewMethod = NRRD_TYPES_TO_VIEW_GET[header.type];
    let littleEndian = header.endian === 'little' ? true : false;

    for(let i=0; i<nbElementsFromHeader; i++){
      data[i] = dataView[viewMethod](i * arrayType.BYTES_PER_ELEMENT, littleEndian);
      min = Math.min(min, data[i]);
      max = Math.max(max, data[i]);
    }
  }

  header.extra.min = min;
  header.extra.max = max;
  return data
}




// TODO: find a way to know the nb of componenents per voxel.
// We could use the presence of "none" in the prop "space direction" and the prop sizes

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

    let ncpv = Toolbox.getNumberOfComponentPerVoxel(header);
    let sliceStride = header.sizes[0] * header.sizes[1];
    let byteOffset = ncpv * sliceIndex * sliceStride * data.BYTES_PER_ELEMENT;
    let nbElem = sliceStride * ncpv;
    let output = new data.constructor(data.buffer, byteOffset, nbElem);
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
    let outputWidth = header.sizes[0];
    let outputHeight = header.sizes[2];
    let ncpv = Toolbox.getNumberOfComponentPerVoxel(header);
    let output = new data.constructor(outputWidth * outputHeight * ncpv);

    for(let j=0; j<outputHeight; j++){
      let byteOffset = Toolbox.getIndex1D(header, 0, sliceIndex, j) * data.BYTES_PER_ELEMENT;
      let row = new data.constructor(data.buffer, byteOffset, outputWidth * ncpv);
      output.set(row, j * outputWidth * ncpv);
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
    let outputWidth = header.sizes[1];
    let outputHeight = header.sizes[2];
    let ncpv = Toolbox.getNumberOfComponentPerVoxel(header);
    let output = new data.constructor(outputWidth * outputHeight * ncpv);
    let counter = 0;

    // doing that on ncpv = 1 is much faster than using a generic method so we separate.
    // This is due to slicing on YZ planes not being able to leverage any buffer connexity
    if(ncpv === 1){
      for(let j=0; j<outputHeight; j++){
        for(let i=0; i<outputWidth; i++){
          let index1D = sliceIndex * header.extra.stride[0] + i * header.extra.stride[1] + j * header.extra.stride[2];
          output[counter] = data[index1D];
          counter ++;
        }
      }
    } else {
      for(let j=0; j<outputHeight; j++){
        for(let i=0; i<outputWidth; i++){
          let index1D = (sliceIndex * header.extra.stride[0] + i * header.extra.stride[1] + j * header.extra.stride[2]) * ncpv;
          let byteOffset = index1D * data.BYTES_PER_ELEMENT;
          let spectrum = new data.constructor(data.buffer, byteOffset, ncpv);
          output.set( spectrum, counter );
          counter += ncpv;
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
    let ncpv = Toolbox.getNumberOfComponentPerVoxel(header);
    let index1D = (x * header.extra.stride[0] + y * header.extra.stride[1] + z * header.extra.stride[2]) * ncpv;
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
    let ncpv = Toolbox.getNumberOfComponentPerVoxel(header);
    return (x * header.extra.stride[0] + y * header.extra.stride[1] + z * header.extra.stride[2]) * ncpv
  }


  /**
   * Get the affine matrix for converting voxel coordinates into world/subject coordinates
   * @param {Object} header - the header object corresponding to the NRRD file
   * @return {Float32Array} the matrix as a 4x4 column major
   */
  static getVoxelToWorldMatrix(header){
    let offset = 'space origin' in header ? header['space origin'] : [0, 0, 0];
    let sc = 'space directions' in header ?
                header['space directions'].filter(v => v !== null) :
                [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ];
    let v2w = glMatrix.mat4.fromValues(sc[0][0], sc[0][1], sc[0][2], 0,
                                       sc[1][0], sc[1][1], sc[1][2], 0,
                                       sc[2][0], sc[2][1], sc[2][2], 0,
                                       offset[0], offset[1], offset[2], 1);
    return v2w
  }


  /**
   * Get the affine matrix for converting world/subject coordinates into voxel coordinates
   * @param {Object} header - the header object corresponding to the NRRD file
   * @return {Float32Array} the matrix as a 4x4 column major
   */
  static getWorldToVoxelMatrix(header){
    let v2w = Toolbox.getVoxelToWorldMatrix(header);
    let w2v = glMatrix.mat4.create();
    glMatrix.mat4.invert(w2v, v2w);
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
    let worldPos = glMatrix.vec3.fromValues(x, y, z);
    let w2v = Toolbox.getWorldToVoxelMatrix(header);
    let voxelPos = glMatrix.vec3.create();
    glMatrix.vec3.transformMat4(voxelPos, worldPos, w2v);
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
    let voxelPosition = Toolbox.getVoxelPositionFromWorldPosition(header, x, y, z);
    return Toolbox.getValue(data, header, ...voxelPosition)
  }


}

var index = ({
  parse,
  Toolbox
});

module.exports = index;
//# sourceMappingURL=nrrdjs.js.map
