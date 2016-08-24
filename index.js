var through = require('through2');
var path = require('path');

var gutil = require('gulp-util');
var File = gutil.File;
var PluginError = gutil.PluginError;

function templateCache(baseName) {

    var partials = [];
    var baseFiles = [];

    baseName = baseName || 'index.html';

    function transform(file, encoding, callback) {

        // if (file.isStream()) {
        //     this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
        //     return callback();
        // }

        if (file.isNull()) {
            callback();
            return;
        }

        // if (file.isBuffer()) {

            var fileName = path.basename(file.relative);
            var directoryName = path.dirname(file.relative);

            var fileInfo = {
                name: fileName,
                directory: directoryName,
                file: file,
                ext: path.extname(fileName)
            };

            if (fileName == baseName) {

                baseFiles.push(fileInfo);

            } else {

                partials.push(fileInfo);
            }

            callback();

        // }

    }

    function flush(callback) {

        // iterate through each partial
        for (var partialsIndex = 0; partialsIndex < partials.length; partialsIndex++) {

            var partial = partials[partialsIndex];

            // replace index file content with template
            baseFiles = baseFiles.map(function (baseFile) {

                // find index file by directory
                if (baseFile.directory === partial.directory) {

                    // create cache template
                    var scriptText = '<script type=\"text/ng-template\" id=\"' + partial.directory + "/" + partial.name + '\">' +
                                        partial.file.contents +
                                    '</script>';

                    // convert to buffer
                    var cachedTemplate = new Buffer(scriptText);

                    // concatenate with index file content
                    baseFile.file.contents = Buffer.concat([cachedTemplate, baseFile.file.contents]);

                }

                return baseFile;
            });

        }

        for (var baseIndex = 0; baseIndex < baseFiles.length; baseIndex++) {

            // create new file for each index file
            var newBaseFile = new File();

            // set contents
            newBaseFile.contents = baseFiles[baseIndex].file.contents;
            // set name
            newBaseFile.path = baseFiles[baseIndex].directory + baseFiles[baseIndex].ext;

            // add new index file to stream
            this.push(newBaseFile);
        }

        callback();

    }

    return through.obj(transform, flush);
}



module.exports = templateCache;
