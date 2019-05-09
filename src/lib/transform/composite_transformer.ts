import { Transformer } from './index'
import { createNormalizeTypeFormTransformer } from './normalize_typeform_transformer'
import { createUserInfoTransformer } from './user_info_transformer'
import { createGeoTransformer } from './geo_transformer'
import { createCleanupTransformer } from './cleanup_transformer'
import { createDictMapperTransformer, DictMapperConfig } from './dict_mapper_transformer'
import { createNormalizeTransformer, NormalizeConfig } from './normalize_transformer'
import { createToObjectTransformer } from './to_object_transformer'

export type TransformerType =
    | 'user_info'
    | 'geo'
    | 'cleanup'
    | 'normalize_typeform'
    | 'to_object'
    | 'dict_mapper'
    | 'normalize'

export type TransformerConfig =
    | DictMapperConfig
    | NormalizeConfig

const transformerByType = (type: TransformerType, config?: any): Transformer => {
    if (type === 'user_info') {
        return createUserInfoTransformer(config)
    }
    if (type === 'geo') {
        return createGeoTransformer(config)
    }
    if (type === 'cleanup') {
        return createCleanupTransformer(config)
    }
    if (type === 'normalize_typeform') {
        return createNormalizeTypeFormTransformer(config)
    }
    if (type === 'dict_mapper') {
        return createDictMapperTransformer(config)
    }
    if (type === 'normalize') {
        return createNormalizeTransformer(config)
    }
    if (type === 'to_object') {
        return createToObjectTransformer()
    }

    throw new Error(`no transformer found for type: ${type}`)
}

export const createCompositeTransformer = (
    transformers: Array<{
        type: TransformerType
        config?: any
    }>
): Transformer => {
    const transformerInstances = transformers.map(t => transformerByType(t.type, t.config))

    return {
        transform: (data: any) => {
            return transformerInstances.reduce((d: any, t: Transformer) => {
                return t.transform(d)
            }, data)
        }
    }
}
