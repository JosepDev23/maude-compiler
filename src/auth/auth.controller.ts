import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { LocalGuard } from './guards/local.guard'
import { Request } from 'express'
import { JwtGuard } from './guards/jwt.guard'
import { ApiBody, ApiOperation } from '@nestjs/swagger'
import { AuthPayloadDto } from './dto/auth-payload.dto'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalGuard)
  @ApiOperation({ summary: 'User Login' })
  @ApiBody({ description: 'User', type: AuthPayloadDto })
  login(@Req() req: Request) {
    return req.user
  }

  @Get('status')
  @UseGuards(JwtGuard)
  status(@Req() req: Request) {
    return req.user
  }
}
