let Benchmark = require('benchmark');

let { makeDatabase, deleteDatabase, loadAll } = require('./level');

// This benchmark tests how long it takes to query all items from the
// `kv` table

async function runBenchmark(num) {
  // We populate the database once for each db size and do all
  // benchmarks from it. There's no reason to re-populate it each time
  // the benchmark runs
  global.db = await makeDatabase(num);

  let b = new Benchmark('leveldb', {
    defer: true,

    fn(deferred) {
      loadAll(global.db).then(() => {
        deferred.resolve();
      });
    }
  });

  return new Promise((resolve, reject) => {
    b.on('complete', function() {
      console.log(`${(b.stats.mean * 1000) | 0},${num}`);

      global.db.close(() => {
        global.db = null;
        deleteDatabase().then(resolve);
      });
    });

    let res = b.run();
    if (res.error) {
      console.log(res.error);
      reject(res.error);
    }
  });
}

let low = 1000;
let high = 150000;
let step = ((high - low) / 10) | 0;

async function run() {
  deleteDatabase();

  console.log('ms,size');
  for (let i = 1000; i <= 150000; i += step) {
    await runBenchmark(i);
  }
}

run();
