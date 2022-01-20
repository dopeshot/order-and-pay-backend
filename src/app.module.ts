import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TableModule } from './table/table.module';
import { MenuModule } from './menu/menu.module';
import { DishModule } from './dish/dish.module';
import { CategoryModule } from './category/category.module';
import { AdminModule } from './admin/admin.module';
import { ClientModule } from './client/client.module';

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
                user: configService.get<string>('DB_USER'),
                pass: configService.get<string>('DB_PASS')
            }),
            inject: [ConfigService]
        }),
        AuthModule,
        UserModule,
        MailModule,
        TableModule,
        MenuModule,
        DishModule,
        CategoryModule,
        AdminModule,
        ClientModule
    ]
})
export class AppModule {}
