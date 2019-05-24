import fetch from 'node-fetch'

const restCountriesApiEndpoint = 'https://restcountries.eu/rest/v2/name/'

export interface GeoConfig {
    field: string
}

const cache: {
    [raw: string]: string
} = {}

const normalizeCountryName = async (country: string) => {
    let normalized = `[non-normalized] ${country}`
    if (cache[country] !== undefined) return cache[country]

    try {
        const rawResponse = await fetch(
            `${restCountriesApiEndpoint}${encodeURIComponent(country)}`,
            {
                method: 'GET'
            }
        )
        if (rawResponse.status !== 200) {
            console.warn(`No info available for country: ${country} (${rawResponse.status})`)
        } else {
            const response = await rawResponse.json()
            if (response.length === 0) {
                console.warn(`No info available for country: ${country} (no match)`)
            } else {
                normalized = response[0].name
            }
        }
    } catch (error) {
        console.error(`An error occurred while fetching info for country: ${country}`, error)
    }

    cache[country] = normalized

    return normalized
}

export const createGeoTransformer = (options: GeoConfig) => {
    return {
        transform: async (data: any) => {
            const countryResponse = data.find((item: any) => item.id === options.field)
            if (!countryResponse || countryResponse.value === undefined) return data

            countryResponse.rawValue = countryResponse.value
            countryResponse.value = await normalizeCountryName(countryResponse.value)

            return data
        }
    }
}
