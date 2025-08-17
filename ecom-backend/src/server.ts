import 'dotenv/config';
import app from './app.js';
import db from './config/db.js';

const PORT = Number(process.env.PORT || 4000);

(async () => {
  try {
    await db.raw('select 1+1 as result');
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
})();
