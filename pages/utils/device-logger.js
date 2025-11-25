import { log as Logger } from "@zos/utils";

const MAX_LINE_LENGTH = 100;
const CONTINUATION = "...";

export class DeviceLogger {
  constructor(name) {
    this.name = name;
    this.logger = Logger.getLogger(name);
  }

  _chunkMessage(message) {
    if (message.length <= MAX_LINE_LENGTH) return [message];

    const chunks = [];
    let remaining = message;

    while (remaining.length > 0) {
      const isFirst = chunks.length === 0;
      const reservedLen = isFirst
        ? CONTINUATION.length
        : CONTINUATION.length * 2;
      const availableLen = MAX_LINE_LENGTH - reservedLen;
      const fitsInLast =
        remaining.length <=
        MAX_LINE_LENGTH - (isFirst ? 0 : CONTINUATION.length);

      if (fitsInLast) {
        chunks.push(isFirst ? remaining : `${CONTINUATION}${remaining}`);
        break;
      }

      let splitIdx = remaining.lastIndexOf(" ", availableLen);
      if (splitIdx < availableLen * 0.5) splitIdx = availableLen;

      const chunk = remaining.slice(0, splitIdx).trim();
      const prefix = isFirst ? "" : CONTINUATION;
      chunks.push(`${prefix}${chunk}${CONTINUATION}`);
      remaining = remaining.slice(splitIdx).trim();
    }

    return chunks;
  }

  _logLines(level, lines) {
    const total = lines.length;
    for (let i = 0; i < total; i++) {
      const prefix = total > 1 ? `[${i + 1}/${total}] ` : "";
      this.logger[level](prefix + lines[i], "");
    }
  }

  _stringify(arg) {
    if (arg instanceof Error) return null;
    if (typeof arg !== "object" || arg === null) return String(arg);
    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  }

  _logWithLevel(level, ...args) {
    const beforeError = [];
    const afterError = [];
    let errorObj = null;

    for (const arg of args) {
      if (arg instanceof Error) {
        errorObj = arg;
        continue;
      }
      const str = this._stringify(arg);
      (errorObj ? afterError : beforeError).push(str);
    }

    if (!errorObj) {
      this._logLines(level, this._chunkMessage(beforeError.join(" ")));
      return;
    }

    const allLines = [];
    if (beforeError.length)
      allLines.push(...this._chunkMessage(beforeError.join(" ")));

    allLines.push(
      ...this._chunkMessage(`${errorObj.name || "Error"}: ${errorObj.message}`)
    );

    if (errorObj.stack) {
      errorObj.stack
        .split("\n")
        .slice(1)
        .forEach((l) => {
          const trimmed = l.trim();
          if (trimmed) allLines.push(trimmed);
        });
    }

    if (afterError.length)
      allLines.push(...this._chunkMessage(afterError.join(" ")));
    this._logLines(level, allLines);
  }

  log(...args) {
    this._logWithLevel("log", ...args);
  }

  info(...args) {
    this._logWithLevel("info", ...args);
  }

  warn(...args) {
    this._logWithLevel("warn", ...args);
  }

  error(...args) {
    this._logWithLevel("error", ...args);
  }

  debug(...args) {
    this._logWithLevel("debug", ...args);
  }
}
