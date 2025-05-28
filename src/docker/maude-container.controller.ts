import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { MaudeContainerService } from './maude-container.service'
import User from 'src/models/user.model'
import MaudeCode from 'src/models/maude-code.model'

@ApiTags('MaudeContainer Controller')
@Controller('maude-container')
export class MaudeContainerController {
  constructor(private readonly maudeContainerService: MaudeContainerService) {}

  @Post()
  @ApiOperation({ summary: 'Create User Container' })
  @ApiBody({ description: 'User' })
  @ApiResponse({
    status: 201,
    description: 'User Container Created',
    type: String,
  })
  createUserContainer(@Body() user: User): Promise<string> {
    return this.maudeContainerService.createUserContainer(user.id)
  }

  @Post('exec-code')
  @ApiOperation({ summary: 'Exec Maude Code' })
  @ApiBody({ description: 'Maude code' })
  @ApiResponse({ status: 201, description: 'Code Executed', type: String })
  execMaudeCode(
    @Body() maudeCode: MaudeCode,
  ): Promise<{ stdout: string; stderr: string }> {
    return this.maudeContainerService.executeCode(
      maudeCode.userId,
      maudeCode.code,
    )
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Remove User Container' })
  @ApiParam({ name: 'userId', required: true })
  @ApiResponse({ status: 200, description: 'User Container Removed' })
  removeUserContainer(@Param('userId') userId: string): Promise<void> {
    return this.maudeContainerService.removeUserContainer(userId)
  }
}
