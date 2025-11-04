import {
  Controller,
  Get,
  Put,
  Body,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { CustomValidationPipe } from 'src/core/pipes/validation';
import { AuthGuard } from 'src/core/guard/auth.guard';
import { User, UserInfo } from 'src/core/guard/decorator/user.decorator';
import { JsonResponse } from 'src/core/utils/json-response';
import { AuthInfoService } from '../service/auth-info.service';
import { UpdateUserInfoDto } from 'src/application/auth/dto/auth-info.dto';

@Controller('auth-info')
export class AuthInfoController {
  constructor(private authInfoService: AuthInfoService) {}

  @Get('/')
  @UseGuards(AuthGuard)
  async getUserInfo(@User() user: UserInfo) {
    const result = await this.authInfoService.getUserInfo(user.id);

    const response = new JsonResponse();
    response.set('data', result);

    return response.of();
  }

  @Put('/')
  @UsePipes(CustomValidationPipe)
  @UseGuards(AuthGuard)
  async updateUserInfo(
    @Body() UpdateUserInfoDto: UpdateUserInfoDto,
    @User() user: UserInfo,
  ) {
    await this.authInfoService.updateUserInfo(user.id, UpdateUserInfoDto);

    const response = new JsonResponse();
    response.of();
  }
}
