import { table } from 'table'
import ora, { Ora } from 'ora'
import { Command } from 'commander'
import { Logger } from '@ekino/logger'
import * as config from '@ekino/config'
import { getSurveyReleaseConfig } from '../config'
import { TypeFormClient, TypeFormResponsesFilters } from '../extract/typeform_client'
import { createCompositeTransformer } from '../transform/composite_transformer'
import { createElasticsearchLoader } from '../load/elasticsearch_loader'

export const createProcessCommand = (program: Command, logger: Logger) => {
    program
        .command('process <survey> <release>')
        .description('extract/transform/load a survey')
        .option('-b|--batch-size <n>', 'batch size', parseInt, 1000)
        .action(async (survey: string, release: string, options) => {
            try {
                const releaseConfig = getSurveyReleaseConfig(survey, release)
                if (releaseConfig === null) {
                    throw new Error(`no survey release found (${survey}/${release})`)
                }

                const transformer = createCompositeTransformer(releaseConfig.transformers)

                const tfClient = new TypeFormClient({
                    token: config.get('typeform.token')
                })
                const { total_items: total } = await tfClient.listFormResponses(
                    releaseConfig.typeform_id,
                    {
                        page_size: 1,
                        completed: true
                    }
                )
                logger.info(`${total} response(s) to process`)

                const esLoader = createElasticsearchLoader(survey, release)
                await esLoader.init()

                await tfClient.listAllFormResponses(
                    releaseConfig.typeform_id,
                    async res => {
                        const filteredItems = res.items.filter(item => item.answers !== undefined)
                        const transformedItems = []
                        for (const item of filteredItems) {
                            const transformedItem = await transformer.transform(item)
                            transformedItems.push(transformedItem)
                        }

                        await esLoader.load(transformedItems)
                    },
                    { page_size: options.batchSize, completed: true }
                )
                await esLoader.end()
            } catch (error) {
                logger.error(`an error occurred while processing survey results`, { error })
                process.exit(1)
            }
        })
}
