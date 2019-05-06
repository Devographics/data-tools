import * as path from 'path'
import { mkdir, writeFile } from '../fs'

export const createFileLoader = ({
    surveyId,
    baseDir = 'data-tools',
    rowsPerFile = 1000
}: {
    surveyId: string
    baseDir?: string
    rowsPerFile?: number
}) => {
    const surveyDir = path.join(path.resolve(process.cwd()), `.${baseDir}`, `survey__${surveyId}`)

    let index = 0
    let buffer: any[] = []

    const write = async () => {
        const chunk = buffer.splice(0, rowsPerFile)
        const content = JSON.stringify(chunk)
        await writeFile(path.join(surveyDir, `${`${index}`.padStart(8, '0')}.json`), content)

        index++
        if (buffer.length >= rowsPerFile) await write()
    }

    return {
        init: async () => {
            await mkdir(surveyDir, { recursive: true })
        },
        load: async (data: any[]) => {
            buffer = buffer.concat(data)
            if (buffer.length >= rowsPerFile) await write()
        },
        end: async () => {
            if (buffer.length >= 0) await write()
        }
    }
}
