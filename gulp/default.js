'use strict';

var gulp = require('gulp'),
    runSequence = require('run-sequence');

gulp.task('default', function(callback) {
    runSequence('clean', 'images', 'scripts', 'styles', 'node_modules', 'connect', 'watch', callback);
});
