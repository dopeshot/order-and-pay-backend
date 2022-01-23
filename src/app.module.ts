import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ClientModule } from './client/client.module';
import { DishesModule } from './dishes/dishes.module';
import { LabelsModule } from './labels/labels.module';
import { MailModule } from './mail/mail.module';
import { MenusModule } from './menus/menus.module';
import { TablesModule } from './tables/tables.module';
import { UsersModule } from './users/users.module';

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
        AdminModule,
        ClientModule,
        AuthModule,
        MailModule,
        UsersModule,
        MenusModule,
        CategoriesModule,
        DishesModule,
        TablesModule,
        LabelsModule
    ]
})
export class AppModule {}
