#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const logger_1 = require("@ekino/logger");
const logger_2 = require("./lib/logger");
const commander_1 = __importDefault(require("commander"));
const logger_3 = require("@ekino/logger");
const setup_1 = require("./lib/commands/setup");
const stop_1 = require("./lib/commands/stop");
const process_1 = require("./lib/commands/process");
const aggregate_1 = require("./lib/commands/aggregate");
const config_1 = require("./lib/commands/config");
const elasticsearch_1 = require("./lib/commands/elasticsearch");
const typeform_1 = require("./lib/commands/typeform");
logger_1.setLevel('debug');
logger_1.setOutput(logger_2.output);
const logger = logger_3.createLogger('cli');
commander_1.default.version('0.1.0').description('data-tools CLI');
setup_1.setupCommand(commander_1.default, logger);
stop_1.stopCommand(commander_1.default, logger);
process_1.createProcessCommand(commander_1.default, logger);
aggregate_1.createAggregateCommand(commander_1.default, logger);
typeform_1.listFormsCommand(commander_1.default, logger);
typeform_1.getFormCommand(commander_1.default, logger);
typeform_1.getFormStatsCommand(commander_1.default, logger);
typeform_1.listResponsesCommand(commander_1.default, logger);
typeform_1.fetchAllResponsesCommand(commander_1.default, logger);
elasticsearch_1.listIndicesCommand(commander_1.default, logger);
elasticsearch_1.createIndicesCommand(commander_1.default, logger);
config_1.dumpConfigCommand(commander_1.default, logger);
commander_1.default.parse(process.argv);
if (process.argv.length < 3)
    commander_1.default.help();
