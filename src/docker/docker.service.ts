import { Injectable, OnModuleDestroy } from '@nestjs/common'
import Docker from 'dockerode'
import { PassThrough } from 'stream'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class DockerService implements OnModuleDestroy {
  private docker = new Docker()
  private userContainers = new Map<string, string>()

  async createUserContainer(userId: string): Promise<string> {
    console.log('Creating container for user:', userId)
    const containerName: string = `maude-${uuidv4()}`
    console.log('Container name:', containerName)
    const container: Docker.Container = await this.docker.createContainer({
      Image: 'maude-container',
      name: containerName,
      Tty: true,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
    })
    console.log('Container created:', container.id)
    await container.start()
    console.log('Container started:', container.id)
    this.userContainers.set(userId, container.id)
    console.log('User containers:', this.userContainers)
    return container.id
  }

  async executeCode(
    userId: string,
    code: string,
  ): Promise<{ stdout: string; stderr: string }> {
    const containerId = this.userContainers.get(userId)
    if (!containerId) throw new Error('Please, create a container first')

    const container = this.docker.getContainer(containerId)

    // 1. Empaquetamos el código en un tar y lo copiamos a /workspace/tmp.maude
    const tarStream = await this.buildTar(code)
    await container.putArchive(tarStream, { path: '/workspace' })

    // 2. Ejecutamos Maude sobre ese archivo
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
    // 3. Demultiplexamos salida
    const stdoutStream = new PassThrough()
    const stderrStream = new PassThrough()
    this.docker.modem.demuxStream(muxStream, stdoutStream, stderrStream)

    // 4. Recogemos buffers y timeout de seguridad
    return new Promise((resolve, reject) => {
      const chunksOut: Buffer[] = []
      const chunksErr: Buffer[] = []
      const timer = setTimeout(
        () => reject(new Error('Execution timeout')),
        30_000,
      ) // 30 s

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
    if (!containerId) return
    console.log('Deleting container for user ' + userId)
    const container: Docker.Container = this.docker.getContainer(containerId)
    console.log('Container:', container.id)
    await container.stop()
    console.log('Container stopped')
    await container.remove()
    console.log('Container removed')
    this.userContainers.delete(userId)
    console.log('User containers:', this.userContainers)
  }

  async onModuleDestroy() {
    for (const userId of this.userContainers.keys()) {
      await this.removeUserContainer(userId)
    }
  }

  private async buildTar(code: string): Promise<NodeJS.ReadableStream> {
    const tar = require('tar-stream').pack() // import dinámico para no cargar en frío
    tar.entry({ name: 'tmp.maude' }, code)
    tar.finalize()
    return tar
  }
}
