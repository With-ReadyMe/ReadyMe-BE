import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { CustomValidationPipe } from 'src/core/pipes/validation';
import { AuthService } from '../service/auth.service';
import { CreateUserDto, LoginDto } from 'src/application/auth/dto/auth.dto';
import { JsonResponse } from 'src/core/utils/json-response';

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
}
