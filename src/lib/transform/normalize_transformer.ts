import { isString } from 'lodash'
import * as config from '@ekino/config'

export interface NormalizeConfig {
    normalization: string
    fields: string[]
}

export const createNormalizeTransformer = (options: NormalizeConfig) => {
    const normalizations = config.get('normalizations')
    const normalization = normalizations[options.normalization]
    if (normalization === undefined) {
        throw new Error(
            `No normalization found for id: '${
                options.normalization
            }', available normalizations are: '${Object.keys(normalizations).join(`', '`)}'`
        )
    }

    const matchers = normalization.map((norm: any) => {
        const m = norm.match.match(/\/(.*)\/([gim]*)/)
        if (m === null) {
            throw new Error(
                `Invalid normalize transformer regexp '${norm.match}' (${options.normalization})`
            )
        }
        const regexp = new RegExp(m[1], m[2])

        return { ...norm, regexp }
    })

    return {
        transform: (data: any[]) => {
            return data.map((item: any) => {
                if (options.fields.includes(item.id)) {
                    for (const matcher of matchers) {
                        if (isString(item.value) && item.value.match(matcher.regexp) !== null) {
                            return {
                                ...item,
                                value: matcher.replace
                            }
                        }
                    }
                }

                return item
            })
        }
    }
}
