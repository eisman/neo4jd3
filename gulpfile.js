/**
 *  The gulp tasks are split into several files in the gulp directory
 */
'use strict';

var gulp = require('gulp'),
    wrench = require('wrench');

/**
 *  This will load all js in the gulp directory
 */
wrench.readdirSyncRecursive('./gulp').filter(function(file) {
    console.log(file);
    return (/\.(js)$/i).test(file);
}).map(function(file) {
    require('./gulp/' + file);
});
