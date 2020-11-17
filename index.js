const Module = require('module');
const { readFileSync } = require('fs');
const { resolve, dirname } = require('path');

let _root = __dirname;
const _deps = {};

exports.configure = function (options) {
  if (options.root) _root = options.root;
  if (options.deps) {
    for (const [key, value] of Object.entries(options.deps)) {
      const modulePath = require.resolve(resolve(_root, key));
      _deps[modulePath] = value;
    }
  }
};

async function requireFromString(src, filename) {
  var paths = Module._nodeModulePaths(dirname(filename));
  var parent = require.main;
  var m = new Module(filename, parent);
  // var m = new Module();
  m.filename = filename;
  m.paths = paths;
  m._compile(src, filename);
  return m.exports;
}

async function define(deps, factory) {
  // prettier-ignore
  try { throw new Error(); } catch (e) { var file = e; }

  const path = file.stack.toString().split('\n')[2].split(':')[0].split('(')[1];

  const name = path.replace(_root + '/', '').replace(/\.js$/, '');
  const namePath = require.resolve(resolve(_root, name));
  if (!factory) {
    _deps[namePath] = typeof deps === 'function' ? deps() : deps;
    return;
  }

  const depedencies = [];
  for (let i = 0; i < deps.length; i++) {
    const dep = deps[i];
    const depPath = require.resolve(resolve(_root, dep));
    if (!_deps[depPath]) {
      let script = readFileSync(depPath, 'utf8');

      script = script.replace(/define\s?\(/gim, 'module.exports = define(');
      await requireFromString(script, depPath).catch((err) => {
        console.log(`Error loading ${namePath} on ${path}.`);
        console.log(err);
        process.exit(1);
      });
    }
    depedencies.push(_deps[depPath]);
  }
  _deps[namePath] = await factory(...depedencies);

  // if (name.endsWith('/index')) {
  //   const folderName = name.split('/').reverse().slice(1).reverse().join('/');
  //   _deps[folderName] = _deps[name];
  // }
}

// @ts-ignore
global.define = define;
