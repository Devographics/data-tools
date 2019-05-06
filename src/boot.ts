#!/usr/bin/env node

import dotenv from 'dotenv'
dotenv.config()

import { setLevel, setOutput } from '@ekino/logger'
import { output } from './lib/logger'
import program from 'commander'
import { createLogger } from '@ekino/logger'
import { setupCommand } from './lib/commands/setup'
import { stopCommand } from './lib/commands/stop'
import { createProcessCommand } from './lib/commands/process'
import { createAggregateCommand } from './lib/commands/aggregate'
import { dumpConfigCommand } from './lib/commands/config'
import { listIndicesCommand, createIndicesCommand } from './lib/commands/elasticsearch'
import {
    listFormsCommand,
    getFormCommand,
    getFormStatsCommand,
    listResponsesCommand,
    fetchAllResponsesCommand
} from './lib/commands/typeform'

setLevel('debug')
setOutput(output)
const logger = createLogger('cli')

program.version('0.1.0').description('data-tools CLI')
setupCommand(program, logger)
stopCommand(program, logger)
createProcessCommand(program, logger)
createAggregateCommand(program, logger)
listFormsCommand(program, logger)
getFormCommand(program, logger)
getFormStatsCommand(program, logger)
listResponsesCommand(program, logger)
fetchAllResponsesCommand(program, logger)
listIndicesCommand(program, logger)
createIndicesCommand(program, logger)
dumpConfigCommand(program, logger)

program.parse(process.argv)
if (process.argv.length < 3) program.help()
