// This file is an entry point for Angular tests.
// Avoids some weird issues when using Webpack + Angular.

var testsContext = require.context('./app', true, /\.test$/);
console.log('Tests context', testsContext.keys());
testsContext.keys().forEach(testsContext);
