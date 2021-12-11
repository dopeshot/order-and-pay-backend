import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TableModule } from './table/table.module';
import { MenuModule } from './menu/menu.module';
import { DishModule } from './dish/dish.module';

@Module({
  imports: [
    // This has to be done to ensure that env variables work
    ConfigModule.forRoot({
      envFilePath: ['.env']
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI'),
        autoIndex: true
      }),
      inject: [ConfigService]
    }),
    AuthModule,
    UserModule,
    MailModule,
    TableModule,
    MenuModule,
    DishModule
  ],
})
export class AppModule { }
