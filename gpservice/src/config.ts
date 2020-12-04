import { ImmutableObject } from "seamless-immutable";

export interface Config {
  reportingURL: string;
}

export type IMConfig = ImmutableObject<Config>;