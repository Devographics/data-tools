import { ExtractorConfig } from './index'
import { TypeFormClient } from './typeform_client'

export class TypeformExtractor {
    private config: ExtractorConfig
    private client: TypeFormClient

    constructor(config: ExtractorConfig, client: TypeFormClient) {
        this.config = config
        this.client = client
    }

    async getForm() {
        return this.client.getForm(this.config.surveyId)
    }
}
