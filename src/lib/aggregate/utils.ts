import { maxBy } from 'lodash'
import { Omit } from '../utils'
import { Bucket } from './types'

export const round = (value: number, fractionDigits: number = 2) => {
    return Number(value.toFixed(fractionDigits))
}

export const computeBucketsPercentages = (buckets: Omit<Bucket, 'percentage'>[], total: number) => {
    // const countTotal = buckets.reduce((acc, bucket) => acc + bucket.count, 0)
    const bucketsWithPercentage = buckets.map(bucket => ({
        ...bucket,
        percentage: round((bucket.count / total) * 100)
    }))

    // used to check if buckets sum equals total
    // console.log({ total, countTotal })

    /*
    const percentageTotal = round(
        bucketsWithPercentage.reduce((acc, bucket) => acc + bucket.percentage, 0)
    )
    const percentageDiff = round(100 - percentageTotal)

    // console.log({ percentageTotal, percentageDiff })

    if (percentageDiff !== 0) {
        const maxBucket = maxBy(bucketsWithPercentage, 'count')
        if (maxBucket) {
            maxBucket.percentage = round(maxBucket.percentage + percentageDiff)
        }
    }
    */

    // console.log({ fixed: bucketsWithPercentage.reduce((acc, bucket) => acc + bucket.percentage, 0) })

    return bucketsWithPercentage
}
