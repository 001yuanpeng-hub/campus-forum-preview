#!/usr/bin/env bash
set -euo pipefail

# 重电校园站 · 阿里云 Ubuntu/Debian 一键部署脚本
# 用法：
#   sudo bash deploy/setup.sh
# 可选环境变量：
#   ADMIN_PASSWORD=你的强密码 sudo -E bash deploy/setup.sh

APP_DIR="/opt/cqetc-forum"
REPO_URL="https://github.com/001yuanpeng-hub/campus-forum-preview.git"
NODE_VERSION="24.12.0"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "请使用 root 或 sudo 运行此脚本：sudo bash deploy/setup.sh"
  exit 1
fi

echo "==> 1/6 安装基础工具（nginx / curl / git / xz-utils）"
apt-get update -y
apt-get install -y nginx curl git xz-utils ca-certificates

echo "==> 2/6 检查并安装 Node.js v${NODE_VERSION}（使用国内 npmmirror 镜像加速）"
NEED_NODE=1
if command -v node >/dev/null 2>&1; then
  CUR_MAJOR="$(node -v | sed 's/^v//' | cut -d. -f1)"
  if [[ "${CUR_MAJOR}" -ge 22 ]]; then
    NEED_NODE=0
    echo "    已存在 Node.js $(node -v)，跳过下载"
  fi
fi

if [[ "${NEED_NODE}" -eq 1 ]]; then
  ARCH="$(uname -m)"
  case "${ARCH}" in
    x86_64) NODE_ARCH="x64" ;;
    aarch64|arm64) NODE_ARCH="arm64" ;;
    *) echo "不支持的 CPU 架构: ${ARCH}"; exit 1 ;;
  esac
  TARBALL="node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz"
  TMP_TAR="/tmp/${TARBALL}"
  curl -fL "https://npmmirror.com/mirrors/node/v${NODE_VERSION}/${TARBALL}" -o "${TMP_TAR}" \
    || curl -fL "https://nodejs.org/dist/v${NODE_VERSION}/${TARBALL}" -o "${TMP_TAR}"
  tar -xJf "${TMP_TAR}" -C /usr/local --strip-components=1
  rm -f "${TMP_TAR}"
  echo "    Node.js 安装完成: $(node -v)"
fi

echo "==> 3/6 同步项目代码到 ${APP_DIR}"
if [[ -d "${APP_DIR}/.git" ]]; then
  git -C "${APP_DIR}" pull --ff-only
elif [[ -f "./server.js" && "$(pwd)" != "${APP_DIR}" ]]; then
  mkdir -p "${APP_DIR}"
  cp -a . "${APP_DIR}/"
elif [[ ! -d "${APP_DIR}" ]]; then
  git clone "${REPO_URL}" "${APP_DIR}"
fi

mkdir -p "${APP_DIR}/data" "${APP_DIR}/uploads" /opt/cqetc-backups

echo "==> 4/6 生成环境变量 ${APP_DIR}/.env（若已存在则保留）"
if [[ ! -f "${APP_DIR}/.env" ]]; then
  GEN_PASS="${ADMIN_PASSWORD:-$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 14)}"
  cat > "${APP_DIR}/.env" <<EOF
HOST=127.0.0.1
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=${GEN_PASS}
ADMIN_NICKNAME=校园站
COOKIE_SECURE=0
EOF
  chmod 600 "${APP_DIR}/.env"
  echo "    已生成初始管理员账号：admin"
  echo "    已生成初始管理员密码：${GEN_PASS}（请妥善保存！）"
else
  echo "    检测到已有 .env，保持原配置不变"
fi

echo "==> 5/6 配置 systemd 守护进程与每日自动备份"
NODE_BIN="$(command -v node)"
sed "s|/usr/local/bin/node|${NODE_BIN}|g" "${APP_DIR}/deploy/cqetc-forum.service" > /etc/systemd/system/cqetc-forum.service
systemctl daemon-reload
systemctl enable --now cqetc-forum
systemctl restart cqetc-forum

cat > /etc/cron.d/cqetc-forum-backup <<EOF
30 3 * * * root ${NODE_BIN} ${APP_DIR}/deploy/backup.js >> /var/log/cqetc-backup.log 2>&1
EOF
chmod 644 /etc/cron.d/cqetc-forum-backup

echo "==> 6/6 配置 Nginx 反向代理"
cp "${APP_DIR}/deploy/nginx.conf" /etc/nginx/sites-available/cqetc-forum
ln -sf /etc/nginx/sites-available/cqetc-forum /etc/nginx/sites-enabled/cqetc-forum
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --now nginx
systemctl reload nginx

echo ""
echo "======================================================"
echo " 重电校园站部署完成！"
echo " 1. 服务状态：systemctl status cqetc-forum"
echo " 2. 请确保阿里云轻量应用服务器防火墙已放行 80（HTTP）和 443（HTTPS）端口"
echo " 3. 浏览器访问：http://你的服务器公网IP/"
echo "======================================================"
