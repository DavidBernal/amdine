import { globby } from 'globby';

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
    const paths = await globby([glob, '!node_modules/**/*'], {
      expandDirectories: { extensions: ['ts', 'js'] },
    });

    for await (const p of paths) {
      await import('./' + p);
    }

    await libs;

    let i = stack.length;
    let completeRound = i * i;
    while (stack.length) {
      completeRound--;
      const [name, deps, factory] = stack.pop();
      if (deps.every((dep) => dep in _deps)) {
        _deps[name] = await factory(...deps.map((dep) => _deps[dep]));
      } else {
        stack.push([name, deps, factory]);
      }

      if (completeRound == 0) {
        if (stack.length === i) {
          const problematicDeps = stack
            .flatMap(([name, deps]) => deps)
            .filter((deps) => !(deps in _deps))
            .filter((deps, i, arr) => arr.indexOf(deps) === i);
          console.error(
            'Circular dependency detected or missing dependencies: ' +
              problematicDeps.join(', ')
          );
          process.exit(1);
        }
        i = stack.length;
        completeRound = i * i;
      }
      continue;
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
