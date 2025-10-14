import {
  Controller,
  Post,
  Body,
  UsePipes,
  Get,
  UseGuards,
} from '@nestjs/common';
import { CustomValidationPipe } from 'src/core/pipes/validation';
import { AuthGuard } from 'src/core/guard/auth.guard';
import { User, UserInfo } from 'src/core/guard/decorator/user.decorator';
import { JsonResponse } from 'src/core/utils/json-response';
import { AuthService } from '../service/auth.service';
import { CreateUserDto, LoginDto } from 'src/application/auth/dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @UsePipes(CustomValidationPipe)
  async register(@Body() createUserDto: CreateUserDto) {
    const result = await this.authService.registerUser(createUserDto);

    const response = new JsonResponse();
    response.set('data', result);

    return response.of();
  }

  @Post('/login')
  @UsePipes(CustomValidationPipe)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);

    const response = new JsonResponse();
    response.set('data', result);

    return response.of();
  }

  @Get('/logout')
  @UseGuards(AuthGuard)
  async logout(@User() user: UserInfo) {
    await this.authService.logout(user.id, user.email);

    const response = new JsonResponse();
    return response.of();
  }
}
