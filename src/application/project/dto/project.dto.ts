import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(1)
  dev_count: number;

  @IsString()
  @IsNotEmpty()
  my_role: string;

  @IsUrl()
  @IsNotEmpty()
  archon_link: string; // 필수?

  @IsUrl({}, { each: true }) // 배열의 각 요소가 URL인지 검사
  @IsOptional()
  other_links?: string[]; // Link1, 2, 3을 하나의 배열로 받음

  @IsDateString()
  @IsNotEmpty()
  period_start: string;

  @IsDateString()
  @IsNotEmpty()
  period_end: string;
}
