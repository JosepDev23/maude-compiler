import { Module } from '@nestjs/common'
import { SwaggerModule } from '@nestjs/swagger'
import { MaudeContainerModule } from './docker/maude-container.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [SwaggerModule, MaudeContainerModule, AuthModule],
})
export class AppModule {}
