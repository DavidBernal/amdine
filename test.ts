import * as assert from 'assert';

const getAmdine = () =>
  import(`./index.ts?version=${Math.random()}`).then((m) => m.default);

Promise.resolve()
  .then(async function () {
    console.log('Amdine Works ----------------------------');
    const amdine = await getAmdine();

    amdine.define('c', ['a', 'b'], function (a, b) {
      assert.equal(a, 'a');
      assert.equal(b, 'b');
      console.log('dependencies works correctly');
    });

    amdine.define('b', ['a'], function (a) {
      assert.equal(a, 'a');
      return 'b';
    });

    amdine.define('a', () => {
      return 'a';
    });

    amdine.init();
  })
  .then(async function () {
    console.log('Amdine Circular dependency --------------------------------');
    const amdine = await getAmdine();

    amdine.define('b', ['a'], function (a) {
      assert.equal(a, 'a');
      return 'b';
    });

    amdine.define('a', ['b'], (b) => {
      return 'a';
    });

    amdine.init().catch((err: Error) => {
      assert.equal(
        err.message,
        'Circular dependency detected or missing dependencies'
      );
    });
  })
  .then(async function () {
    console.log('Amdine resolve in correct order -----------------------');
    const amdine = await getAmdine();
    const calls = [];

    amdine.define(['a'], async function (a) {
      calls.push('resolved 4th');
      return 'c';
    });

    amdine.define('a', ['b'], async function (b) {
      calls.push('resolved 3rd');
      return 'a';
    });

    amdine.define('b', async function () {
      calls.push('resolved 2nd');
      return 'b';
    });

    amdine.define(async function () {
      calls.push('resolved 1st');
    });

    await amdine.init();
    assert.equal(
      calls.join(','),
      'resolved 1st,resolved 2nd,resolved 3rd,resolved 4th'
    );
  });
