import { TypeFormResponse } from '../extract/typeform_client'
import { slugify } from '../utils'

const coreFields = ['token', 'landed_at', 'submitted_at']
export const createNormalizeTypeFormTransformer = (options: { fields: string[] }) => {
    return {
        transform: (data: TypeFormResponse) => {
            let mapped: any[] = []
            coreFields.forEach(coreField => {
                mapped.push({
                    id: `core__${coreField}`,
                    fieldId: `core__${coreField}`,
                    value: (data as any)[coreField]
                })
            })
            if (data.metadata !== undefined) {
                Object.entries(data.metadata).forEach(([key, value]) => {
                    mapped.push({
                        id: `meta__${key}`,
                        fieldId: `meta__${key}`,
                        value
                    })
                })
            }
            if (data.hidden !== undefined) {
                Object.entries(data.hidden).forEach(([key, value]) => {
                    mapped.push({
                        id: `hidden__${key}`,
                        fieldId: `hidden__${key}`,
                        value
                    })
                })
            }
            mapped = data.answers.reduce((acc: any, answer: any) => {
                let value
                if (answer.type === 'choice') {
                    value = answer.choice.label
                } else if (answer.type === 'choices') {
                    value = answer.choices.labels
                } else if (answer.type === 'number') {
                    value = answer.number
                } else if (answer.type === 'text') {
                    value = answer.text
                } else if (answer.type === 'email') {
                    value = answer.email
                } else {
                    throw new Error(`unknown answer type: ${answer.type}`)
                }

                return [
                    ...acc,
                    {
                        id: slugify(answer.field.ref),
                        fieldId: answer.field.id,
                        value
                    }
                ]
            }, mapped)

            return mapped
        }
    }
}
