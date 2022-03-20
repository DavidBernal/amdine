# amdine (WIP)

amdine is a dependency resolution for nodeJs.

## Why

Import dependencies based on path (`require("../whatever")`, `import a from './foo'`) is a bad idea, cause is difficult mock.
Also, some people don't like classes on javascript.
This library try to solve doing resolution based on name, with AMD flavour (not in deep).

## How to initialize

```js
import amdine from 'amdine';

// import all your modules that use amdine

amdine.init();
```

## How to use

`define` function is the core. Use it to define modules.

### Signature

```ts
define = (factory: Function) => void;
define = (name: string, factoryOrValue: Function) => void;
define = (dependencies: string[], factory: Function) => void;
define = (name: string, dependencies: string[], factory: Function) => void;
```

Examples:

```js
define('my-object', function(){ return {} as myModule });

define('my-object', {value: 'hello'});

define('my-number', 42);

define('logger', function () {
  return { log: console.log };
});

define('my-task', ['logger'], function (logger) {
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

define('my-mod', ['state', 'logger'], function (createState, logger) {
  const [ state, setState ] = createState;
  logger.log(state);
});
```

For more examples look examples folder
