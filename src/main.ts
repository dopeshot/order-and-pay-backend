import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('ejs');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    const config = new DocumentBuilder()
        .setTitle('Order and Pay')
        .setDescription('Solution for restaurants')
        .setVersion('0.1')
        .addTag('auth', 'Authentication related content')
        .addTag('user', 'User related content')
        .addTag('mail', 'Mail related content')
        .addTag('tables', 'Table related endpoints')
        .addTag('admin', 'all admin endpoints')
        .addTag('menus', 'all menu endpoints')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);
    app.enableCors();
    await app.listen(+process.env.PORT || 3000, () =>
        Logger.log(`Nest listening on ${process.env.HOST}`, 'Bootstrap')
    );
}
bootstrap();
