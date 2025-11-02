import { Controller, Get, HttpStatus } from '@nestjs/common';
import { PublicService } from '../service/public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('/projects')
  async getPublicProjects(): Promise<object> {
    const projects = await this.publicService.getPublicProjects();

    return {
      statusCode: HttpStatus.OK,
      message: '전체 공개 프로젝트 목록 조회 성공',
      data: projects,
    };
  }
}
