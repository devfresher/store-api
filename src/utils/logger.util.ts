import winston, { Logger } from 'winston';
import morgan from 'morgan';
import debug, { Debugger } from 'debug';

const { combine, timestamp, json, colorize, simple } = winston.format;

type LogLevel = 'info' | 'error' | 'warn';

class LoggerUtil {
  private winstonLogger: Logger;
  private morganLogger: (
    req: import('http').IncomingMessage,
    res: import('http').ServerResponse<import('http').IncomingMessage>,
    callback: (err?: Error) => void
  ) => void;
  private debugLogger: Debugger;

  constructor() {
    this.winstonLogger = winston.createLogger({
      level: 'info',
      format: combine(timestamp(), json()),
      transports: [
        new winston.transports.Console({
          format: combine(timestamp(), colorize(), json(), simple()),
        }),
        new winston.transports.File({
          level: 'error',
          filename: 'logs/error.log',
          maxsize: 5 * 1024 * 1024,
          maxFiles: 5,
          tailable: true,
          zippedArchive: true,
          format: combine(timestamp(), json()),
        }),
      ],
    });

    this.morganLogger = morgan('combined', {
      stream: {
        write: (message) => this.winstonLogger.info(message.trim()),
      },
    });

    this.debugLogger = debug('app');
  }

  logHttpRequests() {
    return this.morganLogger;
  }

  log(level: LogLevel, message: unknown) {
    this.winstonLogger.log(level, message);
  }

  debug(message: unknown) {
    this.debugLogger(message);
  }
}

export default new LoggerUtil();
