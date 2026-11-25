'use strict';

// 每日 SQLite 热备份脚本（通过 VACUUM INTO 生成一致性快照，不影响在线读写）
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const APP_DIR = path.resolve(__dirname, '..');
const DB_PATH = path.join(APP_DIR, 'data', 'campus.db');
const BACKUP_DIR = process.env.BACKUP_DIR || '/opt/cqetc-backups';
const KEEP_DAYS = Number(process.env.BACKUP_KEEP_DAYS) || 14;

if (!fs.existsSync(DB_PATH)) {
  console.log('[backup] 数据库文件尚不存在，跳过备份:', DB_PATH);
  process.exit(0);
}

fs.mkdirSync(BACKUP_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
const target = path.join(BACKUP_DIR, `campus-${stamp}.db`);

const db = new DatabaseSync(DB_PATH, { readOnly: true });
db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
db.close();

// 清理超过保留天数的旧备份
const cutoff = Date.now() - KEEP_DAYS * 24 * 3600 * 1000;
for (const name of fs.readdirSync(BACKUP_DIR)) {
  if (!name.startsWith('campus-') || !name.endsWith('.db')) continue;
  const full = path.join(BACKUP_DIR, name);
  const stat = fs.statSync(full);
  if (stat.mtimeMs < cutoff) fs.unlinkSync(full);
}

console.log('[backup] 备份完成:', target);
