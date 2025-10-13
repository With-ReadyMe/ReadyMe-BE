import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as chalk from 'chalk';
import { getEnvironmentConfig } from '../../../config/environment.config';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private readonly logger: winston.Logger;
  private readonly config = getEnvironmentConfig();

  constructor() {
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const { logging } = this.config;

    const transports: winston.transport[] = [];

    // 콘솔 출력 설정
    if (logging.toConsole) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.printf(this.createConsoleFormatter()),
          ),
        }),
      );
    }

    // 파일 출력 설정
    if (logging.toFile) {
      // 에러 로그 파일
      transports.push(
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: logging.maxFileSize,
          maxFiles: logging.maxFiles,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
          ),
        }),
      );

      // 전체 로그 파일
      transports.push(
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: logging.maxFileSize,
          maxFiles: logging.maxFiles,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
          ),
        }),
      );
    }

    return winston.createLogger({
      level: logging.level,
      transports,
      exitOnError: false,
    });
  }

  private createConsoleFormatter() {
    return (info: winston.Logform.TransformableInfo) => {
      const { timestamp, level, message, context, trace, ...meta } = info;

      const coloredLevel = this.colorizeLevel(level);
      const coloredTimestamp = chalk.gray(timestamp);
      const coloredContext = context
        ? chalk.yellow(`[${context as string}]`)
        : '';

      let formattedMessage = `${coloredTimestamp} ${coloredLevel} ${coloredContext} ${message as string}`;

      // 메타데이터가 있으면 추가
      if (Object.keys(meta).length > 0) {
        formattedMessage += `\n${chalk.gray(JSON.stringify(meta, null, 2))}`;
      }

      // 스택 트레이스가 있으면 추가
      if (trace) {
        formattedMessage += `\n${chalk.red(trace)}`;
      }

      return formattedMessage;
    };
  }

  private colorizeLevel(level: string): string {
    if (!this.config.logging.colors) {
      return level.toUpperCase().padEnd(7);
    }

    const colors = {
      error: chalk.red.bold,
      warn: chalk.yellow.bold,
      info: chalk.blue.bold,
      http: chalk.magenta.bold,
      verbose: chalk.cyan.bold,
      debug: chalk.green.bold,
      silly: chalk.gray.bold,
    };

    const colorFn = colors[level] || chalk.white.bold;
    return colorFn(level.toUpperCase().padEnd(7));
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { context, trace });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  // HTTP 요청/응답 전용 로깅 메서드
  requestLog(method: string, url: string, data: any, context = 'HTTP') {
    const { logging } = this.config;

    const logData: any = {
      type: 'REQUEST',
      method,
      url,
    };

    if (logging.includeHost && data.host) {
      logData.host = data.host;
    }

    if (logging.includeHeaders && data.headers) {
      logData.headers = this.visibleHeaders(data.headers);
    }

    if (logging.includeCookies && data.cookies) {
      logData.cookies = data.cookies;
    }

    if (logging.includeBody && data.body) {
      logData.body = data.body;
    }

    this.logger.info(`${chalk.cyan('→')} ${method} ${url}`, {
      context,
      ...logData,
    });
  }

  responseLog(
    method: string,
    url: string,
    statusCode: number,
    data: any,
    duration: number,
    context = 'HTTP',
  ) {
    const { logging } = this.config;

    const logData: any = {
      type: 'RESPONSE',
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
    };

    if (logging.includeBody && data) {
      logData.responseBody = data;
    }

    const statusColor =
      statusCode >= 400
        ? chalk.red
        : statusCode >= 300
          ? chalk.yellow
          : chalk.green;

    this.logger.info(
      `${chalk.cyan('←')} ${method} ${url} ${statusColor(statusCode)} ${chalk.gray(`${duration}ms`)}`,
      {
        context,
        ...logData,
      },
    );
  }

  private visibleHeaders(headers: any): any {
    const visibleHeadersName = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
    ];
    const visibleHeaders = {};

    Object.keys(headers).forEach((header) => {
      if (visibleHeadersName.includes(header)) {
        visibleHeaders[header] = headers[header];
      }
    });

    return visibleHeaders;
  }
}
