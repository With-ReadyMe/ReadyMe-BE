import { Injectable } from '@nestjs/common';
// import { Types } from 'mongoose';
import { WinstonLoggerService } from 'src/core/interceptors/logging/winston-logger.service';

import { GlobalException } from 'src/core/exception/global.exception';
import { ErrorCode } from 'src/core/exception/error-code';

import { UserQuery } from 'src/application/DB/query/user.query';
import { UpdateUserInfoDto } from 'src/application/auth/dto/auth-info.dto';

@Injectable()
export class AuthInfoService {
  constructor(
    private readonly logger: WinstonLoggerService,
    private readonly userQuery: UserQuery,
  ) {}

  async getUserInfo(userId: string) {
    try {
      const user = this.userQuery.findById(userId);

      if (user == null) {
        this.logger.error(`User not found: ${userId}`);
        throw new GlobalException(
          'User not found',
          404,
          ErrorCode.USER_NOT_FOUND,
        );
      }

      this.logger.log('AuthInfoService.getUserInfo success.');
      return user;
    } catch (error) {
      this.logger.error('AuthInfoService.geetUserInfo failed.');
      this.logger.error(error);
      throw error;
    }
  }

  async updateUserInfo(userId: string, updateUserInfo: UpdateUserInfoDto) {
    try {
      const user = this.userQuery.findById(userId);

      if (user == null) {
        this.logger.error(`User not found: ${userId}`);
        throw new GlobalException(
          'User not found',
          404,
          ErrorCode.USER_NOT_FOUND,
        );
      }

      console.log(user, updateUserInfo);

      await this.userQuery.updateUserInfo(userId, updateUserInfo);

      this.logger.log('AuthInfoService.updateUserInfo success.');
    } catch (error) {
      this.logger.error('AuthInfoService.updateUserInfo failed.');
      this.logger.error(error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      const user = this.userQuery.findById(userId);

      if (user == null) {
        this.logger.error(`User not found: ${userId}`);
        throw new GlobalException(
          'User not found',
          404,
          ErrorCode.USER_NOT_FOUND,
        );
      }

      await this.userQuery.deleteUser(userId);

      this.logger.log('AuthInfoService.deleteUser success.');
    } catch (error) {
      this.logger.error('AuthInfoService.deleteUser failed.');
      this.logger.error(error);
      throw error;
    }
  }
}
