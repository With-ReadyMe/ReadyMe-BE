import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { DbModule } from 'src/application/DB/db.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DbModule,
    JwtModule.register({
      secret: 'SecretKey',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
