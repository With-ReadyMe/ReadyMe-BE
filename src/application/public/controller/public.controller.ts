import { Controller, Get } from '@nestjs/common';
import { PublicService } from '../service/public.service';
import { JsonResponse } from 'src/core/utils/json-response';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('/projects')
  async getPublicProjects(): Promise<object> {
    const projects = await this.publicService.getPublicProjects();

    const response = new JsonResponse();
    response.set('data', projects);
    return response.of();
  }
}
