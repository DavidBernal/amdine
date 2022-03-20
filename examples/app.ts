import amdine from '../index';
import { Data } from './data';

type Program = void;

amdine.define('app', ['data'], function (data: Data) {
  console.log(`Rockets: ${data['count']}`);
});
