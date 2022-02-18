import {
    Logger,
    LogLevel,
    RequestMethod,
    ValidationPipe
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
    // Typecast as this is the only way to read loglevel from env
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: process.env.LOGLEVEL.split(',') as LogLevel[]
    });

    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('ejs');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.setGlobalPrefix('admin', {
        exclude: [
            'client',
            { path: 'client/order', method: RequestMethod.POST }
        ]
    });

    const config = new DocumentBuilder()
        .setTitle('Order and Pay')
        .setDescription('Solution for restaurants')
        .setVersion('0.1')
        .addTag('sse', 'all sse endpoints')
        .addTag('auth', 'all auth endpoints')
        .addTag('users', 'all user endpoints')
        .addTag('menus', 'all menu endpoints')
        .addTag('dishes', 'all dish endpoints')
        .addTag('tables', 'all table endpoints')
        .addTag('orders', 'all order endpoints')
        .addTag('labels', 'all label endpoints')
        .addTag('qr-codes', 'all qr code endpoints')
        .addTag('allergens', 'all allergen endpoints')
        .addTag('categories', 'all category endpoints')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);
    app.enableCors();
    await app.listen(+process.env.PORT || 3001, () =>
        Logger.log(`Nest listening on ${process.env.HOST}`, 'Bootstrap')
    );
}
bootstrap();
