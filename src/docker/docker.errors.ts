import { HttpException, HttpStatus } from '@nestjs/common'

export class UserContainerExistsException extends HttpException {
  constructor(containerId: string) {
    super(
      `El usuario ya tiene un contenedor activo (${containerId}).`,
      HttpStatus.CONFLICT,
    )
  }
}

export class ContainerLimitExceededException extends HttpException {
  constructor(limit: number) {
    super(
      `Se alcanzó el límite de ${limit} contenedores activos.`,
      HttpStatus.TOO_MANY_REQUESTS,
    )
  }
}
