#!/bin/bash

set -euxo pipefail

# Log all bootstrap activity
exec > >(tee -a /var/log/rubys-bootstrap.log) 2>&1

echo "Starting RUBYS EC2 bootstrap..."

# Update Ubuntu packages
apt-get update -y

# Install Docker and Docker Compose
apt-get install -y \
  docker.io \
  docker-compose-v2 \
  curl \
  git \
  unzip \
  ca-certificates

# Enable Docker at startup
systemctl enable docker
systemctl start docker

# Allow Ubuntu user to execute Docker commands
usermod -aG docker ubuntu

# Verify installations
docker --version
docker compose version

echo "RUBYS EC2 bootstrap completed successfully."
