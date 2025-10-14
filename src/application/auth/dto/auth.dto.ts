import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  @IsEmail(
    { allow_display_name: false },
    { message: '이메일 형식이 올바르지 않습니다.' },
  )
  email: string;

  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(20, { message: '비밀번호는 최대 20자 이하이어야 합니다.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
    {
      message: '비밀번호는 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.',
    },
  )
  password: string;

  @IsNotEmpty({ message: '이름은 필수 입력 항목입니다.' })
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  name: string;

  @IsNotEmpty({ message: '전화번호는 필수 입력 항목입니다.' })
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @Length(10, 11, { message: '사용자 전화번호는 10-11자리여야 합니다.' })
  @Matches(/^01[0-9]{8,9}$/, { message: '유효한 휴대폰 번호 형식이 아닙니다.' })
  phone: string;

  @IsEnum(['male', 'female', 'other'])
  sex: string;

  @IsNotEmpty({ message: '사용자 생년월일은 필수입니다.' })
  @IsDateString(
    {},
    { message: '사용자 생년월일은 yyyy-MM-dd 형식의 날짜여야 합니다.' },
  )
  birth: Date;

  @IsNotEmpty({ message: '주소는 필수 입력 항목입니다.' })
  @IsString({ message: '주소는 문자열이어야 합니다.' })
  address: string;
}

export class LoginDto {
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  @IsEmail(
    { allow_display_name: false },
    { message: '이메일 형식이 올바르지 않습니다.' },
  )
  email: string;

  @IsNotEmpty({ message: '비밀번호를 입력해야 합니다.' })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  password: string;
}
