export const createToObjectTransformer = () => {
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
