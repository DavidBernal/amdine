import amdine from '../index';
import type { Fetch } from './fetch';

export type Data = JSON;

amdine.define(
  'data',
  ['fetch'],
  async function data(fetch: Fetch): Promise<Data> {
    const data = await fetch();
    return data as Data;
  }
);
