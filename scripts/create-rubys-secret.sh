#!/usr/bin/env bash
set -Eeuo pipefail

SECRET_ARN="arn:aws:secretsmanager:us-east-1:300272447770:secret:rubys/dev/application-LVuSyg"
ADMIN_EMAIL="admin@gmail.com"

read -rsp "Enter your RUBYS admin password: " ADMIN_PASSWORD
echo
read -rsp "Confirm your admin password: " ADMIN_PASSWORD_CONFIRM
echo

if [[ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" ]]; then
  echo "Passwords do not match."
  unset ADMIN_PASSWORD ADMIN_PASSWORD_CONFIRM
  exit 1
fi

if [[ ${#ADMIN_PASSWORD} -lt 12 ]]; then
  echo "Use an admin password of at least 12 characters."
  unset ADMIN_PASSWORD ADMIN_PASSWORD_CONFIRM
  exit 1
fi

export ADMIN_PASSWORD

POSTGRES_PASSWORD=$(openssl rand -hex 32)
AUTH_SECRET=$(openssl rand -hex 48)
CRON_SECRET=$(openssl rand -hex 32)

export POSTGRES_PASSWORD AUTH_SECRET CRON_SECRET ADMIN_EMAIL

ADMIN_PASSWORD_HASH=$(node -e '
const bcrypt = require("bcryptjs");
console.log(bcrypt.hashSync(process.env.ADMIN_PASSWORD, 12));
')

export ADMIN_PASSWORD_HASH

umask 077
SECRET_FILE=$(mktemp)

cleanup() {
  rm -f "$SECRET_FILE"
  unset ADMIN_PASSWORD ADMIN_PASSWORD_CONFIRM
  unset ADMIN_PASSWORD_HASH POSTGRES_PASSWORD AUTH_SECRET CRON_SECRET
}

trap cleanup EXIT

node -e '
const fs = require("fs");

const secret = {
  POSTGRES_DB: "rubys_db",
  POSTGRES_USER: "rubys_admin",
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  AUTH_SECRET: process.env.AUTH_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  CRON_SECRET: process.env.CRON_SECRET
};

fs.writeFileSync(process.argv[1], JSON.stringify(secret), {
  mode: 0o600
});
' "$SECRET_FILE"

echo "Uploading RUBYS credentials to AWS Secrets Manager..."

aws secretsmanager put-secret-value \
  --region us-east-1 \
  --secret-id "$SECRET_ARN" \
  --secret-string "file://$SECRET_FILE" \
  --query 'VersionId' \
  --output text

echo "RUBYS application secret uploaded successfully."
