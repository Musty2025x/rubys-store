#!/bin/bash

set -euo pipefail

exec > >(tee -a /var/log/rubys-bootstrap.log) 2>&1

echo "Starting RUBYS automated EC2 bootstrap..."

AWS_DEFAULT_REGION="${aws_region}"
SECRET_ARN="${secret_arn}"
DOMAIN="${domain}"

export AWS_DEFAULT_REGION

# Install required system packages
apt-get update -y

apt-get install -y \
  docker.io \
  docker-compose-v2 \
  jq \
  curl \
  git \
  unzip \
  ca-certificates

# Install AWS CLI v2 using the official AWS installer
echo "Installing AWS CLI v2..."

curl -fsSL \
  "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" \
  -o /tmp/awscliv2.zip

unzip -q /tmp/awscliv2.zip -d /tmp

/tmp/aws/install --update

rm -rf /tmp/aws /tmp/awscliv2.zip

aws --version

systemctl enable docker
systemctl start docker

usermod -aG docker ubuntu

# Create deployment directories
DEPLOY_DIR="/home/ubuntu/rubys-deployment"

mkdir -p "$DEPLOY_DIR/caddy-data"
mkdir -p "$DEPLOY_DIR/caddy-config"

# Install Docker Compose configuration
cat > "$DEPLOY_DIR/docker-compose.ec2.yml" <<'RUBYS_COMPOSE_EOF'
${compose_file}
RUBYS_COMPOSE_EOF

# Install Caddy configuration
cat > "$DEPLOY_DIR/Caddyfile" <<'RUBYS_CADDY_EOF'
${caddy_file}
RUBYS_CADDY_EOF

# Retrieve application secrets from AWS Secrets Manager
echo "Retrieving RUBYS application secrets..."

SECRET_JSON=""

for attempt in $(seq 1 12); do
  if SECRET_JSON=$(aws secretsmanager get-secret-value \
    --region "$AWS_DEFAULT_REGION" \
    --secret-id "$SECRET_ARN" \
    --query SecretString \
    --output text 2>/dev/null); then
    break
  fi

  echo "Secrets Manager attempt $attempt failed; retrying..."
  sleep 10
done

if [ -z "$SECRET_JSON" ]; then
  echo "Unable to retrieve RUBYS secrets."
  exit 1
fi

# Validate required secret fields
echo "$SECRET_JSON" | jq -e '
  .POSTGRES_DB and
  .POSTGRES_USER and
  .POSTGRES_PASSWORD and
  .AUTH_SECRET and
  .ADMIN_EMAIL and
  .ADMIN_PASSWORD_HASH and
  .CRON_SECRET
' >/dev/null

POSTGRES_DB=$(echo "$SECRET_JSON" | jq -r '.POSTGRES_DB')
POSTGRES_USER=$(echo "$SECRET_JSON" | jq -r '.POSTGRES_USER')
POSTGRES_PASSWORD=$(echo "$SECRET_JSON" | jq -r '.POSTGRES_PASSWORD')
AUTH_SECRET=$(echo "$SECRET_JSON" | jq -r '.AUTH_SECRET')
ADMIN_EMAIL=$(echo "$SECRET_JSON" | jq -r '.ADMIN_EMAIL')
ADMIN_PASSWORD_HASH=$(echo "$SECRET_JSON" | jq -r '.ADMIN_PASSWORD_HASH')
CRON_SECRET=$(echo "$SECRET_JSON" | jq -r '.CRON_SECRET')

unset SECRET_JSON

# Create PostgreSQL environment file
umask 077

{
  printf 'POSTGRES_DB=%s\n' "$POSTGRES_DB"
  printf 'POSTGRES_USER=%s\n' "$POSTGRES_USER"
  printf 'POSTGRES_PASSWORD=%s\n' "$POSTGRES_PASSWORD"
} > "$DEPLOY_DIR/.env.ec2.db"

# Create application environment file
DATABASE_URL="postgresql://$${POSTGRES_USER}:$${POSTGRES_PASSWORD}@postgres:5432/$${POSTGRES_DB}?schema=public"

{
  printf 'NEXT_PUBLIC_SITE_URL=https://%s\n' "$DOMAIN"
  printf 'APP_DATABASE_URL=%s\n' "$DATABASE_URL"
  printf 'DIRECT_URL=%s\n' "$DATABASE_URL"
  printf 'AUTH_SECRET=%s\n' "$AUTH_SECRET"
  printf 'AUTH_TRUST_HOST=true\n'
  printf 'ADMIN_EMAIL=%s\n' "$ADMIN_EMAIL"
  printf "ADMIN_PASSWORD_HASH='%s'\n" "$ADMIN_PASSWORD_HASH"
  printf 'CRON_SECRET=%s\n' "$CRON_SECRET"
} > "$DEPLOY_DIR/.env.ec2.app"

# Restrict access to deployment files
chown -R ubuntu:ubuntu "$DEPLOY_DIR"
chmod 600 "$DEPLOY_DIR/.env.ec2.db"
chmod 600 "$DEPLOY_DIR/.env.ec2.app"
chmod 644 "$DEPLOY_DIR/docker-compose.ec2.yml"
chmod 644 "$DEPLOY_DIR/Caddyfile"

# Validate Compose configuration
cd "$DEPLOY_DIR"
docker compose -f docker-compose.ec2.yml config --quiet

# Start the fresh PostgreSQL database
docker compose -f docker-compose.ec2.yml up -d postgres

echo "Waiting for PostgreSQL to become healthy..."

for attempt in $(seq 1 30); do
  DB_STATUS=$(docker inspect \
    --format '{{.State.Health.Status}}' rubys-postgres 2>/dev/null || true)

  if [ "$DB_STATUS" = "healthy" ]; then
    echo "PostgreSQL is healthy."
    break
  fi

  if [ "$attempt" -eq 30 ]; then
    echo "PostgreSQL did not become healthy."
    docker logs --tail 100 rubys-postgres
    exit 1
  fi

  sleep 5
done

echo "RUBYS EC2 bootstrap completed successfully."
