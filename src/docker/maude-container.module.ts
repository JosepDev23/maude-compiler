import { Module } from '@nestjs/common'
import { MaudeContainerService } from './maude-container.service'
import { MaudeContainerController } from './maude-container.controller'

@Module({
  providers: [MaudeContainerService],
  controllers: [MaudeContainerController],
})
export class MaudeContainerModule {}
