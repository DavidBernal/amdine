const amdine = (function () {
  //#region types
  type ModuleWithDependenciesDefinition = [
    name: string,
    dependencies: string[],
    factory: Function
  ];
  type Module = string | number | boolean | object | symbol;

  /** Possible Params signature */
  type UnnamedModule = [factory: Function];
  type NamedModule = [name: string, factoryOrValue: Function | Module];
  type UnnamedModuleWithDependencies = [
    dependencies: string[],
    factory: Function
  ];
  type NamedModuleWithDependencies = [
    name: string,
    dependencies: string[],
    factory: Function
  ];

  type Params =
    | NamedModule
    | UnnamedModule
    | NamedModuleWithDependencies
    | UnnamedModuleWithDependencies;

  //#endregion

  //#region type guards
  function isUnnamedModule(params: Params): params is UnnamedModule {
    return params.length === 1 && typeof params[0] === 'function';
  }

  function isNamedModule(m: Params): m is NamedModule {
    return m.length === 2 && typeof m[0] === 'string';
  }

  function isUnnamedModuleWithDependencies(m: Params): m is UnnamedModule {
    return Array.isArray(m[0]) && typeof m[1] === 'function';
  }

  function isNamedModuleWithDependencies(
    m: Params
  ): m is NamedModuleWithDependencies {
    return (
      m.length === 3 &&
      typeof m[0] === 'string' &&
      Array.isArray(m[1]) &&
      typeof m[2] === 'function'
    );
  }
  //#endregion

  //#region internal variables
  const dependencies: Record<string, Module> = {};

  // first: external dependencies
  const unnamedModules = [];

  // second: internal dependencies
  const namedModules = [];

  // third: more complex dependencies
  const namedModulesWithDependencies = [];

  // fourth: entrypoints and similars
  const unnamedModulesWithDependencies = [];

  //#endregion

  //#region private methods
  async function defineUnnamedModule([factory]: UnnamedModule): Promise<void> {
    unnamedModules.push(() => factory());
  }

  async function defineNamedModule([name, value]: NamedModule): Promise<void> {
    if (value instanceof Function) {
      namedModules.push(async () => (dependencies[name] = await value()));
    } else {
      dependencies[name] = value;
    }
  }

  async function defineNamedModuleWithDependencies([
    name,
    deps,
    factory,
  ]: NamedModuleWithDependencies): Promise<void> {
    namedModulesWithDependencies.push([name, deps, factory]);
  }

  function defineUnnamedModuleWithDependencies([
    deps,
    factory,
  ]: UnnamedModuleWithDependencies): void {
    unnamedModulesWithDependencies.push(() =>
      factory(...deps.map((dep) => dependencies[dep]))
    );
  }

  function resolve(fns: Function[]) {
    return Promise.all(fns.map((fn) => fn()));
  }

  //#endregion

  //#region public methods
  async function define(...args: Params): Promise<void> {
    debugger;
    if (isNamedModule(args)) {
      defineNamedModule(args);
    } else if (isUnnamedModule(args)) {
      defineUnnamedModule(args);
    } else if (isUnnamedModuleWithDependencies(args)) {
      defineUnnamedModuleWithDependencies(args);
    } else if (isNamedModuleWithDependencies(args)) {
      defineNamedModuleWithDependencies(args);
    }
  }

  // TODO: Improve algorithm to verify first if all dependencies are satisfied
  async function init(): Promise<void> {
    debugger;

    await resolve(unnamedModules);

    await resolve(namedModules);

    let i = namedModulesWithDependencies.length;
    let completeRound = i * i;
    while (namedModulesWithDependencies.length) {
      completeRound--;
      const [name, deps, factory] = namedModulesWithDependencies.shift();
      if (deps.every((dep) => dep in dependencies)) {
        dependencies[name] = await factory(
          ...deps.map((dep) => dependencies[dep])
        );
      } else {
        namedModulesWithDependencies.push([name, deps, factory]);
      }

      if (completeRound == 0) {
        if (namedModulesWithDependencies.length === i) {
          const problematicDeps = namedModulesWithDependencies
            .flatMap(([, d]) => d)
            .filter((d) => !(d in dependencies))
            .filter((d, j, arr) => arr.indexOf(d) === j);

          console.error(
            'Circular dependency detected or missing dependencies: ' +
              problematicDeps.join(', ')
          );

          console.error(
            'Modules no resolved: ',
            namedModulesWithDependencies.map(([n]) => n).join(',')
          );
          throw new Error(
            'Circular dependency detected or missing dependencies'
          );
        }
        i = namedModulesWithDependencies.length;
        completeRound = i * i;
      }
    }

    await resolve(unnamedModulesWithDependencies);
  }

  //#endregion

  return { define, init };
})();

export default amdine;
export const define = amdine.define;
