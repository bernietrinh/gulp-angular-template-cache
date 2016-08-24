var gulp            = require('gulp');
var templateCache   = require('./index');

gulp.task('cache', function() {

    gulp.src('views/**/*.html')
        .pipe(templateCache())
        .pipe(gulp.dest('build/'));

});
