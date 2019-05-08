import { Command } from 'commander'
import { safeDump } from 'js-yaml'
import { Logger } from '@ekino/logger'
import { getSurveyReleaseConfig } from '../config'
import { runAggregations } from '../aggregate'
import { writeFile } from '../fs'

const fileHeader = `#
# This file has been automatically generated.
# Please do not modify it manually as it might
# be overriden.
#
`

export const createAggregateCommand = (program: Command, logger: Logger) => {
    program
        .command('aggregate <survey> <release>')
        .description('aggregate survey data')
        .action(async (survey: string, release: string, options) => {
            try {
                const releaseConfig = getSurveyReleaseConfig(survey, release)
                if (releaseConfig === null) {
                    throw new Error(`no survey release found (${survey}/${release})`)
                }

                const aggs = await runAggregations(survey, release, releaseConfig.aggregations)

                for (const section of aggs) {
                    const sectionConfig: any = releaseConfig.aggregations.find(
                        ({ section: id }) => id === section.section_id
                    )

                    const fileContent = `${fileHeader}${safeDump(section)}`

                    await writeFile(
                        `../state-of-css-2019/src/data/results/${
                            sectionConfig.dest ? `${sectionConfig.dest}/` : ''
                        }${section.section_id}.yml`,
                        fileContent
                    )
                }
            } catch (error) {
                logger.error(`an error occurred while aggregating survey results`, { error })
                process.exit(1)
            }
        })
}
