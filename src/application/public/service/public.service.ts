import { Injectable, HttpStatus } from '@nestjs/common';
import { ProjectDocument } from 'src/application/DB/entity/project.entity';
import { ProjectQuery } from 'src/application/DB/query/project.query';

import { WinstonLoggerService } from 'src/core/interceptors/logging/winston-logger.service';
import { GlobalException } from 'src/core/exception/global.exception';
import { ErrorCode } from 'src/core/exception/error-code';

@Injectable()
export class PublicService {
  constructor(
    private readonly projectQuery: ProjectQuery,
    private readonly logger: WinstonLoggerService,
  ) {}

  async getPublicProjects(): Promise<ProjectDocument[]> {
    try {
      this.logger.log('Attempting to retrieve public projects.');

      const projects = await this.projectQuery.findPublicProjects();

      this.logger.log('PublicService.getPublicProjects success.');
      return projects;
    } catch (error) {
      if (error instanceof GlobalException) {
        throw error;
      }

      this.logger.error(
        'PublicService.getPublicProjects failed due to DB or internal error.',
      );
      this.logger.error(error);

      throw new GlobalException(
        '공개 프로젝트 목록을 조회하는 중 알 수 없는 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.ERROR,
      );
    }
  }
}
