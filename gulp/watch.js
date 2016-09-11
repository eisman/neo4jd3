'use strict';

var gulp = require('gulp');

gulp.task('watch', function() {
    gulp.watch('src/main/fonts/**/*', ['fonts']);
    gulp.watch('src/main/index.html', ['html']);
    gulp.watch('src/main/images/**/*', ['images']);
    gulp.watch('src/main/json/**/*', ['json']);
    gulp.watch('src/main/scripts/**/*.js', ['scripts']);
    gulp.watch('src/main/styles/**/*.scss', ['styles']);
});
