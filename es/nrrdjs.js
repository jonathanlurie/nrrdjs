/**
 * This is the mapping from the NRRD datatype as written in the NRRD header
 * to the JS typed array equivalent.
 */

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
    return header
  }

  console.log(dataByteOffset);


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
  }

  if(nrrdHeader['dimension']){
    nrrdHeader['dimension'] = parseInt(nrrdHeader['dimension']);
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

  if(nrrdHeader['space dimension']){
    nrrdHeader['space dimension'] = parseInt(nrrdHeader['space dimension']);
  }

  return {
    header: nrrdHeader,
    dataByteOffset: dataStartPosition
  }
}

var index = ({
  parse,
});

export default index;
//# sourceMappingURL=nrrdjs.js.map
