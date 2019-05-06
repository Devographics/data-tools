import * as cp from 'child_process'
import { Command } from 'commander'
import { Logger } from '@ekino/logger'

const spawn = async (
    logger: Logger,
    command: string,
    args: string[],
    options: Partial<cp.SpawnOptions> = {}
) => {
    return new Promise((resolve, reject) => {
        const cmd = cp.spawn(command, args, {
            ...options,
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        })
        cmd.stdout.on('data', data => {
            logger.debug(`> ${data.toString().trim()}`)
        })
        cmd.stderr.on('data', data => {
            logger.debug(`> ${data.toString().trim()}`)
        })
        cmd.on('close', code => {
            resolve(code)
        })
    })
}

export const stopCommand = (program: Command, logger: Logger) => {
    program
        .command('stop')
        .description('stop CLI services')
        .action(async () => {
            logger.info('stopping CLI services')

            logger.info('launching docker compose stack')
            await spawn(logger, `docker-compose`, [`stop`])

            logger.info('checking docker compose services status')
            await spawn(logger, `docker-compose`, ['ps'])
        })
}
