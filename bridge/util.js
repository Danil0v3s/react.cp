// ip example: 192.168.2.1
exports.inet_aton = (ip) => {
    // split into octets
    var a = ip.split('.');
    var buffer = new ArrayBuffer(4);
    var dv = new DataView(buffer);
    for (var i = 0; i < 4; i++) {
        dv.setUint8(i, a[i]);
    }
    return (dv.getUint32(0));
}

// num example: 3232236033
exports.inet_ntoa = (num) => {
    var nbuffer = new ArrayBuffer(4);
    var ndv = new DataView(nbuffer);
    ndv.setUint32(0, num);

    var a = new Array();
    for (var i = 0; i < 4; i++) {
        a[i] = ndv.getUint8(i);
    }
    return a.join('.');
}

exports.toArrayBuffer = (buf) => {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

exports.byteLength = (str) => {
    // returns the byte length of an utf8 string
    var s = str.length;
    for (var i=str.length-1; i>=0; i--) {
      var code = str.charCodeAt(i);
      if (code > 0x7f && code <= 0x7ff) s++;
      else if (code > 0x7ff && code <= 0xffff) s+=2;
      if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
    }
    return s;
  }
