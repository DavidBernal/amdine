const { configure } = require('../index');

configure({
  root: './packages', // folder where our modules are located
  deps: { 
    // if you want to override some module
  },
});

require('./entrypoint');
