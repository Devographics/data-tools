import { isEmpty } from 'lodash'
import prettyOutput from 'prettyoutput'
import colors from 'colors/safe'
import { Log, LogLevel } from '@ekino/logger'

const levelColorMap: { [level in LogLevel]: string } = {
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    debug: 'white',
    trace: 'grey'
}

type Colorizer = (txt: string) => string

export const output = (log: Log) => {
    const colorize: Colorizer = (colors as any)[levelColorMap[log.level] || 'red'] as Colorizer
    const data = isEmpty(log.data) ? '' : `\n${prettyOutput(log.data, { maxDepth: 6 }, 2)}`
    const result = `${colorize(`${log.message}`)}${data}`
    const output = log.level === 'error' ? 'stderr' : 'stdout'

    process[output].write(`${result}\n`)
}
