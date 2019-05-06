export const createToObjectTransformer = (options?: any) => {
    return {
        transform: (data: any[]) => {
            return data.reduce((acc: any, item: any) => {
                return {
                    ...acc,
                    [item.id]: item
                }
            }, {})
        }
    }
}
