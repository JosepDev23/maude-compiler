import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SwaggerModule } from '@nestjs/swagger'
import { DockerModule } from './docker/docker.module';

@Module({
  imports: [SwaggerModule, DockerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
