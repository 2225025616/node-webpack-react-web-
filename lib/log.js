const log4js = require('log4js');
const log4jsExtend = require("log4js-extend");
const config = require("../config");


log4js.configure({
    replaceConsole: true,
    appenders: {
        stdout: {
            type: 'stdout',
        },
        allLevel: {
            type: 'dateFile', filename: './logs/all/', pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true
        },
        info: {
            type: 'dateFile', filename: './logs/info/', pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true
        },
        debug: {
            type: 'dateFile', filename: './logs/debug/', pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true
        },
        error: {
            type: 'dateFile', filename: './logs/error/', pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true
        },
        just_info: {
            type: 'logLevelFilter', appender: 'info', level: 'info', maxLevel: 'info'
        },
        just_debug: {
            type: 'logLevelFilter', appender: 'debug', level: 'debug', maxLevel: 'debug'
        },
        just_error: {
            type: 'logLevelFilter', appender: 'error', level: 'error', maxLevel: 'error'
        },
    },
    categories: {
        // debug: {appenders: ['stdout', 'allLevel'], level: 'debug'},//appenders:采用的appender,取appenders项,level:设置级别
        default: {appenders: ['stdout', 'allLevel', 'just_info', 'just_debug', 'just_error'], level: 'info'},
    }
});

log4jsExtend(log4js, {
    path: __dirname + "/../",
    format: "(@file:@line:@column)"
});

const log = log4js.getLogger();
log.level = config.logLevel;

module.exports = log;
