var gulp = require('gulp');

var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('uglify', function() {
    return gulp.src('finesse.js')
            .pipe(rename('finesse.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist'));
});

gulp.task('default', ['uglify']);
