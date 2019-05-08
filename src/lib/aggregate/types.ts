export interface BoolQueryCondition {
    term: {
        [key: string]: string
    }
}

export interface RawBucket {
    key: string
    doc_count: number
}

export interface Bucket {
    id: string
    count: number
    percentage: number
}

export interface RawAggregation {
    doc_count_error_upper_bound: number
    sum_other_doc_count: number
    buckets: RawBucket[]
}
