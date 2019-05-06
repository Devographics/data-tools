import { table } from 'table'
import ora, { Ora } from 'ora'
import { Command } from 'commander'
import { Logger } from '@ekino/logger'
import * as config from '@ekino/config'
import { createClient } from '../load/elasticsearc_loader'

export const listIndicesCommand = (program: Command, logger: Logger) => {
    program
        .command('es:indices:ls')
        .description('list existing elasticsearch indices')
        .action(async () => {
            try {
                const client = createClient()
                const indices: any[] = await client.client.cat.indices({ format: 'json' })
                console.log(
                    table([
                        ['uuid', 'index', 'status', 'health', 'doc count', 'store size'],
                        ...indices.map(index => [
                            index.uuid,
                            index.index,
                            index.status,
                            index.health,
                            index['docs.count'],
                            index['store.size']
                        ])
                    ])
                )
            } catch (error) {
                logger.error(`an error occurred while fetching indices`, { error })
                process.exit(1)
            }
        })
}

export const createIndicesCommand = (program: Command, logger: Logger) => {
    program
        .command('es:indices:create')
        .description('create required elasticsearch indices')
        .action(async () => {
            const surveysConfig = config.get('surveys')
            logger.info(`creating elasticsearch indices for ${surveysConfig.length} survey(s)`)

            let spinner: Ora | undefined
            try {
                const client = createClient()
                for (const surveyConfig of surveysConfig) {
                    spinner = ora(`creating index for ${surveyConfig.id}`).start()
                    await client.recreateIndex(`${surveyConfig.id}`)
                    spinner.succeed(`successfully created ${surveyConfig.id} index`)
                }
            } catch (error) {
                if (spinner !== undefined) {
                    spinner.fail(`an error occurred while creating required indices`)
                }
                logger.error(error.message, { error })
                process.exit(1)
            }
        })
}
