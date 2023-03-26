const express = require('express');
const path = require('path');
const hbs = require('hbs');
const logger = require('./logger.js');
const db = require('./database.js');
const cache = require('./cacheManager.js');

hbs.registerPartials(__dirname + '/views/partials', function(err) { });

const server = express();

// Response Codes
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const OK = 200;
const SERVER_ERROR = 500;

// Statuses
const OFFLINE = "OFFLINE";
const ONLINE = "ONLINE";

const authToken = process.env.AUTH_TOKEN;

server.use(express.json());
server.set('view engine', 'hbs');

server.get('/', (req, res) => {
  res.render('index');
});

server.all("/GoLive.png", (req, res) => {
  res.sendFile("./GoLive.png", {
    root: path.join(__dirname)
  });
});

server.get('/live', async (req, res) => {
  let keys = await db.list("Live");
  const channels = { online: [], offline: [] };
  for (let key in keys) {
    let status = await db.get(keys[key]);
    let name = await cache.name(keys[key].substr(5));
    if (status == ONLINE) {
      channels.online.push(name);
    }
    else {
      channels.offline.push(name);
    }
  }
  res.set("Cache-Control", "no-cache");
  res.render('live', { channels });
});

server.put('/status/:uid', async (req, res) => {
  if (req.get('X-auth-token') !== authToken) {
    res.status(UNAUTHORIZED).send({});
    return;
  }
  const uid = req.params.uid;
  const status = req.body.status;
  const name = req.body.name;
  if (!(uid > 0)) {
    res.status(BAD_REQUEST).send({ error: "Invalid uid" });
    return;
  }
  if (!name.match(/[a-z_0-9]{4,25}/i)) {
    res.status(BAD_REQUEST).send({ error: "Invalid Channel name" });
    return;
  }
  if (status !== ONLINE && status !== OFFLINE) {
    res.status(BAD_REQUEST).send({ error: "Invalid Status" });
    return;
  }
  try {
    await cache.update(uid, name);
    await db.set(`Live:${uid}`, status);
    res.status(OK).send();
  }
  catch (error) {
    res.status(SERVER_ERROR).send({ error });
  }
});

server.delete('/status/:uid', async (req, res) => {
  if (req.get('X-auth-token') !== authToken) {
    res.status(UNAUTHORIZED).send();
    return;
  }
  const uid = req.params.uid;
  if (!(uid > 0)) {
    res.status(BAD_REQUEST).send({ error: "Invalid uid" });
    return;
  }
  try {
    await cache.remove(uid);
    await db.delete(`Live:${uid}`);
    res.status(OK).send();
  }
  catch (error) {
    res.status(SERVER_ERROR).send({ error });
  }
});

function keepAlive() {
  server.listen(3000, () => { logger.log("Server is Ready!") });
}

module.exports = keepAlive;