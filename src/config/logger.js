const winston = require('winston');
require("winston-daily-rotate-file");
require('dotenv').config();

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

module.exports = {
    errorLog : winston.createLogger({
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
        format: winston.format.combine(
            enumerateErrorFormat(),
            winston.format.timestamp(),
            winston.format.splat(),
            winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
        ),
        transports: [
            new winston.transports.Console({
                stderrLevels: ['error'],
            }),
            new winston.transports.DailyRotateFile({
                filename: "./src/logs/error-%DATE%.log",
                datePattern: "YYYY-MM-DD",
                level: 'error',
                zippedArchive: true,
                handleExceptions: true,
                maxSize: "20m",
            })
            
        ],
    }),

    infoLog : winston.createLogger({
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) =>  `${timestamp} ${level}: ${message}`)
        ),
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({
                filename: './src/logs/info.log', 
                level: 'info'
            })
        ],
    })
}



