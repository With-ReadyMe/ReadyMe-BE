import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsObject,
  IsString,
  MinLength,
} from 'class-validator';
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsEnum(['male', 'female', 'other'])
  sex: string;

  @IsDateString()
  birth: Date;

  @IsObject()
  address: any;
}
