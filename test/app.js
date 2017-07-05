"use strict";
require.config({
    baseUrl: '../',
    paths: {
        'q': 'bower_components/q/q',
        'promise': 'src/facades/promise',
        'transaction': 'src/transaction',
        'crud': 'src/crud',
        'database': 'src/database',
        'factory': 'src/factory',
        'utils': 'src/utils',
        'test': 'test/test'
    }
});
require(['test']);
