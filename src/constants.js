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
}



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
}


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
}

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
}

export {
  NRRD_TYPES_TO_TYPEDARRAY,
  NRRD_TYPES_TO_VIEW_GET,
  SPACE_TO_SPACEDIMENSIONS,
  KIND_TO_SIZE
}
