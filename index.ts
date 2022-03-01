import { globby } from 'globby';
import { join } from 'path';

export default (function () {
  // TODO: Improve algorithm to verify first if all dependencies are satisfied
  const _deps = {};
  const stack = [];
  const libs = Promise.resolve();

  type InitOptions = {
    glob?: string;
  };

  async function init(options: InitOptions = {}) {
    const glob = options.glob || '*/**/*.(j|t)s';
    const paths = await globby([glob, '!node_modules/**/*', '!**/*.d.ts'], {
      cwd: process.cwd(),
      expandDirectories: { extensions: ['ts', 'js'] },
    });
    console.log('paths', paths);

    for await (const p of paths) {
      console.log('importing ', './' + p);
      await import(join(process.cwd(), p));
    }

    await libs;

    let i = stack.length;
    let completeRound = i * i;
    while (stack.length) {
      completeRound--;
      const [name, deps, factory] = stack.shift();
      if (deps.every((dep) => dep in _deps)) {
        _deps[name] = await factory(...deps.map((dep) => _deps[dep]));
      } else {
        stack.push([name, deps, factory]);
      }

      if (completeRound == 0) {
        if (stack.length === i) {
          const problematicDeps = stack
            .flatMap(([, d]) => d)
            .filter((d) => !(d in _deps))
            .filter((d, j, arr) => arr.indexOf(d) === j);

          console.error(
            'Circular dependency detected or missing dependencies: ' +
              problematicDeps.join(', ')
          );

          console.error(
            'Modules no resolved: ',
            stack.map(([n]) => n).join(',')
          );

          process.exit(1);
        }
        i = stack.length;
        completeRound = i * i;
      }
    }
  }

  async function define(name: string, value: any) {
    if (value instanceof Function) {
      _deps[name] = await value();
    } else {
      _deps[name] = value;
    }
  }

  function defineWithDependencies(
    name: string,
    deps: string[],
    factory: Function
  ) {
    stack.push([name, deps, factory]);
  }

  return { define, defineWithDependencies, init };
})();
