import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('Maude')
    .setDescription('Maude Compiler API')
    .setVersion('0.1')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('', app, document)

  app.enableCors()

  await app.listen(3000)
}
bootstrap()
