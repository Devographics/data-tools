import * as config from '@ekino/config'
import { SectionAggregationsConfig } from './aggregate'

export interface SurveyReleaseConfig {
    id: string
    typeform_id: string
    transformers: Array<{
        type: 'user_info'
        config?: any
    }>
    aggregations: SectionAggregationsConfig[]
}

export interface SurveyConfig {
    id: string
    releases: SurveyReleaseConfig[]
}

export const getSurveysConfig = (): SurveyConfig[] => config.get('surveys')

export const getSurveyReleaseConfig = (
    survey: string,
    release: string
): SurveyReleaseConfig | null => {
    const all = getSurveysConfig()

    const surveyConfig = all.find(s => s.id === survey)
    if (surveyConfig === undefined) return null

    const releaseConfig = surveyConfig.releases.find(r => r.id === release)
    if (releaseConfig === undefined) return null

    return releaseConfig
}
