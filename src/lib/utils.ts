import { snakeCase } from 'lodash'

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export const slugify = (str: string) =>
    snakeCase(str)
        .replace(/^\./, '')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/^[^a-z0-9]/, '')

const emptyValues = [
    ' ',
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
    'NA',
    'None',
    'none',
    'no',
    'No',
    '.',
    '?'
]
export const cleanupValue = (value: string) => (emptyValues.includes(value) ? null : value)

/**
 * Generates a normalizer from an array of rules.
 * The normalizer will return the first matching
 * rule normalized value.
 *
 * @see multiNormalizer
 *
exports.uniNormalizer = rules => value => {
    for (let rule of rules) {
        const [pattern, normalized] = rule
        if (value.match(pattern) !== null) {
            return normalized
        }
    }

    return value
}

/**
 * Generates a normalizer from an array of rules.
 * The normalizer will return all matching
 * rules normalized value.
 *
 * @see uniNormalizer
 *
exports.multiNormalizer = rules => value => {
    const normalizedItems = []

    for (let rule of rules) {
        const [pattern, normalized] = rule
        if (value.match(pattern) !== null) {
            normalizedItems.push(normalized)
        }
    }

    return normalizedItems
}
*/
