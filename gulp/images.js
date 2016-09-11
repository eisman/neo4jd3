'use strict';

var conf = require('./conf'),
    connect = require('gulp-connect'),
    gulp = require('gulp'),
    imagemin = require('gulp-imagemin');

gulp.task('images', function() {
    return gulp.src('src/main/images/**/*')
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .pipe(gulp.dest(conf.paths.docs + '/img'))
        .pipe(connect.reload());
});
