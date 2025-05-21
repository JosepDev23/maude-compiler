import { Injectable, OnModuleDestroy } from '@nestjs/common'
import Docker from 'dockerode'
import internal from 'stream'
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

  async executeCode(userId: string, code: string): Promise<string> {
    const containerId: string = this.userContainers.get(userId)

    if (!containerId) return 'Please, create a container first'

    const container: Docker.Container = this.docker.getContainer(containerId)

    const exec: Docker.Exec = await container.exec({
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ['maude'],
    })

    const stream: internal.Duplex = await exec.start({})
    let output: string = ''

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => {
        output += chunk.toString()
      })

      stream.on('end', () => {
        resolve(output)
      })

      stream.on('error', (error: Error) => {
        reject(error.message)
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
}
