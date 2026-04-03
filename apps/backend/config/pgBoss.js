import { PgBoss } from 'pg-boss';
import dotenv from 'dotenv';

dotenv.config();

const boss = new PgBoss({
  connectionString: process.env.DATABASE_URL,
  retryLimit: 2,
  retryDelay: 60,
  retryBackoff: true,
  expireInHours: 2,
  deleteAfterDays: 7,
});

export default boss;
