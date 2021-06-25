let fs = require('fs');
let level = require('level');
let uuid = require('uuid');

async function deleteDatabase() {
  if (fs.existsSync('my-db')) {
    fs.rmdirSync('my-db', { recursive: true });
  }
}

async function makeDatabase(num) {
  let db = level('my-db');

  let batched = db.batch();
  for (let i = 0; i < num; i++) {
    batched = batched.put(uuid.v4(), ((Math.random() * 100000) | 0).toString());
  }
  await new Promise(resolve => {
    batched.write(resolve);
  });

  return db;
}

async function loadAll(db) {
  return new Promise(resolve => {
    let count = 0;

    let iter = db.iterator();
    let fn = (err, key, value) => {
      if (key !== undefined) {
        count++;
        iter.next(fn);
      } else {
        iter.end(() => {
          resolve();
        });
      }
    };

    iter.next(fn);
  });
}

module.exports = { deleteDatabase, makeDatabase, loadAll };
