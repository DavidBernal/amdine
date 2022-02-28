import amdine from '../index';

type Program = void;

amdine.defineWithDependencies('app', ['data'], function (data) {
  console.log(`Rockets: ${data.count}`);
});
