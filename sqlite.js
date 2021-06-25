let fs = require('fs');
let Database = require('better-sqlite3');
let uuid = require('uuid');

function deleteDatabase() {
  if (fs.existsSync('db.sqlite')) {
    fs.unlinkSync('db.sqlite');
  }
}

function makeDatabase(num) {
  let db = new Database('db.sqlite');
  db.exec('CREATE TABLE kv (key TEXT, value TEXT)');

  let stmt = db.prepare('INSERT INTO kv (key, value) VALUES (?, ?)');
  db.transaction(() => {
    for (let i = 0; i < num; i++) {
      stmt.run([uuid.v4(), ((Math.random() * 100000) | 0).toString()]);
    }
  })();

  return db;
}

function loadAll(db) {
  let count = 0;

  let stmt = db.prepare('SELECT * FROM kv');
  let iter = stmt.iterate();
  while (true) {
    let value = iter.next();
    if (value.done) {
      break;
    }
    count++;
  }
}

module.exports = { deleteDatabase, makeDatabase, loadAll };
