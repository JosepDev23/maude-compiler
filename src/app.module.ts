import { Module } from '@nestjs/common'
import { SwaggerModule } from '@nestjs/swagger'
import { MaudeContainerModule } from './docker/maude-container.module'

@Module({
  imports: [SwaggerModule, MaudeContainerModule],
})
export class AppModule {}
