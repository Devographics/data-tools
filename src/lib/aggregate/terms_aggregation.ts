import { createClient } from '../load/elasticsearch_loader'
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

    const field = `${config.field}${config.isNumber ? '' : '.keyword'}`

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
                aggregation: {
                    terms: {
                        field,
                        size: config.size || 20
                    }
                }
            }
        }
    }
    const res = await client.client.search(params)

    const agg = res.aggregations.aggregation
    if (agg.doc_count_error_upper_bound > 0) {
        console.warn(`> terms aggregation contains ${agg.doc_count_error_upper_bound} error(s)`)
    }

    const mappedAggregation = mapTermsAggregation(agg, res.hits.total)

    if (config.field === 'units_selectors_formcontrols.value') {
        console.log(require('util').inspect(config, { depth: null, colors: true }))
        console.log(require('util').inspect(params, { depth: null, colors: true }))
        console.log(require('util').inspect(res, { depth: null, colors: true }))
        console.log(require('util').inspect(agg, { depth: null, colors: true }))
        console.log(require('util').inspect(mappedAggregation, { depth: null, colors: true }))
        console.log(require('util').inspect(computeBucketsPercentages(mappedAggregation.buckets, mappedAggregation.total), { depth: null, colors: true }))
    }

    return {
        ...mappedAggregation,
        buckets: computeBucketsPercentages(mappedAggregation.buckets, mappedAggregation.total)
    }
}
