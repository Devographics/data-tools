import { Transformer } from './index'
import { createUserInfoTransformer } from './user_info_transformer'
import { createGeoTransformer } from './geo_transformer'
import { createCleanupTransformer } from './cleanup_transformer'
import { createNormalizeTypeFormTransformer } from './normalize_typeform_transformer'
import { createToObjectTransformer } from './to_object_transformer'
import { createDictMapperTransformer } from './dict_mapper_transformer'

export type TransformerType =
    | 'user_info'
    | 'geo'
    | 'cleanup'
    | 'normalize_typeform'
    | 'to_object'
    | 'dict_mapper'

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
    if (type === 'to_object') {
        return createToObjectTransformer(config)
    }
    if (type === 'dict_mapper') {
        return createDictMapperTransformer(config)
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
