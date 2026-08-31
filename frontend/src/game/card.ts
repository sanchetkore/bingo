import { WinningPattern } from './types';

export const BINGO_COLUMNS = ['B', 'I', 'N', 'G', 'O'] as const;

export const COLUMN_RANGES = {
  B: { min: 1, max: 15, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  I: { min: 16, max: 30, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  N: { min: 31, max: 45, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  G: { min: 46, max: 60, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  O: { min: 61, max: 75, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
} as const;

export function getColumnLetterForNumber(num: number): string {
  if (num >= 1 && num <= 15) return 'B';
  if (num >= 16 && num <= 30) return 'I';
  if (num >= 31 && num <= 45) return 'N';
  if (num >= 46 && num <= 60) return 'G';
  if (num >= 61 && num <= 75) return 'O';
  return '';
}

export function getPatternCoordinates(pattern: WinningPattern): [number, number][] {
  if (pattern.type === 'row') {
    return [0, 1, 2, 3, 4].map((c) => [pattern.index, c]);
  }
  if (pattern.type === 'column') {
    return [0, 1, 2, 3, 4].map((r) => [r, pattern.index]);
  }
  if (pattern.type === 'diagonal') {
    if (pattern.index === 0) {
      return [0, 1, 2, 3, 4].map((i) => [i, i]);
    }
    return [0, 1, 2, 3, 4].map((i) => [i, 4 - i]);
  }
  return [];
}
