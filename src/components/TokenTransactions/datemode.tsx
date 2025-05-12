import { atom } from 'jotai';

export const DateMode = {
  DATE: 'date',
  AGE: 'age',
} as const;
export type DateMode = (typeof DateMode)[keyof typeof DateMode];
export const dateModeAtom = atom<DateMode>(DateMode.AGE);
