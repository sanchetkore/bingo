import { BingoCard, WinningPattern } from './types';
import { getPatternCoordinates } from './card';

export function detectWinningPatterns(card: BingoCard, calledNumbersSet: Set<number>): WinningPattern[] {
  const winningPatterns: WinningPattern[] = [];

  const checkPattern = (pattern: WinningPattern): boolean => {
    const coords = getPatternCoordinates(pattern);
    for (const [r, c] of coords) {
      const cell = card.grid[r][c];
      if (cell.value === 'FREE') continue;
      if (typeof cell.value === 'number' && !calledNumbersSet.has(cell.value)) {
        return false;
      }
    }
    return true;
  };

  // Check rows
  for (let r = 0; r < 5; r++) {
    const p: WinningPattern = { type: 'row', index: r };
    if (checkPattern(p)) winningPatterns.push(p);
  }

  // Check columns
  for (let c = 0; c < 5; c++) {
    const p: WinningPattern = { type: 'column', index: c };
    if (checkPattern(p)) winningPatterns.push(p);
  }

  // Check diagonals
  const d0: WinningPattern = { type: 'diagonal', index: 0 };
  if (checkPattern(d0)) winningPatterns.push(d0);

  const d1: WinningPattern = { type: 'diagonal', index: 1 };
  if (checkPattern(d1)) winningPatterns.push(d1);

  return winningPatterns;
}

export function isWinningCell(r: number, c: number, winningPatterns: WinningPattern[]): boolean {
  for (const pat of winningPatterns) {
    const coords = getPatternCoordinates(pat);
    if (coords.some(([pr, pc]) => pr === r && pc === c)) {
      return true;
    }
  }
  return false;
}
