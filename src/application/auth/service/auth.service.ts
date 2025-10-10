import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/application/auth/dto/create-user.dto';
import { UserQuery } from 'src/application/DB/query/user.query';
import { User, UserDocument } from 'src/application/DB/entity/user.entity';
import { LoginDto } from 'src/application/auth/dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';

interface UserPayload {
  email: string;
  name: string;
  _id: Types.ObjectId;
}

@Injectable()
export class AuthService {
  constructor(
    private userQuery: UserQuery,
    private jwtService: JwtService,
  ) {}

  async registerUser(newUser: CreateUserDto): Promise<UserDocument> {
    return await this.userQuery.createUser(newUser);
  }
  async validateUser(loginDto: LoginDto): Promise<UserPayload | null> {
    const { email, password } = loginDto;
    const user: UserDocument | null = await this.userQuery.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const userObject = user.toObject<User>();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = userObject;

      return result as UserPayload;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호를 확인해주세요.');
    }

    const payload = { email: user.email, sub: user._id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
