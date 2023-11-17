import { randomBytes } from "crypto";

export const randomText = () => randomBytes(40).toString('hex');
export const randomNumber = (max: number) => Math.floor(Math.random() * max);

/** 2020-01-01T00:00:00Z */
const START_TS = 1577829600000;

export const randomDate = () => new Date(START_TS + randomNumber(Date.now() - START_TS));
