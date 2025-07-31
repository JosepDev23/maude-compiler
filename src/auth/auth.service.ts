import { Injectable } from '@nestjs/common'
import { AuthPayloadDto } from './dto/auth-payload.dto'
import { JwtService } from '@nestjs/jwt'

const fakeUsers = [
  {
    id: 1,
    username: 'testuser',
    password: 'password123',
  },
  {
    id: 2,
    username: 'testuser2',
    password: 'password123',
  },
]

@Injectable()
export class AuthService {
  constructor(private readonly jwtservice: JwtService) {}

  validateUser({ username, password }: AuthPayloadDto) {
    const findUser = fakeUsers.find((user) => user.username === username)
    if (!findUser) return null

    if (findUser.password === password) {
      const { password, ...user } = findUser
      return this.jwtservice.sign(user)
    }
  }
}
