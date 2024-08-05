const logger = require('@ericw9079/logger');
const server = require("./server.js");

server.listen(3000, () => { logger.log("Server is Ready!") });