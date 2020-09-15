const fs = require('fs');
const colors = require('colors');
const math = require('math');
const mysql = require('mysql');

var data = require("./data.json");

let con = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'bUt3GhDTruTO8xWeVO48yV13GUO&$^Pgx86wyuUhM',
  database: 'data'
});

con.connect(function (err) {
  if(err) {
    return console.log('error: ' + err.message);
  }

    console.log('Connected to the server');


});

let keys = Object.keys(data.achievements);
let ach = data.achievements;



for (let i of keys) {
  let roots = 0;
  let pp = 0;
  let changelog = 0;
  let inviteNow = 0;
  let joinServer = 0;
  let egg = 0;

  if (ach[i].roots != undefined) {
    roots = 1;
  }
  else if (ach[i].pp != undefined) {
    pp = 1;
  }
  else if (ach[i].changelog != undefined) {
    changelog = 1;
  }
  else if (ach[i].invitenow != undefined) {
    inviteNow = 1;
  }
  else if (ach[i].joinServer != undefined) {
    joinServer = 1;
  }
  else if(ach[i].egg != undefined) {
    egg = 1;
  }
  con.query('INSERT INTO achievements (user_id, roots, pp , changelog, inviteNow, joinServer, egg) VALUE (\'' + i + '\', \'' + roots + '\', \'' + pp + '\', \'' + changelog + '\', \'' + inviteNow + '\', \'' + joinServer + '\', \'' + egg + '\');', (err, response) => {
    console.log(response);
  });
}

for (let i in data.servers) {
  //con.query('ALTER TABLE t' + data.servers[i].id + ' ADD users '});
  //console.log(data.servers[i].id);
  //console.log(i);
  let prefix;
  if (data.servers[i].prefix === undefined) {
    prefix = 'n!';
  }
  else {
    prefix = data.servers[i].prefix;
  }
  /*for (let o in data.servers[i].users) {
    con.query('INSERT INTO users (id, server_id, name, cooldown, words) VALUE (\'' + data.servers[i].users[o].id +
      '\', \'' + data.servers[i].id +
      '\', \'' + data.servers[i].users[o].username +
      '\', ' + data.servers[i].users[o].cooldown +
      ', ' + data.servers[i].users[o].words + ');', (err, response) => {
      console.log(err);
    });
  }*/
    /*con.query('INSERT INTO servers (id, prefix, words, name) VALUE (' + data.servers[i].id +', \'' + prefix + '\', 0, \'' + data.servers[i].name + '\');', (err, response) => {

    console.log(response);

  });*/
}
/*con.query('SELECT * FROM servers', (err, rows) => {
  console.log(rows);
});*/

con.end((err) => {

});
