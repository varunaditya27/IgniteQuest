import { Bodoni_Moda, Anton, Montserrat, Archivo } from 'next/font/google';

// Display serif — the marquee/wordmark voice. High-contrast strokes read as
// engraved gold under stage light instead of a soft template serif.
export const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap',
});

// Scoreboard/numeral face — condensed and heavy, for anything that is a
// number a crowd needs to read from the back row: scores, timers, ranks.
export const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
});

// UI label voice — all-caps button/tag text, tracked wide.
export const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

// Body copy — sturdy grotesque for anything read at length (forms, host console).
export const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});
