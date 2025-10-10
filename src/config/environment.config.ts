export interface LoggingConfig {
  level: string; // 로깅 레벨
  toFile: boolean; // 파일 로깅 여부
  toConsole: boolean; // 콘솔 로깅 여부
  colors: boolean; // 컬러 로깅 여부
  includeBody: boolean; // 요청/응답 본문 포함 여부
  includeHeaders: boolean; // 요청/응답 헤더 포함 여부
  includeCookies: boolean; // 요청/응답 쿠키 포함 여부
  includeHost: boolean; // 요청/응답 호스트 포함 여부
  maxFileSize: string; // 파일 최대 크기
  maxFiles: string; // 파일 최대 개수
  // 에러 로깅 설정
  logClientErrors: boolean; // 4xx 에러 로깅 여부
  logServerErrors: boolean; // 5xx 에러 로깅 여부
  includeErrorStack: boolean; // 스택 트레이스 포함 여부
}

export interface EnvironmentConfig {
  nodeEnv: string;
  logging: LoggingConfig;
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const nodeEnv = process.env.NODE_ENV || 'local';

  const configs: Record<string, LoggingConfig> = {
    local: {
      level: 'debug',
      toFile: false,
      toConsole: true,
      colors: true,
      includeBody: true,
      includeHeaders: true,
      includeCookies: true,
      includeHost: true,
      maxFileSize: '20m',
      maxFiles: '14d',
      logClientErrors: true,
      logServerErrors: true,
      includeErrorStack: true,
    },
    development: {
      level: 'info',
      toFile: true,
      toConsole: true,
      colors: true,
      includeBody: true,
      includeHeaders: false,
      includeCookies: false,
      includeHost: true,
      maxFileSize: '20m',
      maxFiles: '14d',
      logClientErrors: true,
      logServerErrors: true,
      includeErrorStack: true,
    },
    production: {
      level: 'warn',
      toFile: true,
      toConsole: false,
      colors: false,
      includeBody: false,
      includeHeaders: false,
      includeCookies: false,
      includeHost: false,
      maxFileSize: '50m',
      maxFiles: '30d',
      logClientErrors: false,
      logServerErrors: true,
      includeErrorStack: false,
    },
  };

  return {
    nodeEnv,
    logging: configs[nodeEnv] || configs.local,
  };
};
