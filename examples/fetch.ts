// I still to use require for external packages
import amdine from '../index';
import json from './data.json';

export type Fetch = () => Promise<any>;

amdine.define('fetch', function (): Fetch {
  return () => {
    console.log('Fetch Module: Getting data with delay');
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(json);
      }, 7000);
    });
  };
});
