var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { globby } from 'globby';
export default (function () {
    // TODO: Improve algorithm to verify first if all dependencies are satisfied
    const _deps = {};
    const stack = [];
    const libs = Promise.resolve();
    async function init(options = {}) {
        var e_1, _a;
        const glob = options.glob || '*/**/*.(j|t)s';
        const paths = await globby([glob, '!node_modules/**/*'], {
            expandDirectories: { extensions: ['ts', 'js'] },
        });
        try {
            for (var paths_1 = __asyncValues(paths), paths_1_1; paths_1_1 = await paths_1.next(), !paths_1_1.done;) {
                const p = paths_1_1.value;
                await import('./' + p);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (paths_1_1 && !paths_1_1.done && (_a = paths_1.return)) await _a.call(paths_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        await libs;
        let i = stack.length;
        let completeRound = i * i;
        while (stack.length) {
            completeRound--;
            const [name, deps, factory] = stack.pop();
            if (deps.every((dep) => dep in _deps)) {
                _deps[name] = await factory(...deps.map((dep) => _deps[dep]));
            }
            else {
                stack.push([name, deps, factory]);
            }
            if (completeRound == 0) {
                if (stack.length === i) {
                    const problematicDeps = stack
                        .flatMap(([name, deps]) => deps)
                        .filter((deps) => !(deps in _deps))
                        .filter((deps, i, arr) => arr.indexOf(deps) === i);
                    console.error('Circular dependency detected or missing dependencies: ' +
                        problematicDeps.join(', '));
                    process.exit(1);
                }
                i = stack.length;
                completeRound = i * i;
            }
            continue;
        }
    }
    async function define(name, value) {
        if (value instanceof Function) {
            _deps[name] = await value();
        }
        else {
            _deps[name] = value;
        }
    }
    function defineWithDependencies(name, deps, factory) {
        stack.push([name, deps, factory]);
    }
    return { define, defineWithDependencies, init };
})();
