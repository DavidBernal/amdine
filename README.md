# amdine (WIP)

amdine is a dependency resolution for nodeJs.

## Why

I think that resolve dependencies based on path (`require("../whatever")`) is a bad idea, cause is difficult mock.
This library try to solve doing resolution based on name, with AMD flavour (not in deep).

## How to initialize

With default config:

`node -r amdine index.js`

With custom config:

```js
import amdine from 'amdine';

amdine.init();
// OR
const options = {
  glob?: '*/**/*.(j|t)s' // default value
};
amdine.init(options);
```

## How to use

`define` function needs 2 parameters. The 1st param will be the name of the package. The 2nd will be factory function or direct value.

`defineWithDependencies` function needs 3 parameters.
The 1st param will be the name of the package.
The 2nd will be the list of dependencies.
The 3rd will be factory function with dependencies received as param in the same order.

Examples:

```js
define('my-object', function(){ return {} as myModule });

define('my-object', {value: 'hello'});

define('my-number', 42);

define('logger', function () {
  return { log: console.log };
});

defineWithDependencies('my-task', ['logger'], function (logger) {
  logger.log('hello in task');
});

define('state', function () {
  function createState(){
    const state = {};
    function setState(newState) {
      state = newState;
    }
    return [state, setState];
  }
  return createState;
});

defineWithDependencies('my-mod', ['state', 'logger'], function (createState, logger) {
  const [ state, setState ] = createState;
  logger.log(state);
});
```

For more examples look examples folder
