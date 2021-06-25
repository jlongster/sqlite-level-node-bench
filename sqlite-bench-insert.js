let Benchmark = require('benchmark');

let { makeDatabase, deleteDatabase, loadAll } = require('./sqlite');

// This benchmark tests how long it takes to populate a database with
// a bunch of items.
//
// *** This not an accurate benchmark because it does I/O inside of it
// because the benchmark library isn't any good and won't allow us to
// properly teardown/delete the database after each run ***

function runBenchmark(num) {
  global.num = num;

  let b = new Benchmark({
    fn() {
      let db = makeDatabase(global.num);
      db.close();

      // Ideally we wouldn't be doing any create/delete IO in the
      // benchmark, but the benchmark lib isn't working - if we
      // move `deleteDatabase` to `teardown` we get errors
      deleteDatabase();
    }
  });

  b.on('complete', function() {
    console.log(`${(b.stats.mean * 1000) | 0},${num}`);
  });

  let res = b.run();
  if (res.error) {
    throw res.error;
  }
}

let low = 1000;
let high = 150000;
let step = ((high - low) / 10) | 0;

async function run() {
  console.log('ms,size');
  for (let i = 1000; i <= 150000; i += step) {
    await runBenchmark(i);
  }
}

run();
