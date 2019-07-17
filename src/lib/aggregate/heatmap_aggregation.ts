import { createClient } from '../load/elasticsearch_loader'

export interface HeatmapAggregationConfig {
    type: 'heatmap'
    id: string
    key?: string
    field: string
    // condition, should be something like `used_it`, `would_use`, …
    condition: string
    // fields to use, should be tools or features
    items: Array<{
        id: string
        field: string
    }>
}

export const runHeatmapAggregation = async (
    survey: string,
    release: string,
    config: HeatmapAggregationConfig
) => {
    const { field, condition, items } = config

    console.log(`> running heatmap aggregation for field: ${field} on items:`)
    console.log(`  - ${items.map(i => `${i.id} (${i.field})`).join('\n  - ')}`)
    console.log(`  with condition: ${condition}`)

    const boolQuery: any = {
        must: [
            {
                term: {
                    'releaseId.keyword': release
                }
            }
        ]
    }

    const filters = items.map(item => ({
        match: {
            [`${item.field}.value`]: {
                query: condition,
                operator: 'or'
            }
        }
    }))

    console.log(require('util').inspect(filters, { depth: null }))

    const params = {
        index: survey,
        size: 0,
        body: {
            query: {
                bool: boolQuery
            },
            aggs: {
                top: {
                    terms: {
                        field: `${field}.value.keyword`
                    }
                },
                items: {
                    filters: { filters },
                    aggs: {
                        sub: {
                            terms: {
                                field: `${field}.value.keyword`
                            }
                        }
                    }
                }
            }
        }
    }

    const client = createClient()
    const res = await client.client.search(params)

    const topCounts = res.aggregations.top.buckets.reduce((acc: any, bucket: any) => ({
        ...acc,
        [bucket.key]: bucket.doc_count
    }), {})

    const mappedAggregation = res.aggregations.items.buckets.map((item: any, index: number) => ({
        id: items[index].id,
        count: item.doc_count,
        buckets: item.sub.buckets.map((bucket: any) => {
            return ({
                id: bucket.key,
                count: bucket.doc_count,
                absolute_percentage: Number((bucket.doc_count / item.doc_count * 100).toFixed(2)),
                relative_percentage: Number((bucket.doc_count / topCounts[bucket.key] * 100).toFixed(2))
            })
        })
    }))

    // console.log(require('util').inspect(mappedAggregation, { depth: null, colors: true }))

    return mappedAggregation
}
