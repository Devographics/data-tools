import * as cp from 'child_process'
import { Command } from 'commander'
import { Logger } from '@ekino/logger'
import * as config from '@ekino/config'

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

export const setupCommand = (program: Command, logger: Logger) => {
    program
        .command('setup')
        .description('setup CLI & check env/config')
        .action(async () => {
            logger.info('setting up CLI')

            if (config.get('typeform.token') !== undefined) {
                logger.info('typeform.token is defined ✔')
            } else {
                logger.error(
                    [
                        `typeform.token is not defined`,
                        `please add an .env file containing TYPEFORM_TOKEN`,
                        `or export this variable for your current session`
                    ].join('\n')
                )
                process.exit(1)
            }

            logger.info('launching docker compose stack')
            await spawn(logger, `docker-compose`, [`up`, `-d`])

            logger.info('checking docker compose services status')
            await spawn(logger, `docker-compose`, ['ps'])
        })
}
