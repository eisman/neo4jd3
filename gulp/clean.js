'use strict';

var conf = require('./conf'),
    del = require('del'),
    gulp = require('gulp');

gulp.task('clean', function() {
    return del([
        conf.paths.dist + '/**/*',
        conf.paths.docs + '/css/neo4jd3.css',
        conf.paths.docs + '/css/neo4jd3.min.css',
        conf.paths.docs + '/js/neo4jd3.js',
        conf.paths.docs + '/js/neo4jd3.min.js'
    ]);
});
