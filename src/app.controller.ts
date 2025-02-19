import { Body, Controller, Get, Post } from '@nestjs/common'
import { AppService } from './app.service'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import Command from './command.model'

@ApiTags('Maude Controller')
@Controller('maude')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Init Maude' })
  @ApiResponse({ status: 200, description: 'Maude init', type: String })
  initMaude(): Promise<string> {
    return this.appService.initMaude()
  }

  @Post()
  @ApiOperation({ summary: 'Exec Maude Command' })
  @ApiResponse({ status: 201, description: 'Maude Exec Command', type: String })
  @ApiBody({ description: 'Command' })
  execMaudeCommmand(@Body() command: Command): Promise<string> {
    return this.appService.execCommand(command.body)
  }
}
