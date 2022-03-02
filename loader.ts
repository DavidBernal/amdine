import amdine from './define';
import { globby } from 'globby';
import { join } from 'path';

type InitOptions = { glob?: string };

const loader = (function () {
  async function discovery(options: InitOptions = {}) {
    const glob = options.glob || '*/**/*.(j|t)s';
    const paths = await globby([glob, '!node_modules/**/*', '!**/*.d.ts'], {
      cwd: process.cwd(),
      expandDirectories: { extensions: ['ts', 'js'] },
    });

    for await (const p of paths) {
      console.log('importing ', './' + p);
      await import(join(process.cwd(), p));
    }
  }

  function discoveryAndInit(options: InitOptions = {}) {
    discovery(options).then(() => amdine.init());
  }

  return { discovery, discoveryAndInit };
})();

export default loader;
export const discoveryAndInit = loader.discoveryAndInit;
export const discovery = loader.discovery;
