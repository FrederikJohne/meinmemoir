const http = require('http');
const { dispatchPrompts, cleanupExpiredAudio } = require('./dispatch-prompts');

const WEEKLY_DISPATCH_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days
const DAILY_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

let lastDispatch = null;
let lastCleanup = null;

function scheduleWeeklyDispatch() {
  async function run() {
    try {
      console.log(`[${new Date().toISOString()}] Running weekly prompt dispatch...`);
      await dispatchPrompts();
      lastDispatch = new Date().toISOString();
    } catch (error) {
      console.error('Weekly dispatch failed:', error);
    }
  }

  // Check if it's Monday at 9am CET
  function scheduleNext() {
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
    nextMonday.setHours(9, 0, 0, 0);

    if (nextMonday <= now) {
      nextMonday.setDate(nextMonday.getDate() + 7);
    }

    const delay = nextMonday.getTime() - now.getTime();
    console.log(`Next dispatch scheduled for: ${nextMonday.toISOString()} (in ${Math.round(delay / 3600000)}h)`);

    setTimeout(() => {
      run();
      setInterval(run, WEEKLY_DISPATCH_INTERVAL);
    }, delay);
  }

  scheduleNext();
}

function scheduleDailyCleanup() {
  async function run() {
    try {
      console.log(`[${new Date().toISOString()}] Running daily audio cleanup...`);
      await cleanupExpiredAudio();
      lastCleanup = new Date().toISOString();
    } catch (error) {
      console.error('Daily cleanup failed:', error);
    }
  }

  // Run at 3am CET daily
  const now = new Date();
  const next3am = new Date(now);
  next3am.setHours(3, 0, 0, 0);
  if (next3am <= now) {
    next3am.setDate(next3am.getDate() + 1);
  }

  const delay = next3am.getTime() - now.getTime();
  console.log(`Next cleanup scheduled for: ${next3am.toISOString()}`);

  setTimeout(() => {
    run();
    setInterval(run, DAILY_CLEANUP_INTERVAL);
  }, delay);
}

// Health check server
const server = http.createServer((req, res) => {
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'scheduler',
      last_dispatch: lastDispatch,
      last_cleanup: lastCleanup,
    }));
  } else if (req.url === '/api/dispatch' && req.method === 'POST') {
    dispatchPrompts()
      .then(() => {
        lastDispatch = new Date().toISOString();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'dispatched' }));
      })
      .catch((error) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      });
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Scheduler health check running on port ${PORT}`);
});

scheduleWeeklyDispatch();
scheduleDailyCleanup();
console.log('Scheduler started.');
