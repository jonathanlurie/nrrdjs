import pako from 'pako'
import { NRRD_TYPES_TO_TYPEDARRAY, NRRD_TYPES_TO_VIEW_GET } from './constants'


/**
 * Parse a buffer of a NRRD file.
 * Throws an exception if the file is not a proper NRRD file.
 * @param {ArrayBuffer} nrrdBuffer - the NRRD file buffer
 * @param {Object} options - the option object
 * @param {boolean} options.headerOnly - Parses only the header if true, parses header and data if false (default: false)
 * @return {Object} NRRD header and data such as {header: Object, data: TypedArray }
 */
export default function parse(nrrdBuffer, options){
  let magicControl = 'NRRD000'
  let magicTest = String.fromCharCode.apply(null, new Uint8Array(nrrdBuffer, 0, magicControl.length))

  if(magicControl !== magicTest){
    throw new Error('This file is not a NRRD file')
  }

  let {header, dataByteOffset} = parseHeader(nrrdBuffer)

  if('headerOnly' in options && options.headerOnly ){
    return {header: header, data: null}
  }

  let data = parseData(nrrdBuffer, header, dataByteOffset)
  return {header: header, data: data}
}


/**
 * Parse the header
 */
function parseHeader(nrrdBuffer){
  let byteArrayHeader = []
  let dataStartPosition = null
  let view = new DataView(nrrdBuffer)

  for(let i=0; i<nrrdBuffer.byteLength; i++){
    byteArrayHeader.push(String.fromCharCode(view.getUint8(i)))

    if(i>0 && byteArrayHeader[i-1] === '\n' && byteArrayHeader[i] === '\n'){
      dataStartPosition = i + 1
      break
    }
  }

  if(dataStartPosition === null){
    throw new Error('The NRRD header is corrupted.')
  }

  let headerLines = byteArrayHeader.join('').trim().split('\n').map(l => l.trim())

  let preMap = headerLines.slice(1)
  .filter( s => { // removing empty lines
    return s.length > 0
  })
  .filter( s => { // removing comments
    return (s[0] !== '#')
  })
  .map( s => {
    let keyVal = s.split(':')
    return {
      key: keyVal[0].trim(),
      val: keyVal[1].trim()
    }
  })

  let nrrdHeader = {}
  preMap.forEach( field => {
    nrrdHeader[field.key] = field.val
  })


  // parsing each fields of the header
  if(nrrdHeader['sizes']){
    nrrdHeader['sizes'] = nrrdHeader.sizes.split(' ').map( n => parseInt(n))
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
        })
  }

  if(nrrdHeader['dimension']){
    nrrdHeader['dimension'] = parseInt(nrrdHeader['dimension'])
  }

  if(nrrdHeader['space origin']){
    nrrdHeader['space origin'] = nrrdHeader['space origin']
        .slice(1, nrrdHeader['space origin'].length-1)
        .split(',')
        .map(n => parseFloat(n))
  }

  if(nrrdHeader['kinds']){
    nrrdHeader['kinds'] = nrrdHeader['kinds'].split(' ')
  }

  if(nrrdHeader['space dimension']){
    nrrdHeader['space dimension'] = parseInt(nrrdHeader['space dimension'])
  }

  return {
    header: nrrdHeader,
    dataByteOffset: dataStartPosition
  }
}


function parseData(nrrdBuffer, header, dataByteOffset){
  let dataBuffer = null

  console.log(header)
  console.log(dataByteOffset)

  if(header.encoding === 'raw'){
    dataBuffer = nrrdBuffer
  } else if(header.encoding === 'gzip' || header.encoding === 'gz'){
    dataBuffer = pako.inflate(new Uint8Array(nrrdBuffer).slice(dataByteOffset)).buffer
  } else {
    throw new Error('Only "raw" and "gzip" encoding are supported.')
  }

  let arrayType = NRRD_TYPES_TO_TYPEDARRAY[header.type]
  let nbElementsFromHeader = header.sizes.reduce((prev, curr) => prev * curr)
  let nbElementsFromBufferAndType = dataBuffer.byteLength / arrayType.BYTES_PER_ELEMENT

  if(nbElementsFromHeader !== nbElementsFromBufferAndType){
    throw new Error('Unconsistency in data buffer length')
  }

  let data = new arrayType(nbElementsFromHeader)
  let dataView = new DataView(dataBuffer)
  let viewMethod = NRRD_TYPES_TO_VIEW_GET[header.type]
  let littleEndian = header.endian === 'little' ? true : false
  let min = +Infinity
  let max = -Infinity


  for(let i=0; i<nbElementsFromHeader; i++){
    data[i] = dataView[viewMethod](i * arrayType.BYTES_PER_ELEMENT, littleEndian)
    min = Math.min(min, data[a])
    max = Math.max(max, data[a])
  }

  console.log(data)
  return data
}

// TODO: find a way to know the nb of componenents per voxel.
// We could use the presence of "none" in the prop "space direction" and the prop sizes
