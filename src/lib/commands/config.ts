import { Command } from 'commander'
import { Logger } from '@ekino/logger'
import * as config from '@ekino/config'

export const dumpConfigCommand = (program: Command, logger: Logger) => {
    program
        .command('config:dump')
        .description('dump current config')
        .action(() => {
            logger.info('surveys config', config.dump())
        })
}
