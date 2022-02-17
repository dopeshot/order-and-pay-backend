import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';
import { LocalStrategy } from './strategies/local/local.strategy';

@Module({
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    imports: [
        ConfigModule,
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRESIN')
                }
            }),
            inject: [ConfigService]
        })
    ],
    exports: [JwtStrategy, JwtModule]
})
export class AuthModule {}
