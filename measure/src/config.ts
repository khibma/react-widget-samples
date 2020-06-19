import { ImmutableObject } from 'seamless-immutable';

export interface Config {
  units: string;
}

export type IMConfig = ImmutableObject<Config>;
