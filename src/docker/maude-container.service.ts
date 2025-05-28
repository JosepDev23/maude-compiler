import { Injectable, OnModuleDestroy } from '@nestjs/common'
import Docker from 'dockerode'
import { PassThrough } from 'stream'
import { v4 as uuidv4 } from 'uuid'
import {
  ContainerLimitExceededException,
  UserContainerExistsException,
  UserContainerNotFoundException,
} from './maude-container.errors'

@Injectable()
export class MaudeContainerService implements OnModuleDestroy {
  private docker = new Docker()
  private userContainers = new Map<string, string>()

  private readonly MAX_CONTAINERS = 10

  async createUserContainer(userId: string): Promise<string> {
    const existing = this.userContainers.get(userId)
    if (existing) {
      throw new UserContainerExistsException(existing)
    }

    if (this.userContainers.size >= this.MAX_CONTAINERS) {
      throw new ContainerLimitExceededException(this.MAX_CONTAINERS)
    }

    const containerName: string = `maude-${uuidv4()}`

    const container: Docker.Container = await this.docker.createContainer({
      Image: 'maude-container',
      name: containerName,
      Tty: true,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
    })

    await container.start()

    this.userContainers.set(userId, container.id)

    return container.id
  }

  async executeCode(
    userId: string,
    code: string,
  ): Promise<{ stdout: string; stderr: string }> {
    const containerId = this.userContainers.get(userId)
    if (!containerId) throw new Error('Please, create a container first')

    const container = this.docker.getContainer(containerId)

    const tarStream = await this.buildTar(code)
    await container.putArchive(tarStream, { path: '/workspace' })

    const exec = await container.exec({
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ['maude', 'tmp.maude'],
      WorkingDir: '/workspace',
    })

    const execRes = await exec.start({})
    const muxStream = (
      'output' in execRes ? execRes.output : execRes
    ) as NodeJS.ReadableStream

    const stdoutStream = new PassThrough()
    const stderrStream = new PassThrough()
    this.docker.modem.demuxStream(muxStream, stdoutStream, stderrStream)

    return new Promise((resolve, reject) => {
      const chunksOut: Buffer[] = []
      const chunksErr: Buffer[] = []
      const timer = setTimeout(
        () => reject(new Error('Execution timeout')),
        30_000,
      )

      stdoutStream.on('data', (c) => chunksOut.push(c))
      stderrStream.on('data', (c) => chunksErr.push(c))

      muxStream.on('end', () => {
        clearTimeout(timer)
        resolve({
          stdout: Buffer.concat(chunksOut).toString(),
          stderr: Buffer.concat(chunksErr).toString(),
        })
      })

      muxStream.on('error', (err) => {
        clearTimeout(timer)
        reject(err)
      })
    })
  }

  async removeUserContainer(userId: string): Promise<void> {
    const containerId: string = this.userContainers.get(userId)

    if (!containerId) {
      throw new UserContainerNotFoundException(userId)
    }

    const container: Docker.Container = this.docker.getContainer(containerId)

    await container.stop()

    await container.remove()

    this.userContainers.delete(userId)
  }

  async onModuleDestroy() {
    for (const userId of this.userContainers.keys()) {
      await this.removeUserContainer(userId)
    }
  }

  private async buildTar(code: string): Promise<NodeJS.ReadableStream> {
    const tar = require('tar-stream').pack()
    tar.entry({ name: 'tmp.maude' }, code)
    tar.finalize()
    return tar
  }
}
