module.exports = function parseCacheControl(field) {

  if (typeof field !== 'string') {
    return null;
  }

  /*
    Cache-Control   = 1#cache-directive
    cache-directive = token [ "=" ( token / quoted-string ) ]
    token           = [^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+
    quoted-string   = "(?:[^"\\]|\\.)*"
  */

  //                             1: directive                                        =   2: token                                              3: quoted-string
  var regex = /(?:^|(?:\s*\,\s*))([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)(?:\=(?:([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)|(?:\"((?:[^"\\]|\\.)*)\")))?/g;

  var header = {};
  var err = field.replace(regex, function($0, $1, $2, $3) {
    var value = $2 || $3;
    header[$1] = value ? value.toLowerCase() : true;
    return '';
  });

  var numbers = [
    'max-age',
    's-maxage'
  ];

  numbers
    .filter(function (key) { return header[key]; })
    .forEach(function (key) {
      try {
        var maxAge = parseInt(header[key], 10);
        if (isNaN(maxAge)) {
          err = 'Cache-Control['+key+'] parsed but is not a number';
        }
        header[key] = maxAge;
      } catch (e) {
        err = 'Cache-Control['+key+'] not parseable';
      }
    });

  return (err ? null : header);
};
