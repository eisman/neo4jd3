'use strict';

var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    Server = require('karma').Server;

process.env.NODE_PATH = process.cwd();

gulp.task('test:client', function(done) {
    var configFile = require('path').resolve('karma.conf.js');

    new Server({
        configFile: configFile,
        singleRun: true
    }, done).start();
});

gulp.task('watch:test', function() {
    gulp.watch(['src/main/scripts/**/*.js', 'src/test/scripts/**/*.js'], ['test:client']);
});

gulp.task('test', ['test:client']);
