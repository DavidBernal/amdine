# amdine (WIP)

amdine is a dependency resolution for nodeJs. 

## Why

I think that resolve dependencies based on path (`require("../whatever")`) is a bad idea, cause is difficult mock.
This library try to solve doing resolution based on name, with AMD flavour (not in deep).

## How to initialize 

With default config:

``` node -r amdine index.js ```


With custom config:

```js
const { configure } = require('amdine');

configure({
  root: './packages', // folder where our modules are located
  deps: { 
    // if you want to override some module
  },
});

require('./entrypoint');

```

## How to use

This module provides a global function called "define". 
`Define` accept 1 or 2 parameters. If are 2, 1st will be array of dependencies and 2nd will be factory function.
If is only 1:
  1) if is a factory function, will be called
  2) if is another thing, this thing will be the value of module

Exmaples:
```js
define(['dep1', 'dep2'], function (dep1, dep2) {});

define(function(){ return {} as myModule });

define({value: 'hello'});

define(42);
```

### Exmaple 1
Simple usage:
```js 
// entrypoint.js

define([], function(){
  // do somthing
})
```

### Exmaple 2
Declaring package:
```js 
// ./apckages/logger.js

define([], function(){
  return {log: console.log}
})
```

Now use it:
```js
define(['logger'], function(logger){
  // logger = console.log
})
```

### Example 3

Async module:

```js
// ./packages/async/data
define([], async function(){
  const data = await fetch('fake-server');
  return data;
})
```

Consume:
```js
define(['async/data'], function(data) {
  // data = object from server
})
```

For more examples look examples folder


## TODO

- Improve documentation
- Add examples with tests
- Add examples with typescript
- Add examples with jsdocs