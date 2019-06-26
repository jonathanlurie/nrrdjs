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


/**
 * This is the mapping from the NRRD datatype as written in the NRRD header
 * to the JS DataView binary reading methods.
 */
const BUFFER_READ_METHODS = {
  "signed char": {
    "little": 'readInt8',
    "big": 'readInt8'
  },
  "int8": {
    "little": 'readInt8',
    "big": 'readInt8'
  },
  "int8_t": {
    "little": 'readInt8',
    "big": 'readInt8'
  },
  "uchar": {
    "little": 'readUInt8',
    "big": 'readUInt8'
  },
  "unsigned char": {
    "little": 'readUInt8',
    "big": 'readUInt8'
  },
  "uint8": {
    "little": 'readUInt8',
    "big": 'readUInt8'
  },
  "uint8_t": {
    "little": 'readUInt8',
    "big": 'readUInt8'
  },
  "short": {
    "little": 'readInt16LE',
    "big": 'readInt16BE'
  },
  "short int": {
    "little": 'readInt16LE',
    "big": 'readInt16BE'
  },
  "signed short": {
    "little": 'readInt16LE',
    "big": 'readInt16BE'
  },
  "signed short int": {
    "little": 'readInt16LE',
    "big": 'readInt16BE'
  },
  "int16": {
    "little": 'readInt16LE',
    "big": 'readInt16BE'
  },
  "int16_t": {
    "little": 'readInt16LE',
    "big": 'readInt16BE'
  },
  "ushort": {
    "little": 'readUInt16LE',
    "big": 'readUInt16BE'
  },
  "unsigned short": {
    "little": 'readUInt16LE',
    "big": 'readUInt16BE'
  },
  "unsigned short int": {
    "little": 'readUInt16LE',
    "big": 'readUInt16BE'
  },
  "uint16": {
    "little": 'readUInt16LE',
    "big": 'readUInt16BE'
  },
  "uint16_t": {
    "little": 'readUInt16LE',
    "big": 'readUInt16BE'
  },
  "int": {
    "little": 'readInt32LE',
    "big": 'readInt32BE'
  },
  "signed int": {
    "little": 'readInt32LE',
    "big": 'readInt32BE'
  },
  "int32": {
    "little": 'readInt32LE',
    "big": 'readInt32BE'
  },
  "int32_t": {
    "little": 'readInt32LE',
    "big": 'readInt32BE'
  },
  "uint": {
    "little": 'readUInt32LE',
    "big": 'readUInt32BE'
  },
  "unsigned int": {
    "little": 'readUInt32LE',
    "big": 'readUInt32BE'
  },
  "uint32": {
    "little": 'readUInt32LE',
    "big": 'readUInt32BE'
  },
  "uint32_t": {
    "little": 'readUInt32LE',
    "big": 'readUInt32BE'
  },
  "longlong": {
    "little": 'readBigInt64LE',
    "big": 'readBigInt64BE'
  },           // OK for Node/V8/Chrome but not Firefox
  "long long": {
    "little": 'readBigInt64LE',
    "big": 'readBigInt64BE'
  },
  "long long int": {
    "little": 'readBigInt64LE',
    "big": 'readBigInt64BE'
  },
  "signed long long": {
    "little": 'readBigInt64LE',
    "big": 'readBigInt64BE'
  },
  "signed long long int": {
    "little": 'readBigInt64LE',
    "big": 'readBigInt64BE'
  },
  "int64": {
    "little": 'readBigInt64LE',
    "big": 'readBigInt64BE'
  },
  "int64_t": {
    "little": 'readBigInt64LE',
    "big": 'readBigInt64BE'
  },
  "ulonglong": {
    "little": 'readBigUInt64LE',
    "big": 'readBigUInt64BE'
  },
  "unsigned long long": {
    "little": 'readBigUInt64LE',
    "big": 'readBigUInt64BE'
  },
  "unsigned long long int": {
    "little": 'readBigUInt64LE',
    "big": 'readBigUInt64BE'
  },
  "uint64": {
    "little": 'readBigUInt64LE',
    "big": 'readBigUInt64BE'
  },
  "uint64_t": {
    "little": 'readBigUInt64LE',
    "big": 'readBigUInt64BE'
  },
  "float": {
    "little": 'readFloatLE',
    "big": 'readFloatBE'
  },
  "double": {
    "little": 'readDoubleLE',
    "big": 'readDoubleBE'
  }
}


export {
  NRRD_TYPES_TO_TYPEDARRAY,
  BUFFER_READ_METHODS
}
