import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { UserQuery } from 'src/application/DB/query/user.query';
import { User, UserDocument } from 'src/application/DB/entity/user.entity';
import { WinstonLoggerService } from 'src/core/interceptors/logging/winston-logger.service';

import { JwtUtil } from 'src/core/utils/jwt';
import { CreateUserDto, LoginDto } from 'src/application/auth/dto/auth.dto';
import { GlobalException } from 'src/core/exception/global.exception';
import { ErrorCode } from 'src/core/exception/error-code';
import * as bcrypt from 'bcrypt';

interface UserPayload {
  email: string;
  name: string;
  _id: Types.ObjectId;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: WinstonLoggerService,
    private readonly jwtUtil: JwtUtil,
    private readonly userQuery: UserQuery,
  ) {}

  async registerUser(
    newUser: CreateUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const existingUser = await this.userQuery.findByEmail(newUser.email);
      if (existingUser) {
        this.logger.error(`User already exists: ${newUser.email}`);
        throw new GlobalException(
          'User already exists',
          409,
          ErrorCode.DUPLICATION,
        );
      }

      const createdUser = await this.userQuery.createUser(newUser);

      // JWT 토큰 생성
      const token = this.jwtUtil.generateToken({
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
      });
      await this.userQuery.updateRefreshToken(
        createdUser.id as string,
        token.refreshToken,
      );

      this.logger.log(`AuthService.registerUser success: ${newUser.email}`);
      return token;
    } catch (error) {
      this.logger.error(`AuthService.registerUser failed`);
      this.logger.error(error);
      throw error;
    }
  }

  private async validateUser(loginDto: LoginDto): Promise<UserPayload> {
    try {
      const { email, password } = loginDto;
      const user: UserDocument | null = await this.userQuery.findByEmail(email);

      if (!user) {
        this.logger.error(`User not found: ${email}`);
        throw new GlobalException(
          'User not found',
          404,
          ErrorCode.USER_NOT_FOUND,
        );
      }

      if (!(await bcrypt.compare(password, user.password))) {
        throw new GlobalException(
          'Invalid email or password',
          401,
          ErrorCode.USER_NOT_AUTHENTICATION,
        );
      }

      const userObject = user.toObject<User>();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = userObject;

      this.logger.debug(`AuthService.validateUser success.`);
      return result as UserPayload;
    } catch (error) {
      this.logger.error(`AuthService.validateUser failed`);
      this.logger.error(error);
      throw error;
    }
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const user = await this.validateUser(loginDto);

      // JWT 토큰 생성
      const token = this.jwtUtil.generateToken({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      });

      await this.userQuery.updateRefreshToken(
        user._id.toString(),
        token.refreshToken,
      );

      this.logger.log(`AuthService.login success: ${loginDto.email}`);
      return token;
    } catch (error) {
      this.logger.error(`AuthService.login failed`);
      this.logger.error(error);
      throw error;
    }
  }
}
