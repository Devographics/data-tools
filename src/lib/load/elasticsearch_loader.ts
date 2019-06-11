import { Client } from 'elasticsearch'
import * as config from '@ekino/config'

export const createClient = () => {
    const client = new Client({
        host: `${config.get('elasticsearch.host')}:${config.get('elasticsearch.port')}`,
        log: config.get('elasticsearch.log')
    })

    return {
        client,
        recreateIndex: async (index: string) => {
            try {
                await client.indices.delete({ index })
            } catch (err) {
                // error occurs if the index doesn't exist,
                // which is the case on init
            }
            await client.indices.create({ index })
        }
    }
}

export const createElasticsearchLoader = (
    surveyId: string,
    releaseId: string,
    {
        batchSize = 500
    }: {
        batchSize?: number
    } = {}
) => {
    const client = createClient()

    let index = 0
    let buffer: any[] = []

    const write = async () => {
        const chunk = buffer.splice(0, batchSize)

        const res = await client.client.bulk({
            refresh: true,
            body: chunk.reduce((acc, item) => {
                acc.push({
                    index: {
                        _index: surveyId,
                        _type: 'response',
                        _id: item.core__token.value
                    }
                })
                acc.push({
                    surveyId,
                    releaseId,
                    ...item
                })

                return acc
            }, [])
        })

        if (res.errors === true) {
            // console.error(require('util').inspect(res, { depth: null }))
            // console.error(res.items.map((i: any) => i.index.error))
            const failed = res.items.filter((i: any) => i.index.result !== 'created')
            console.error(require('util').inspect(failed, { depth: null }))

            throw new Error(`an error occurred while loading results`)
        }

        index++
        if (buffer.length >= batchSize) await write()
    }

    return {
        init: async () => {
            await client.recreateIndex(surveyId)
        },
        load: async (data: any[]) => {
            buffer = buffer.concat(data)
            if (buffer.length >= batchSize) await write()
        },
        end: async () => {
            if (buffer.length >= 0) await write()
        }
    }
}
