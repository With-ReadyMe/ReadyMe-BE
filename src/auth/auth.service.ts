import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async registerUser(newUser: CreateUserDto): Promise<User> {
    return await this.usersService.createUser(newUser);
  }
}
