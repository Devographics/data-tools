import { Transformer } from './index'
import { createNormalizeTypeFormTransformer } from './normalize_typeform_transformer'
import { createGeoTransformer } from './geo_transformer'
import { createCleanupTransformer } from './cleanup_transformer'
import { createDictMapperTransformer, DictMapperConfig } from './dict_mapper_transformer'
import { createNormalizeTransformer, NormalizeConfig } from './normalize_transformer'
import { createToObjectTransformer } from './to_object_transformer'

export type TransformerType =
    | 'geo'
    | 'cleanup'
    | 'normalize_typeform'
    | 'to_object'
    | 'dict_mapper'
    | 'normalize'

export type TransformerConfig = DictMapperConfig | NormalizeConfig

const transformerByType = (type: TransformerType, config?: any): Transformer => {
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
        transform: async (inputData: any) => {
            let data = inputData
            for (const transformer of transformerInstances) {
                data = await transformer.transform(data)
            }

            return data
        }
    }
}
