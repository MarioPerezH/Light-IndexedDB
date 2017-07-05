require.config({
    baseUrl: '../dist/',
    paths: {
        'promise': 'src/facades/promise',
        'transaction': 'src/transaction',
        'crud': 'src/crud',
        'database': 'src/database',
        'factory': 'src/factory',
        'utils': 'src/utils',
        'test': 'test/test',
        'q': 'bower_components/q/q'
    }
});

require(['test']);
