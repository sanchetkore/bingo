export type GameStatus = 'LOBBY' | 'STARTING' | 'ACTIVE' | 'BINGO_CLAIMED' | 'FINISHED';

export type WinningPatternType = 'row' | 'column' | 'diagonal';

export interface WinningPattern {
  type: WinningPatternType;
  index: number; // 0-4 for row/col, 0 for main diagonal, 1 for anti-diagonal
}

export interface CardCell {
  value: number | 'FREE';
  row: number;
  col: number;
}

export interface BingoCard {
  grid: CardCell[][];
  canonical_repr: string;
}

export interface PlayerPublic {
  player_id: string;
  name: string;
  is_host: boolean;
  is_connected: boolean;
  has_entropy: boolean;
}

export interface WinnerInfo {
  player_id: string;
  name: string;
  winning_pattern: WinningPattern;
  winning_number?: number | null;
  canonical_card?: string | null;
  claimed_at: number;
}

export interface GameStatePublic {
  game_id: string;
  game_code: string;
  status: GameStatus;
  host_player_id: string;
  players: PlayerPublic[];
  current_turn?: string | null;
  called_numbers: number[];
  last_number?: number | null;
  server_seed_hash: string;
  winner?: WinnerInfo | null;
  server_seed?: string | null;
}

// WebSocket incoming & outgoing message interfaces
export interface InboundWSMessage {
  type: string;
  [key: string]: any;
}

export interface OutboundWSMessage {
  type: string;
  [key: string]: any;
}
