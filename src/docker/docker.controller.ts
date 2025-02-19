import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { DockerService } from './docker.service'
import User from 'src/models/user.model'
import MaudeCode from 'src/models/maude-code.model'

@ApiTags('Docker Controller')
@Controller('docker')
export class DockerController {
  constructor(private readonly dockerService: DockerService) {}

  @Post('container')
  @ApiOperation({ summary: 'Create User Container' })
  @ApiBody({ description: 'User' })
  @ApiResponse({
    status: 201,
    description: 'User Container Created',
    type: String,
  })
  createUserContainer(@Body() user: User): Promise<string> {
    return this.dockerService.createUserContainer(user.id)
  }

  @Post('exec-maude-code')
  @ApiOperation({ summary: 'Exec Maude Code' })
  @ApiBody({ description: 'Maude code' })
  @ApiResponse({ status: 201, description: 'Code Executed', type: String })
  execMaudeCode(@Body() maudeCode: MaudeCode): Promise<string> {
    return this.dockerService.executeCode(maudeCode.userId, maudeCode.code)
  }

  @Delete('container/:userId')
  @ApiOperation({ summary: 'Remove User Container' })
  @ApiParam({ name: 'userId', required: true })
  @ApiResponse({ status: 200, description: 'User Container Removed' })
  removeUserContainer(@Param('userId') userId: string): Promise<void> {
    return this.dockerService.removeUserContainer(userId)
  }
}
