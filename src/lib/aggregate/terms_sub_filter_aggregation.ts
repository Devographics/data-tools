import { createClient } from '../load/elasticsearc_loader'
import { Omit } from '../utils'
import { TermsAggregationConfig } from './terms_aggregation'
import { round, computeBucketsPercentages } from './utils'

export interface TermsSubFilterAggregationConfig extends Omit<TermsAggregationConfig, 'type'> {
    type: 'terms_sub_filter'
    filter: any
}

export const mapTermsSubFilterAggregation = (agg: any, total: number) => {
    const mapped = {
        total,
        others_count: agg.sum_other_doc_count as number,
        buckets: agg.buckets.map((bucket: any) => ({
            id: `${bucket.key}`,
            count: bucket.doc_count,
            filtered: {
                count: bucket.filtered.doc_count,
                percentage: round((bucket.filtered.doc_count / bucket.doc_count) * 100)
            }
        }))
    }

    return mapped
}

export const runTermsSubFilterAggregation = async (
    survey: string,
    release: string,
    config: TermsSubFilterAggregationConfig
) => {
    console.log(`> running terms sub filter aggregation for field: ${config.field}`)
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
                    },
                    aggs: {
                        filtered: {
                            filter: config.filter
                        }
                    }
                }
            }
        }
    }
    const res = await client.client.search(params)

    const agg = res.aggregations[config.id]
    if (agg.doc_count_error_upper_bound > 0) {
        console.warn(
            `> terms sub filter aggregation contains ${agg.doc_count_error_upper_bound} error(s)`
        )
    }

    const mappedAggregation = mapTermsSubFilterAggregation(agg, res.hits.total)

    return {
        ...mappedAggregation,
        buckets: computeBucketsPercentages(mappedAggregation.buckets, mappedAggregation.total)
    }
}
