'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var pako = _interopDefault(require('pako'));

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
 * Parse the header
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

  let headerLines = byteArrayHeader.join('').trim().split('\n').map(l => l.trim());

  let preMap = headerLines.slice(1)
  .filter( s => { // removing empty lines
    return s.length > 0
  })
  .filter( s => { // removing comments
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
    nrrdHeader['sizes'] = nrrdHeader.sizes.split(' ').map( n => parseInt(n));
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
    nrrdHeader['space directions'] = nrrdHeader['space directions'].split(' ')
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


  if(nrrdHeader['space origin']){
    nrrdHeader['space origin'] = nrrdHeader['space origin']
        .slice(1, nrrdHeader['space origin'].length-1)
        .split(',')
        .map(n => parseFloat(n));
  }

  if(nrrdHeader['kinds']){
    nrrdHeader['kinds'] = nrrdHeader['kinds'].split(' ');
  }

  // some additional metadata that are not part of the header will be added here
  nrrdHeader.extra = {};

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


function parseData(nrrdBuffer, header, dataByteOffset){
  let dataBuffer = null;

  console.log(header);
  console.log(dataByteOffset);

  if(header.encoding === 'raw'){
    dataBuffer = nrrdBuffer;
  } else if(header.encoding === 'gzip' || header.encoding === 'gz'){
    dataBuffer = pako.inflate(new Uint8Array(nrrdBuffer).slice(dataByteOffset)).buffer;
  } else {
    throw new Error('Only "raw" and "gzip" encoding are supported.')
  }

  let arrayType = NRRD_TYPES_TO_TYPEDARRAY[header.type];
  let nbElementsFromHeader = header.sizes.reduce((prev, curr) => prev * curr);
  let nbElementsFromBufferAndType = dataBuffer.byteLength / arrayType.BYTES_PER_ELEMENT;

  if(nbElementsFromHeader !== nbElementsFromBufferAndType){
    throw new Error('Unconsistency in data buffer length')
  }

  let data = new arrayType(nbElementsFromHeader);
  let dataView = new DataView(dataBuffer);
  let viewMethod = NRRD_TYPES_TO_VIEW_GET[header.type];
  let littleEndian = header.endian === 'little' ? true : false;
  let min = +Infinity;
  let max = -Infinity;


  for(let i=0; i<nbElementsFromHeader; i++){
    data[i] = dataView[viewMethod](i * arrayType.BYTES_PER_ELEMENT, littleEndian);
    min = Math.min(min, data[i]);
    max = Math.max(max, data[i]);
  }

  header.extra.min = min;
  header.extra.max = max;

  console.log(data);
  return data
}

// TODO: find a way to know the nb of componenents per voxel.
// We could use the presence of "none" in the prop "space direction" and the prop sizes

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

    let sliceStride = header.sizes[0] * header.sizes[1];
    let byteOffset = sliceIndex * sliceStride * data.BYTES_PER_ELEMENT;
    let nbElem = sliceStride;
    let slice = new data.constructor(data.buffer, byteOffset, nbElem);
    return slice
  }


  static getSliceXY(data, header, sliceIndex, options){
    return Toolbox.getNativeSlice(data, header, sliceIndex, options)
  }


  static getSliceXZ(data, header, sliceIndex, options){
    // TODO add NCPP
    let outputWidth = header.sizes[0];
    let outputHeight = header.sizes[2];
    let output = new data.constructor(outputWidth * outputHeight);

    for(let j=0; j<outputHeight; j++){
      let index1Dbegin = Toolbox.getIndex1D(header, 0, sliceIndex, j);
      let byteOffset = index1Dbegin * data.BYTES_PER_ELEMENT;
      let row = new data.constructor(data.buffer, byteOffset, outputWidth);
      output.set(row, j*outputWidth);
    }

    return output
  }


  static getSliceYZ(data, header, sliceIndex, options){
    // TODO add NCPP
    let outputWidth = header.sizes[1];
    let outputHeight = header.sizes[2];
    let output = new data.constructor(outputWidth * outputHeight);
    let counter = 0;

    for(let j=0; j<outputHeight; j++){
      for(let i=0; i<outputWidth; i++){
        let index1D = sliceIndex * header.extra.stride[0] + i * header.extra.stride[1] + j * header.extra.stride[2];
        output[counter] = data[index1D];
        counter ++;
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

    let index1D = x * header.extra.stride[0] + y * header.extra.stride[1] + z * header.extra.stride[2];
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

var index = ({
  parse,
  Toolbox
});

module.exports = index;
//# sourceMappingURL=nrrdjs.js.map
