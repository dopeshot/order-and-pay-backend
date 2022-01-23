import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JWTVerifyStrategy } from './guards/mailVerify-jwt.strategy';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('VERIFY_JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('VERIFY_JWT_EXPIRESIN')
                }
            }),
            inject: [ConfigService]
        }),
        ConfigModule,
        MailModule
    ],
    controllers: [UserController],
    providers: [UsersService, JWTVerifyStrategy],
    exports: [UsersService]
})
export class UsersModule {}
