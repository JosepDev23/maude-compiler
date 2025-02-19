import { Injectable } from '@nestjs/common'
import { ChildProcessWithoutNullStreams, spawn } from 'child_process'

@Injectable()
export class AppService {
  maudeProcess: ChildProcessWithoutNullStreams | null = null

  initMaude(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.maudeProcess = spawn('./maude', {
        cwd: '/home/josep/Downloads/Maude-3.5-linux-x86_64',
        shell: true,
      })

      let output = ''
      let errorOutput = ''

      this.maudeProcess.stdout.on('data', (data: Buffer) => {
        output += data.toString()
        return resolve(output)
      })

      this.maudeProcess.stderr.on('data', (data: Buffer) => {
        errorOutput += data.toString()
        return resolve(errorOutput)
      })

      this.maudeProcess.on('close', (code: number) => {
        if (code !== 0) {
          return reject(
            `El proceso terminó con el código ${code}. Error: ${errorOutput}`,
          )
        }
        return resolve(output)
      })

      this.maudeProcess.on('error', (error: Error) => {
        return reject(`Error al iniciar el proceso: ${error.message}`)
      })
    })
  }

  execCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.maudeProcess) return resolve('Please, init Maude')

      this.maudeProcess.stdout.on('data', (data: Buffer) => {
        return resolve(data.toString())
      })

      this.maudeProcess.stderr.on('data', (data: Buffer) => {
        return resolve(data.toString())
      })

      this.maudeProcess.stdin.write(command + '\n')
    })
  }
}
