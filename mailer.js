'use strict';

// 零依赖邮件发送模块：同时支持 Resend HTTP API（推荐用于 noreply@cquet.top）与 SMTPS 465（QQ/163/阿里云邮箱）
const tls = require('node:tls');

function getMailConfig() {
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  const smtpHost = (process.env.SMTP_HOST || '').trim();
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();
  const mailFrom = (process.env.MAIL_FROM || smtpUser || '重电校园站 <noreply@cquet.top>').trim();

  if (resendKey) {
    return { provider: 'resend', resendKey, mailFrom };
  }
  if (smtpHost && smtpUser && smtpPass) {
    return { provider: 'smtp', smtpHost, smtpPort, smtpUser, smtpPass, mailFrom };
  }
  return { provider: null };
}

function isMailerConfigured() {
  return Boolean(getMailConfig().provider);
}

function encodeBase64Header(text) {
  return `=?UTF-8?B?${Buffer.from(text, 'utf8').toString('base64')}?=`;
}

function extractEmailAddr(fromStr) {
  const m = fromStr.match(/<([^>]+)>/);
  return (m ? m[1] : fromStr).trim();
}

function formatFromHeader(fromStr) {
  const m = fromStr.match(/^(.+?)\s*<([^>]+)>$/);
  if (m) return `${encodeBase64Header(m[1].trim())} <${m[2].trim()}>`;
  return `<${fromStr.trim()}>`;
}

function sendViaSmtps({ smtpHost, smtpPort, smtpUser, smtpPass, mailFrom }, { to, subject, html, text }) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host: smtpHost, port: smtpPort, servername: smtpHost, rejectUnauthorized: true });
    socket.setTimeout(15000);
    let buffer = '';
    let waiting = null;

    function readResponse() {
      return new Promise((res, rej) => {
        waiting = { res, rej };
        flushBuffer();
      });
    }

    function flushBuffer() {
      if (!waiting) return;
      const lines = buffer.split(/\r?\n/);
      // Keep last incomplete fragment
      const tail = lines.pop();
      for (const line of lines) {
        if (/^\d{3} /.test(line)) {
          const code = Number(line.slice(0, 3));
          const cb = waiting;
          waiting = null;
          buffer = tail;
          return cb.res({ code, line });
        }
      }
      buffer = [...lines, tail].join('\r\n');
    }

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      flushBuffer();
    });
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('邮件服务器连接超时。'));
    });
    socket.on('error', (err) => {
      reject(new Error(`邮件服务器连接失败: ${err.message}`));
    });

    async function cmd(line, expectedCodes) {
      socket.write(`${line}\r\n`);
      const resp = await readResponse();
      if (!expectedCodes.includes(resp.code)) {
        throw new Error(`SMTP 错误 (${resp.code}): ${resp.line}`);
      }
      return resp;
    }

    socket.once('secureConnect', async () => {
      try {
        const greet = await readResponse();
        if (greet.code !== 220) throw new Error(`SMTP 握手失败: ${greet.line}`);
        await cmd('EHLO cquet.top', [250]);
        await cmd('AUTH LOGIN', [334]);
        await cmd(Buffer.from(smtpUser, 'utf8').toString('base64'), [334]);
        await cmd(Buffer.from(smtpPass, 'utf8').toString('base64'), [235]);
        await cmd(`MAIL FROM:<${extractEmailAddr(mailFrom)}>`, [250]);
        await cmd(`RCPT TO:<${to}>`, [250, 251]);
        await cmd('DATA', [354]);

        const bodyHtml = Buffer.from(html || text, 'utf8').toString('base64').replace(/(.{76})/g, '$1\r\n');
        const message = [
          `From: ${formatFromHeader(mailFrom)}`,
          `To: <${to}>`,
          `Subject: ${encodeBase64Header(subject)}`,
          `Date: ${new Date().toUTCString()}`,
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=UTF-8',
          'Content-Transfer-Encoding: base64',
          '',
          bodyHtml,
          '.',
        ].join('\r\n');

        await cmd(message, [250]);
        socket.write('QUIT\r\n');
        socket.end();
        resolve({ ok: true });
      } catch (err) {
        socket.destroy();
        reject(err);
      }
    });
  });
}

async function sendViaResend({ resendKey, mailFrom }, { to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: mailFrom, to: [to], subject, html }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Resend 发信失败 (${res.status})`);
  }
  return { ok: true, id: data.id };
}

async function sendVerificationEmail({ to, code, purpose }) {
  const cfg = getMailConfig();
  if (!cfg.provider) {
    throw new Error('邮件发信服务尚未配置，请联系站长在 .env 中配置 SMTP 或 Resend。');
  }
  const actionLabel = purpose === 'reset' ? '重置密码' : '新同学注册';
  const subject = `【重电校园站】${actionLabel}验证码：${code}`;
  const html = `
    <div style="font-family:system-ui,-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #eae5ee;border-radius:12px;color:#241f27;">
      <div style="font-size:18px;font-weight:700;color:#801c80;margin-bottom:12px;">重电校园站</div>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.6;">你好！你正在进行 <strong>${actionLabel}</strong>，本次邮箱验证码为：</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:6px;color:#6b166b;background:#f7eff7;border:1px solid #e4cde4;border-radius:8px;padding:12px 18px;text-align:center;margin:16px 0;">${code}</div>
      <p style="margin:0;font-size:12px;color:#625b68;line-height:1.6;">验证码 10 分钟内有效，请勿泄露给他人。如非本人操作，请忽略此邮件。</p>
    </div>`;

  if (cfg.provider === 'resend') {
    return sendViaResend(cfg, { to, subject, html });
  }
  return sendViaSmtps(cfg, { to, subject, html, text: `重电校园站${actionLabel}验证码：${code}（10分钟内有效）` });
}

module.exports = {
  isMailerConfigured,
  sendVerificationEmail,
};
