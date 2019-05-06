export const createCleanupTransformer = (options: { exclude: string[] }) => {
    return {
        transform: (data: any) => {
            return data
        }
    }
}
