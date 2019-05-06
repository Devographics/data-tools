import * as qs from 'querystring'
import { last } from 'lodash'
import fetch, { RequestInit } from 'node-fetch'

export interface TypeFormConfig {
    endpoint?: string
    token: string
}

export interface TypeFormScreen {
    ref: string
    title: string
    properties: {
        show_button: boolean
        button_text: string
    }
    attachment?: {
        type: string
        href: string
    }
}

export interface TypeFormBaseField {
    id: string
    ref: string
    title: string
}

export interface TypeFormStatementField extends TypeFormBaseField {
    type: 'statement'
    properties: {
        hide_marks: boolean
        button_text: string
    }
}

export interface TypeFormGroupField extends TypeFormBaseField {
    type: 'group'
    properties: {
        description: string
        show_button: boolean
        button_text: string
        fields: TypeFormField[]
    }
}

export interface TypeFormChoice {
    id: string
    ref: string
    label: string
}

export interface TypeFormMultipleChoiceField extends TypeFormBaseField {
    type: 'multiple_choice'
    properties: {
        randomize: boolean
        allow_multiple_selection: boolean
        allow_other_choice: boolean
        vertical_alignment: boolean
        choices: TypeFormChoice[]
    }
    validations: {
        required: boolean
    }
}

export interface TypeFormShortTextField extends TypeFormBaseField {
    type: 'short_text'
    properties?: {
        description: string
    }
    validations: {
        required: boolean
    }
}

export interface TypeFormLongTextField extends TypeFormBaseField {
    type: 'long_text'
    properties?: {
        description: string
    }
    validations: {
        required: boolean
    }
}

export interface TypeFormOpinionScaleField extends TypeFormBaseField {
    type: 'opinion_scale'
    properties: {
        steps: number
        start_at_one: boolean
        //labels:       (max depth reached)
    }
    validations: {
        required: boolean
    }
}

export type TypeFormField =
    | TypeFormStatementField
    | TypeFormGroupField
    | TypeFormMultipleChoiceField
    | TypeFormShortTextField
    | TypeFormLongTextField
    | TypeFormOpinionScaleField

export interface TypeFormMinimalForm {
    id: string
    title: string
    last_updated_at: string
    theme: {
        href: string
    }
    settings: {
        is_public: boolean
        is_trial: boolean
    }
    _links: {
        display: string
    }
}

export interface TypeFormForm extends TypeFormMinimalForm {
    workspace: {
        href: string
    }
    settings: {
        is_public: boolean
        is_trial: boolean
        language: string
        progress_bar: string
        show_progress_bar: boolean
        show_typeform_branding: boolean
        meta: {
            allow_indexing: boolean
            description: string
            image: {
                href: string
            }
        }
    }
    welcome_screens: TypeFormScreen[]
    thankyou_screens: TypeFormScreen[]
    fields: TypeFormField[]
    hidden: string[]
    logic: any[]
    variables: any
}

export interface TypeFormPaginatedResponse<T> {
    total_items: number
    page_count: number
    items: T[]
}

export interface TypeFormChoiceAnswer {
    type: 'choice'
    field: {
        id: string
        ref: string
        type: string
    }
    choice: {
        label: string
    }
}

export interface TypeFormTextAnswer {
    type: 'text'
    field: {
        id: string
        ref: string
        type: string
    }
    text: string
}

export type TypeFormAnswer = TypeFormChoiceAnswer | TypeFormTextAnswer

export interface TypeFormResponse {
    landing_id: string
    token: string
    response_id: string
    landed_at: string
    submitted_at: string
    metadata: {
        user_agent: string
        platform: string
        referer: string
        network_id: string
        browser: string
    }
    answers: TypeFormAnswer[]
    hidden: {
        browser: string
        device: string
        os: string
        source: string
        version: string
        gaid: string
    }
}

export interface TypeFormResponsesFilters {
    // Maximum number of responses.
    // Default value is 25. Maximum value is 1000.
    // If your typeform has fewer than 1000 responses,
    // you can retrieve all of the responses in a single request
    // by adding the page_size parameter.
    // If your typeform has more than 1000 responses,
    // use the since and until or after query parameters
    // to narrow the scope of your request.
    page_size?: number
    // Limit request to responses submitted since the specified
    // date and time. In ISO 8601 format, UTC time, to the second,
    // with T as a delimiter between the date and time.
    since?: string
    // Limit request to responses submitted until the specified
    // date and time. In ISO 8601 format, UTC time, to the second,
    // with T as a delimiter between the date and time.
    until?: string
    // Limit request to responses submitted after the specified token.
    // If you use the after parameter, the responses will be sorted
    // in the order that our system processed them (instead of
    // the default order, submitted_at). This ensures that you can
    // traverse the complete set of responses without repeating entries.
    after?: string
    // Limit request to responses submitted before the specified token.
    // If you use the before parameter, the responses will be sorted
    // in the order that our system processed them (instead of
    // the default order, submitted_at). This ensures that you can
    // traverse the complete set of responses without repeating entries.
    before?: string
    // true if form was submitted. Otherwise, false.
    completed?: boolean
    // Order of responses. Currently, responses are automatically sorted
    // by submitted_at,desc---the date they were submitted,
    // from newest to oldest. We plan to add more options for sort order soon.
    sort?: string
    // Limit request to only responses that that include the specified string.
    // You can specify any string as the query value.
    // The string will be escaped, and the query will include Hidden Fields.
    query?: string
    // Limit request to only responses for the specified fields.
    fields?: string[]
}

export type TypeFormResponsesDataHandler = (
    responses: TypeFormPaginatedResponse<TypeFormResponse>,
    iteration: number
) => Promise<void>

export class TypeFormClient {
    private endpoint: string
    private token: string

    constructor({ endpoint = 'https://api.typeform.com', token }: TypeFormConfig) {
        this.endpoint = endpoint
        this.token = token
    }

    private async callClient(url: string, options: RequestInit) {
        const mergedOptions: RequestInit = {
            ...options,
            headers: {
                authorization: `bearer ${this.token}`
            }
        }
        const res = await fetch(`${this.endpoint}${url}`, mergedOptions)

        if (res.status === 403) {
            throw new Error(
                [
                    `An error occurred while calling typeform (${res.status}: ${res.statusText}):`,
                    `> ${mergedOptions.method} ${this.endpoint}${url}`,
                    `please check your typeform configuration`
                ].join('\n')
            )
        }

        return res.json()
    }

    async listForms(): Promise<TypeFormPaginatedResponse<TypeFormMinimalForm>> {
        return this.callClient(`/forms`, {
            method: 'GET'
        })
    }

    async getForm(formId: string): Promise<TypeFormForm> {
        return this.callClient(`/forms/${formId}`, {
            method: 'GET'
        })
    }

    async listFormResponses(
        formId: string,
        filters: TypeFormResponsesFilters = {}
    ): Promise<TypeFormPaginatedResponse<TypeFormResponse>> {
        const query = qs.stringify(filters)
        return this.callClient(`/forms/${formId}/responses?${query}`, {
            method: 'Get'
        })
    }

    async listAllFormResponses(
        formId: string,
        onData: TypeFormResponsesDataHandler,
        filters: TypeFormResponsesFilters = {},
        iteration: number = 0
    ): Promise<void> {
        if (iteration === 0) {
            const initRes = await this.listFormResponses(formId, {
                ...filters,
                page_size: 1,
                sort: 'submitted_at,asc'
            })
            filters.after = initRes.items[0].token
        }
        const res = await this.listFormResponses(formId, filters)
        await onData(res, iteration)

        if (res.items.length === 0) return

        await this.listAllFormResponses(
            formId,
            onData,
            {
                ...filters,
                after: last(res.items)!.token
            },
            iteration + 1
        )
    }
}
