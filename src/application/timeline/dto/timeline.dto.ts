import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TimelineType } from 'src/application/DB/entity/timeline.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTimelineDto {
  @IsEnum(TimelineType, {
    message:
      '타입은 project, award, career, education, custom 중 하나여야 합니다.',
  })
  @IsNotEmpty()
  type: TimelineType;

  @IsString()
  @IsNotEmpty({ message: '제목(title)은 필수입니다.' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  org?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsUrl(undefined, { message: '유효한 URL 형식이 아닙니다.' })
  @IsOptional()
  link_url?: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: '시작일(start_at)은 필수입니다.' })
  start_at: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ValidateIf((o: { end_at?: Date | null }) => o.end_at !== null)
  end_at?: Date | null;
}

export class UpdateTimelineDto extends PartialType(CreateTimelineDto) {}
