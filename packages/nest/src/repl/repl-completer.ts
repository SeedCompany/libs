import { type Many, patchMethod } from '@seedcompany/common';
import type { AsyncCompleter } from 'node:readline';
import type { REPLServer } from 'node:repl';

export type ReplCompleter = (line: string) => readonly string[] | undefined;

/**
 * Prepend one or more completer(s) to the REPL server's completer.
 * If no suggestions are returned, then the next/original completer is called.
 *
 * Despite the original signature, the REPL doesn't support async completion.
 * It kinda works but messes with the tab completion.
 */
export const prependReplCompleter = (
  replServer: REPLServer,
  completers: Many<ReplCompleter>,
) => {
  const completer: ReplCompleter = Array.isArray(completers)
    ? (line) => {
        for (const completer of completers) {
          const suggestions = completer(line);
          if (suggestions) {
            return suggestions;
          }
        }
      }
    : (completers as ReplCompleter);

  patchMethod(
    replServer as { completer: AsyncCompleter },
    'completer',
    (orig) => (line, cb) => {
      const suggestions = completer(line);
      if (suggestions) {
        cb(null, [suggestions as string[], line]);
        return;
      }
      orig(line, cb);
    },
  );
};
