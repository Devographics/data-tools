import { createClient } from '../load/elasticsearc_loader'
import { computeBucketsPercentages } from './utils'
import { BoolQueryCondition, RawAggregation } from './types'

export interface TermsAggregationConfig {
    type: 'terms'
    id: string
    key?: string
    field: string
    size?: number
    isNumber?: boolean
    must?: BoolQueryCondition[]
}

export const mapTermsAggregation = (agg: RawAggregation, total: number) => {
    const mapped = {
        total,
        others_count: agg.sum_other_doc_count as number,
        buckets: agg.buckets.map((bucket: any) => ({
            id: `${bucket.key}`,
            count: bucket.doc_count
        }))
    }

    return mapped
}

export const runTermsAggregation = async (
    survey: string,
    release: string,
    config: TermsAggregationConfig
) => {
    console.log(`> running terms aggregation for field: ${config.field}`)
    const client = createClient()

    const field = `${config.field}.value${config.isNumber ? '' : '.keyword'}`

    const boolQuery: any = {
        must: [
            {
                term: {
                    'releaseId.keyword': release
                }
            },
            {
                exists: { field }
            }
        ]
    }
    if (config.must !== undefined) {
        boolQuery.must.push(config.must)
    }

    const params = {
        index: survey,
        size: 0,
        body: {
            query: {
                bool: boolQuery
            },
            aggs: {
                [config.id]: {
                    terms: {
                        field,
                        size: config.size || 20
                    }
                }
            }
        }
    }
    const res = await client.client.search(params)

    const agg = res.aggregations[config.id]
    if (agg.doc_count_error_upper_bound > 0) {
        console.warn(`> terms aggregation contains ${agg.doc_count_error_upper_bound} error(s)`)
    }

    const mappedAggregation = mapTermsAggregation(agg, res.hits.total)

    return {
        ...mappedAggregation,
        buckets: computeBucketsPercentages(mappedAggregation.buckets, mappedAggregation.total)
    }
}
