import { TermsAggregationConfig, runTermsAggregation } from './terms_aggregation'
import {
    TermsSubFilterAggregationConfig,
    runTermsSubFilterAggregation
} from './terms_sub_filter_aggregation'

export type AggregationConfig = TermsAggregationConfig | TermsSubFilterAggregationConfig

export interface SectionItemConfig {
    id: string
    aggregations: {
        [id: string]: AggregationConfig
    }
}

export interface SectionAggregationsConfig {
    section: string
    items: SectionItemConfig[]
}

const appendAgg = (all: any[], agg: AggregationConfig, res: any) => {
    if (agg.key !== undefined) {
        const existingAgg = all.find(i => i.id === agg.id)
        if (existingAgg !== undefined) {
            existingAgg[agg.key] = res
        } else {
            all.push({
                id: agg.id,
                [agg.key]: res
            })
        }
    } else {
        all.push({
            id: agg.id,
            ...res
        })
    }
}

export const runAggregations = async (
    survey: string,
    release: string,
    sections: SectionAggregationsConfig[]
) => {
    const aggs: any[] = []
    for (const section of sections) {
        const sectionItems: any[] = []
        console.log(`computing aggregations for section ${section.section}`)
        for (const item of section.items) {
            const itemAggregations: any = {
                id: item.id
            }

            for (const aggId in item.aggregations) {
                const agg = item.aggregations[aggId]

                let res
                if (agg.type === 'terms') {
                    res = await runTermsAggregation(survey, release, agg)
                } else if (agg.type === 'terms_sub_filter') {
                    res = await runTermsSubFilterAggregation(survey, release, agg)
                }

                itemAggregations[aggId] = res
            }

            sectionItems.push(itemAggregations)
        }
        aggs.push({
            section_id: section.section,
            aggregations: sectionItems
        })
    }

    return aggs
}
