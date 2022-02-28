import amdine from '../index';

amdine.defineWithDependencies(
  'data',
  ['fetch'],
  async function data(fetch: Fetch) {
    const data = await fetch();
    return data;
  }
);
