import { Module } from '@nestjs/common'
import { SwaggerModule } from '@nestjs/swagger'
import { MaudeContainerModule } from './docker/maude-container.module'
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [SwaggerModule, MaudeContainerModule, AuthModule, UsersModule],
})
export class AppModule {}
