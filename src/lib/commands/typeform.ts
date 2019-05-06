import { table } from 'table'
import ora, { Ora } from 'ora'
import { Command } from 'commander'
import { Logger } from '@ekino/logger'
import * as config from '@ekino/config'
import { TypeFormClient, TypeFormResponsesFilters } from '../extract/typeform_client'
import { createFileLoader } from '../load/file_loader'

const getClient = () => {
    return new TypeFormClient({
        token: config.get('typeform.token')
    })
}

export const listFormsCommand = (program: Command, logger: Logger) => {
    program
        .command('tf:forms:ls')
        .description('list forms')
        .action(async () => {
            const spinner = ora(`fetching forms`).start()
            try {
                const client = getClient()

                const forms = await client.listForms()
                spinner.succeed(`successfully fetched forms`)
                console.log(
                    table([
                        ['title', 'id', 'public', 'updated'],
                        ...forms.items.map(form => [
                            form.title,
                            form.id,
                            form.settings.is_public ? '✅' : '🚫',
                            form.last_updated_at
                        ])
                    ])
                )
            } catch (error) {
                spinner.fail(`an error occurred while fetching forms`)
                logger.error(error.message, { error })
                process.exit(1)
            }
        })
}

export const getFormCommand = (program: Command, logger: Logger) => {
    program
        .command('tf:form <uid>')
        .description('fetch form info')
        .action(async (uid: string) => {
            try {
                logger.info(`fetching form: ${uid}`)
                const client = getClient()

                const form = await client.getForm(uid)
                //logger.info(`${form.title}: ${form.settings.meta.description}`, form)
                form.fields
                    .filter(field => field.type !== 'statement')
                    .forEach(field => {
                        logger.info(field.ref, field)
                    })
            } catch (error) {
                logger.error(error.message, { error })
                process.exit(1)
            }
        })
}

export const getFormStatsCommand = (program: Command, logger: Logger) => {
    program
        .command('tf:form:stats <uid>')
        .description('fetch form stats')
        .action(async (uid: string) => {
            const spinner = ora(`fetching form stats: ${uid}`).start()
            try {
                const client = getClient()

                const [all, completed, incomplete] = await Promise.all([
                    client.listFormResponses(uid, { page_size: 1 }),
                    client.listFormResponses(uid, { page_size: 1, completed: true }),
                    client.listFormResponses(uid, { page_size: 1, completed: false })
                ])

                spinner.succeed(`successfully fetched stats`)
                logger.info(`${all.total_items} response(s)`)
                logger.info(`${completed.total_items} completed response(s)`)
                logger.info(`${incomplete.total_items} incomplete response(s)`)
            } catch (error) {
                spinner.fail(`an error occurred while fetching form stats`)
                logger.error(error.message, { error })
                process.exit(1)
            }
        })
}

export const listResponsesCommand = (program: Command, logger: Logger) => {
    program
        .command('tf:responses:ls <uid>')
        .description('fetch form responses')
        .option('-p|--page-size <n>', 'Maximum number of responses', parseInt, 10)
        .option('-c|--completed', 'Only fetch completed responses')
        .option('-i|--incomplete', 'Only fetch incomplete responses')
        .action(async (uid: string, options) => {
            const filters: TypeFormResponsesFilters = {
                page_size: Number(options.pageSize)
            }
            if (options.completed === true) {
                filters.completed = true
            } else if (options.incomplete === true) {
                filters.completed = false
            }

            const spinner = ora(`fetching form responses: ${uid}`).start()
            try {
                const client = getClient()

                const res = await client.listFormResponses(uid, filters)
                spinner.succeed(
                    `successfully fetched ${res.items.length}/${res.total_items} form responses`
                )
                // logger.info('responses', res.items)
                res.items.forEach(response => {
                    logger.info('', response.answers)
                })
            } catch (error) {
                spinner.fail(`an error occurred while fetching form responses`)
                logger.error(error.message, { error })
                process.exit(1)
            }
        })
}

export const fetchAllResponsesCommand = (program: Command, logger: Logger) => {
    program
        .command('tf:responses:all <uid>')
        .description('fetch all form responses')
        .option('-p|--page-size <n>', 'Maximum number of responses', parseInt, 1000)
        .action(async (uid: string, options) => {
            logger.info(`fetching form responses: ${uid}`)
            const spinner = ora()
            try {
                const client = getClient()

                const { total_items: total } = await client.listFormResponses(uid, {
                    page_size: 1,
                    completed: true
                })
                logger.info(`${total} response(s) to fetch`)

                const fileLoader = createFileLoader({
                    surveyId: uid,
                    rowsPerFile: options.pageSize
                })
                await fileLoader.init()

                spinner.start(`0/${total}`)
                let fetchedTotal = 0
                await client.listAllFormResponses(
                    uid,
                    async (res, iteration) => {
                        fetchedTotal += res.items.length
                        spinner.text = `${fetchedTotal}/${total} ${'.'.repeat(iteration + 1)}`
                        await fileLoader.load(res.items)
                    },
                    { page_size: options.pageSize, completed: true }
                )
                await fileLoader.end()
                spinner.succeed(`successfully fetched form responses`)
            } catch (error) {
                logger.error(error.message, { error })
                process.exit(1)
            }
        })
}
