export const createGeoTransformer = (options: { fields: string[] }) => {
    return {
        transform: (data: any) => {
            return data
        }
    }
}
