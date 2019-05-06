import * as fs from 'fs'
import { promisify } from 'util'

export const writeFile = promisify(fs.writeFile)
export const mkdir = promisify(fs.mkdir)
