import { createClient } from '../load/elasticsearc_loader'
import { computeBucketsPercentages } from './utils'

export interface TermsAggregationConfig {
    type: 'terms'
    id: string
    field: string
    size?: number
    isNumber?: boolean
}

export type AggregationConfig = TermsAggregationConfig

export interface SectionAggregationsConfig {
    section: string
    items: TermsAggregationConfig[]
}

export interface RawBucket {
    key: string
    doc_count: number
}

export interface Bucket {
    id: string
    count: number
    percentage: number
}

export interface RawAggregation {
    doc_count_error_upper_bound: number
    sum_other_doc_count: number
    buckets: RawBucket[]
}

export const mapAggregation = (agg: RawAggregation, total: number) => {
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
    console.log(`> running term aggregation for field: ${config.field}`)
    const client = createClient()

    const field = `${config.field}.value${config.isNumber ? '' : '.keyword'}`

    const params = {
        index: survey,
        size: 0,
        body: {
            query: {
                bool: {
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

    if (res.aggregations[config.id].doc_count_error_upper_bound > 0) {
        // console.error('aggregation contains errors', res.aggregations[config.id])
        // throw new Error('aggregation contains errors')
    }

    const mappedAggregation = mapAggregation(res.aggregations[config.id], res.hits.total)

    return {
        ...mappedAggregation,
        buckets: computeBucketsPercentages(mappedAggregation.buckets, mappedAggregation.total)
    }
}

export const runAggregations = async (
    survey: string,
    release: string,
    sections: SectionAggregationsConfig[]
) => {
    const aggs: any[] = []
    for (const section of sections) {
        const sectionAggs: any[] = []
        console.log(`computing aggregations for section ${section.section}`)
        for (const agg of section.items) {
            if (agg.type === 'terms') {
                const res = await runTermsAggregation(survey, release, agg)
                sectionAggs.push({
                    id: agg.id,
                    ...res,
                })
            }
        }
        aggs.push({
            section_id: section.section,
            aggregations: sectionAggs
        })
    }

    return aggs
}
