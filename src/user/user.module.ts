import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './entities/user.entity';
import { MailService } from '../mail/mail.service';
import { VerifySchema } from './entities/verify.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JWTVerifyStrategy } from './guards/mailVerify-jwt.strategy';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  MongooseModule.forFeature([{ name: 'Reset', schema: VerifySchema }]), 
  JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('VERIFY_JWT_SECRET'),
        signOptions: {
            expiresIn: configService.get<string>('VERIFY_JWT_EXPIRESIN'),
        },
    }),
    inject: [ConfigService],
  }),
  ConfigModule],
  controllers: [UserController],
  providers: [UserService, MailService, JWTVerifyStrategy],
  exports: [UserService] 
})
export class UserModule {}
