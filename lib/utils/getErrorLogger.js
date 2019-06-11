const winston = require('winston');

module.exports = () => winston.createLogger({
  level: 'info',
  format: winston.format.logstash(),
  defaultMeta: { service: 'user-service' },
  transports: [new winston.transports.File({ filename: 'error.log', level: 'error' })]
});
