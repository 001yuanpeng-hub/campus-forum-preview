# 重电校园站 · 阿里云轻量应用服务器部署指南

本项目后端基于 **Node.js 24 内置 `node:sqlite`**，零第三方依赖、内存占用极低（约 35–50MB），一台 **2核2G 轻量应用服务器**即可稳定承载全校日常访问。

---

## 一、选购服务器（使用 300 元学生专属代金券）

1. 进入阿里云 **轻量应用服务器** 购买页（注意选择常规配置，避免与特价秒杀活动互斥导致无法勾选学生代金券）。
2. 推荐配置：
   - **地域**：西南（成都）或华东（重庆访问成都延迟最低）
   - **镜像**：系统镜像 → **Ubuntu 24.04**（或 Debian 12）
   - **规格**：**2核2G**（足够流畅运行）
   - **购买时长**：建议 **3 个月或 6 个月**（若后续计划绑定域名申请个人 ICP 备案，阿里云要求服务器包年包月时长 ≥ 3 个月）
3. **付款前务必确认**：结算页已勾选 **300元学生专属代金券** 且抵扣正常（退款不退券）。

---

## 二、放行防火墙端口

购买完成后进入轻量应用服务器控制台 → **防火墙**：
- 确认已放行 **80（HTTP）** 和 **443（HTTPS）** 端口（通常 80 默认已放行）。

---

## 三、一键部署上线

点击服务器控制台里的 **远程连接（Workbench）** 登录终端，执行：

```bash
git clone https://github.com/001yuanpeng-hub/campus-forum-preview.git /opt/cqetc-forum
cd /opt/cqetc-forum
sudo bash deploy/setup.sh
```

> 如果国内拉取 GitHub 较慢，可先设置加速镜像或在本地打包上传后执行 `sudo bash deploy/setup.sh`。

脚本会自动完成：
1. 安装 Nginx 并通过国内 `npmmirror` 镜像极速安装 Node.js 24；
2. 自动生成随机强密码的管理员配置 `/opt/cqetc-forum/.env`（终端会打印初始账号和密码，请立即保存）；
3. 配置 `systemd` 后台常驻守护（崩溃/服务器重启自动拉起）；
4. 配置 Nginx 反向代理到 `80` 端口；
5. 配置每天凌晨 `03:30` 自动对 SQLite 做在线热备份到 `/opt/cqetc-backups/`（默认保留最近 14 天）。

部署完成后，在浏览器打开 **`http://你的公网IP/`** 即可访问！

---

## 四、后续日常维护命令

```bash
# 查看运行状态与日志
sudo systemctl status cqetc-forum
sudo journalctl -u cqetc-forum -n 50 --no-pager

# 更新到 GitHub 最新代码并重启
cd /opt/cqetc-forum && sudo git pull && sudo systemctl restart cqetc-forum

# 手动立即执行一次数据库备份
sudo node /opt/cqetc-forum/deploy/backup.js
```

---

## 五、后续绑定域名与开启免费 HTTPS（备案通过后）

当域名完成 ICP 备案并将 A 记录解析到服务器公网 IP 后：

1. 将 `/etc/nginx/sites-available/cqetc-forum` 中的 `server_name _;` 改为 `server_name 你的域名;`；
2. 安装免费 Let's Encrypt 证书并自动续期：
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d 你的域名
   ```
3. 编辑 `/opt/cqetc-forum/.env`，将 `COOKIE_SECURE=0` 改为 `COOKIE_SECURE=1`，然后重启服务：
   ```bash
   sudo systemctl restart cqetc-forum
   ```
