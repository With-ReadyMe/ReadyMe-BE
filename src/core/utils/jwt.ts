import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { WinstonLoggerService } from '../interceptors/logging/winston-logger.service';
import { GlobalException } from '../exception/global.exception';
import { ErrorCode } from '../exception/error-code';
import { UserQuery } from '../../application/DB/query/user.query';
import { UserDocument } from 'src/application/DB/entity/user.entity';
import jwtConfig from '../../config/jwt.config';

interface JwtPayload {
  id: string;
  name: string;
  email: string;
}

interface MiddlewareResponse {
  status: 'access' | 'refresh';
  payload?: JwtPayload;
  newAccess?: string;
  newPayload?: UserDocument;
}

export interface VerifyResponse {
  status: boolean;
  payload: JwtPayload | UserDocument | null;
  newAccess?: string;
}

@Injectable()
export class JwtUtil {
  constructor(
    private readonly logger: WinstonLoggerService,
    private readonly jwtService: JwtService,
    private readonly userQuery: UserQuery,
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {}

  generateToken(payload: JwtPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    this.logger.debug('JwtUtil.generateToken success.');
    return { accessToken: `Bearer ${accessToken}`, refreshToken };
  }

  private generateAccessToken(payload: JwtPayload): string {
    try {
      return this.jwtService.sign(payload, {
        secret: this.config.jwtSecretKey,
        expiresIn: this.config.jwtExpiresIn,
      });
    } catch (error) {
      this.logger.error('JwtUtil.generateAccessToken Failed.');
      this.logger.error(error);
      throw new GlobalException(
        'Failed to generate access token',
        500,
        ErrorCode.ERROR,
      );
    }
  }

  private generateRefreshToken(payload: JwtPayload): string {
    try {
      return this.jwtService.sign(payload, {
        secret: this.config.jwtRefreshSecretKey,
        expiresIn: this.config.jwtRefreshExpiresIn,
      });
    } catch (error) {
      this.logger.error('JwtUtil.generateRefreshToken Failed.');
      this.logger.error(error);
      throw new GlobalException(
        'Failed to generate refresh token',
        500,
        ErrorCode.ERROR,
      );
    }
  }

  private async authMiddleware(
    accessToken: string,
    refreshToken: string,
  ): Promise<MiddlewareResponse> {
    try {
      const accessPayload = await this.jwtService.verify(accessToken, {
        secret: this.config.jwtSecretKey,
      });

      return { status: 'access', payload: accessPayload };
    } catch (accessError) {
      this.logger.warn(
        'Access Token invalid or expired. Trying refresh token.',
        (accessError as Error)?.message ?? String(accessError),
      );

      try {
        const refreshPayload: JwtPayload = await this.jwtService.verify(
          refreshToken,
          {
            secret: this.config.jwtRefreshSecretKey,
          },
        );

        const id: string = refreshPayload.id;
        const userData = await this.userQuery.findById(id);

        if (!userData) {
          throw new GlobalException(
            '유효하지 않은 토큰입니다.',
            401,
            ErrorCode.INVALID_TOKEN,
          );
        }

        if (refreshToken !== userData.refreshToken) {
          this.logger.error('Refresh token mismatch.');
          throw new GlobalException(
            '유효하지 않은 토큰입니다.',
            401,
            ErrorCode.INVALID_TOKEN,
          );
        }

        const newAccessToken = this.generateAccessToken(refreshPayload);

        return {
          status: 'refresh',
          newAccess: newAccessToken,
          newPayload: userData,
        };
      } catch (refreshError) {
        this.logger.error('Refresh Token verification failed.');
        this.logger.error(refreshError);
        throw new GlobalException(
          '토큰 검증에 실패했습니다.',
          401,
          ErrorCode.UNAUTHORIZED,
        );
      }
    }
  }

  async verifyToken(
    accessToken: string,
    refreshToken: string,
  ): Promise<VerifyResponse> {
    const result: MiddlewareResponse = await this.authMiddleware(
      accessToken,
      refreshToken,
    );

    try {
      if (result.status === 'access') {
        const userData = await this.userQuery.findById(
          result.payload?.id ?? '',
        );

        if (!userData || refreshToken !== userData.refreshToken) {
          this.logger.error('Refresh token mismatch.');
          return { status: false, payload: null };
        }

        this.logger.debug('JwtUtil.verifyToken valid token.');
        return { status: true, payload: result.payload as JwtPayload };
      }

      if (result.status === 'refresh') {
        return {
          status: true,
          payload: result.newPayload as UserDocument,
          newAccess: result.newAccess,
        };
      }

      this.logger.error('JwtUtil.verifyToken invalid token.');
      return { status: false, payload: null };
    } catch (error) {
      this.logger.error('JwtUtil.verifyToken Failed.');
      this.logger.error(error);
      throw new Error('JwtUtil.verifyToken Failed.');
    }
  }

  extractTokens(request: Request): {
    accessToken: string;
    refreshToken: string;
  } {
    try {
      const authorization: string | undefined = request.headers.authorization;
      const cookie: string | undefined = request.headers.cookie;

      if (!authorization || !cookie) {
        throw new GlobalException(
          '헤더 또는 쿠키가 필요합니다.',
          401,
          ErrorCode.USER_NOT_AUTHENTICATION,
        );
      }

      const [aType, aValue] = authorization.split(' ');

      if (aType !== 'Bearer') {
        throw new GlobalException(
          '유효하지 않은 토큰입니다.',
          401,
          ErrorCode.INVALID_TOKEN,
        );
      }

      let refreshTokenValue: string | undefined;

      if (cookie) {
        const refreshCookie = cookie
          .split('; ')
          .find((c: string) => c.startsWith('refreshToken='));
        if (refreshCookie) {
          const [, rValue] = refreshCookie.split('=');
          refreshTokenValue = rValue;
        }
      }

      if (!refreshTokenValue) {
        throw new GlobalException(
          '유효하지 않은 토큰입니다.',
          401,
          ErrorCode.INVALID_TOKEN,
        );
      }

      this.logger.debug('Tokens extracted successfully from request.');
      return { accessToken: aValue, refreshToken: refreshTokenValue };
    } catch (error) {
      this.logger.error('JwtUtil.extractTokens Failed.');
      this.logger.error(error);
      throw error;
    }
  }
}
