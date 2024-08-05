const express = require('express');
const path = require('path');
const hbs = require('hbs');
const db = require('@ericw9079/database');

db.connect('server', 'server', 'golive', 'goliveDb');

hbs.registerPartials(path.join(__dirname, '/views/partials'), function(err) { });

const server = express();

server.disable('x-powered-by');
server.set('view engine', 'hbs');

server.get('/', (req, res) => {
  res.render('index');
});

server.all("/GoLive.png", (req, res) => {
  res.sendFile("./GoLive.png", {
    root: path.join(__dirname),
  });
});

server.get('/live', async (req, res) => {
  const { rows } = await db.query('SELECT username, online, game FROM View_Live;');
  const channels = { online: [], offline: [] };
  rows.forEach((row) => {
    if (row.online) {
      channels.online.push({
		  name: row.username,
		  game: row.game,
	  });
    }
    else {
      channels.offline.push({
		  name: row.username,
	  });
    }
  });
  res.set("Cache-Control", "no-cache");
  res.render('live', { channels });
});

module.exports = server;