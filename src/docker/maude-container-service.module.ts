import { Module } from '@nestjs/common'
import { MaudeContainerService } from './maude-container-service.service'
import { MaudeContainerController } from './maude-container-service.controller'

@Module({
  providers: [MaudeContainerService],
  controllers: [MaudeContainerController],
})
export class MaudeContainerModule {}
