import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuModule } from './menu/menu.module';
import { DishModule } from './dish/dish.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
   //this has to be done to ensure that env variables work
   ConfigModule.forRoot({
    envFilePath: ['.env']
  }),
  MongooseModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      uri: configService.get<string>('DB_URI'),
      useCreateIndex: true,
      useFindAndModify: false
    }),
    inject: [ConfigService]
  }),
  AuthModule,
  UserModule,
  MailModule,
  MenuModule,
  DishModule,
  CategoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
