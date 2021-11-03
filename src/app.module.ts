import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TableModule } from './table/table.module';

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
      useFindAndModify: false,
      autoIndex: true
    }),
    inject: [ConfigService]
  }),
  AuthModule,
  UserModule,
  MailModule,
  TableModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
