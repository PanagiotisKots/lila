import { SquareName as Key, Piece, Role } from 'chessops';
import { AssertData } from './levelCtrl';
import { readKeys } from './util';

type Assert = (level: AssertData) => boolean;

const pieceMatch = (piece: Piece | undefined, matcher: Piece): boolean =>
  piece?.role === matcher.role && piece.color === matcher.color;

const pieceOnAnyOf =
  (matcher: Piece, keys: Key[]): Assert =>
  (level: AssertData) =>
    keys.some(key => pieceMatch(level.chess.get(key), matcher));

const fenToMatcher = (fenPiece: string): Piece => ({
  role: fenPiece.toLowerCase() as Role,
  color: fenPiece.toLowerCase() === fenPiece ? 'black' : 'white',
});

export const pieceOn =
  (fenPiece: string, key: Key): Assert =>
  (level: AssertData) =>
    pieceMatch(level.chess.get(key), fenToMatcher(fenPiece));

export const pieceNotOn =
  (fenPiece: string, key: Key): Assert =>
  (level: AssertData) =>
    !pieceMatch(level.chess.get(key), fenToMatcher(fenPiece));

export const noPieceOn = (keys: string | Key[]): Assert => {
  const keyArr = readKeys(keys);
  return (level: AssertData) => level.chess.occupiedKeys().some(sq => !keyArr.includes(sq));
};

export const whitePawnOnAnyOf = (keys: string | Key[]): Assert =>
  pieceOnAnyOf(fenToMatcher('P'), readKeys(keys));

export const extinct =
  (color: Color): Assert =>
  (level: AssertData) => {
    const fen = level.chess.fen().split(' ')[0].replace(/\//g, '');
    return fen === (color === 'white' ? fen.toLowerCase() : fen.toUpperCase());
  };

export const check: Assert = (level: AssertData) => level.chess.instance.isCheck();

export const mate: Assert = (level: AssertData) => level.chess.instance.isCheckmate();

export const lastMoveSan =
  (san: string): Assert =>
  (level: AssertData) => {
    const moves = level.chess.sanHistory();
    return moves[moves.length - 1] === san;
  };

export function checkIn(nbMoves: number): Assert {
  return (level: AssertData) => level.vm.nbMoves <= nbMoves && level.chess.instance.isCheck();
}

export function noCheckIn(nbMoves: number): Assert {
  return (level: AssertData) => level.vm.nbMoves >= nbMoves && !level.chess.instance.isCheck();
}

export function not(assert: Assert): Assert {
  return (level: AssertData) => !assert(level);
}

export function and(...asserts: Assert[]): Assert {
  return (level: AssertData) => asserts.every(a => a(level));
}

export function or(...asserts: Assert[]): Assert {
  return (level: AssertData) => asserts.some(a => a(level));
}

export const scenarioComplete: Assert = (level: AssertData) => level.scenario.isComplete();

export const scenarioFailed: Assert = (level: AssertData) => level.scenario.isFailed();
