export interface SourceConfig {
    fields: string[]
    fieldName: string
}

export const createSourceTransformer = (options: SourceConfig) => {
    return {
        transform: (data: any[]) => {
            const values = options.fields
                .map(field => data.find((item: any) => item.id === field))
                .filter((field: any) => field !== undefined)
                .map((field: any) => field.value)
                .filter((field: any) => field !== undefined)

            if (values.length > 0) {
                data.push({
                    id: options.fieldName,
                    fieldId: options.fieldName,
                    value: values[0]
                })
            }

            return data
        }
    }
}
