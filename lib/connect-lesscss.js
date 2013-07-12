(function() {
  var dirname, readFile, render;

  render = require('less').render;

  readFile = require('fs').readFile;

  dirname = require('path').dirname;

  module.exports = function(source, options, callback) {
    var paths;

    if (!source) throw new Error('source less file path is required');

    if (options == null) options = {};
    options.paths = options.paths || [dirname(source)];
	options.failSilently = (options.failSilently !== false);
	options.answerRequest = (options.answerRequest !== false);
	
	if (typeof callback !== 'function') callback = function() {};

    return function(req, res, next) {
      return readFile(source, function(err, txt) {
		if (err) {
			callback(err);
			return false;
		}

        return render(txt.toString(), {
          paths: options.paths
        }, function(err, css) {

		  if (!options.answerRequest)  {
			if (callback) callback(err, css);
			return css;
		  }

		  if (err && !options.failSilently) {
		     err.message = err.message || 'Unknow error parsing file';
		     err.message = err.message;
			 res.status(500);

			 if (callback) callback(err, css);

			 return res.end(err.message);
		  }

          res.writeHead(200, {
            'Content-Type': 'text/css',
            'Content-Length': css.length
          });

		  if (callback) callback(err, css);
		  return res.end(css);
        });
      });
    };
  };

}).call(this);
