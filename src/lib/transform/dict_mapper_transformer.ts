import * as config from '@ekino/config'

export interface DictMapperConfig {
    dict: string
    fields: string[]
}

export const createDictMapperTransformer = (options: DictMapperConfig) => {
    const dictionaries = config.get('dictionaries')
    const dictionary = dictionaries[options.dict]
    if (dictionary === undefined) {
        throw new Error(
            `No dictionary found for id: '${
                options.dict
            }', available dictionaries are: '${Object.keys(dictionaries).join(`', '`)}'`
        )
    }

    const idByLabel = dictionary.reduce(
        (acc: any, entry: any) => ({
            ...acc,
            [entry.label]: entry.id
        }),
        {}
    )

    return {
        transform: (data: any) => {
            return data.map((item: any) => {
                if (options.fields.includes(item.id)) {
                    const id = idByLabel[item.value]
                    if (id !== undefined) {
                        return { ...item, value: id }
                    }
                }

                return item
            })
        }
    }
}
