const fs = require('fs');
const colors = require('colors');
const math = require('math');
const mysql = require('mysql');

var data = require("./data.json");

let con = mysql.createConnection({
  host: '127.0.0.1',
  user: 'cyakat',
  password: 'QWOP}{+_)(*&^%$#@!',
  database: 'data',
  supportBigNumbers: true
});

con.connect(function (err) {
  if(err) {
    return console.log('error: ' + err.message);
  }

    console.log('Connected to the server');


});

//let keys = Object.keys(data.achievements);
//let ach = data.achievements;

for(let server of data.servers) {
  let combinedString;
  for(let string of server.strings) {
    if (combinedString === undefined){
      combinedString = string
    } else {
      combinedString = combinedString + ", " + string;
    }
  }
  con.query('UPDATE servers SET cooldown = ' + parseInt(server.cooldown) + ', strings = \'' + combinedString + '\' WHERE id = ' +  server.id, (err, response) => {
    console.log(err);
  });
}

/*con.query('SELECT id, MAX(words) AS topWords FROM users_with_servers;', (err, rows) => {
  console.log(rows);
  console.log(rows[0].topWords);
  console.log(rows[0].id);
});*/

//con.query('SELECT * FROM users WHERE words = ' + topWords + ';')

//SELECT id, words FROM users WHERE id = id

//SELECT id, SUM(words) FROM users WHERE id IS 249382933054357504;
/*for (let i of keys) {
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
  con.query('INSERT INTO achievements (user_id, roots, pp , changelog, inviteNow, joinServer, egg) VALUE (' + i + ', ' + roots + ', ' + pp + ', ' + changelog + ', ' + inviteNow + ', ' + joinServer + ', ' + egg + ');', (err, response) => {
    console.log(response);
  });
}*/

/*for (let i in data.servers) {
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

  /*"INSERT INTO users (id, server_id, name, cooldown, words) VALUE ('" + data.servers[i].users[o].id +
    "', '" + data.servers[i].id +
    "', '" + data.servers[i].users[o].username +
    "', '" + data.servers[i].users[o].cooldown +
    "', '" + data.servers[i].users[o].words + "');"*/


  /*for (let o in data.servers[i].users) {
    sql = 'INSERT INTO users (id, server_id, cooldown, words) VALUE (' + data.servers[i].users[o].id + ', ' + data.servers[i].id + ', ' + data.servers[i].users[o].cooldown + ', ' + data.servers[i].users[o].words +');'
    con.query(sql, (err, response) => {});
  }*//*
    con.query("INSERT INTO servers (id, prefix, words) VALUE (" + data.servers[i].id +", " + con.escape(prefix) + ", 0);", (err, response) => {

    console.log(err);

  });
}*/
/*con.query('SELECT * FROM servers', (err, rows) => {
  console.log(rows);
});*/


/*con.end((err) => {

  console.log('done');
});*/

function query(text) {
  con.query(text, (err, response) => {
    return response;
  });
}
