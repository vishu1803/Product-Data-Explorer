import { Injectable, LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logDir = path.join(process.cwd(), 'logs');

  constructor() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(message: string, context?: string) {
    this.writeLog('INFO', message, context);
    console.log(
      `[${new Date().toISOString()}] [INFO] ${context ? `[${context}] ` : ''}${message}`,
    );
  }

  error(message: string, trace?: string, context?: string) {
    this.writeLog('ERROR', message, context, trace);
    console.error(
      `[${new Date().toISOString()}] [ERROR] ${context ? `[${context}] ` : ''}${message}`,
      trace,
    );
  }

  warn(message: string, context?: string) {
    this.writeLog('WARN', message, context);
    console.warn(
      `[${new Date().toISOString()}] [WARN] ${context ? `[${context}] ` : ''}${message}`,
    );
  }

  debug(message: string, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(
        `[${new Date().toISOString()}] [DEBUG] ${context ? `[${context}] ` : ''}${message}`,
      );
    }
  }

  private writeLog(
    level: string,
    message: string,
    context?: string,
    trace?: string,
  ) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context,
      message,
      trace,
    };

    const logFile = path.join(
      this.logDir,
      `app-${new Date().toISOString().split('T')[0]}.log`,
    );
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }
}
