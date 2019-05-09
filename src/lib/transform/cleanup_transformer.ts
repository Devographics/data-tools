import { isString } from 'lodash'

export interface CleanupConfig {
    fields: string[]
}

const emptyValues = [
    '',
    '\n',
    '\n\n',
    '/',
    '\\',
    '*',
    '+',
    '-',
    '—',
    'n/a',
    'N/A',
    'N/a',
    'NA',
    'Na',
    'na',
    'None',
    'none',
    'Nope',
    'nope',
    'no',
    'No',
    'NO',
    'No.',
    '\nNo',
    '.',
    '?',
    '??',
    '???',
    '????',
    'huh?',
    '…',
    '...',
    '--',
    `'`,
]

export const createCleanupTransformer = (options: CleanupConfig) => {
    return {
        transform: (data: any[]) => {
            return data.map((item: any) => {
                let value = item.value
                if (!options.fields.includes(item.id) || !isString(value)) {
                    return item
                }

                value = value.trim()
                if (emptyValues.includes(value)) {
                    value = undefined
                }

                return { ...item, value, rawValue: item.value }
            })
        }
    }
}
