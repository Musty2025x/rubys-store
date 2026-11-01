# RUBYS --- Premium African Haircare Store

RUBYS is a premium organic African haircare e-commerce platform built
with Next.js, PostgreSQL, Docker, and AWS.

**Live website:** https://rubys.mustydevops.com.ng\
**Repository:** https://github.com/Musty2025x/rubys-store\
**AWS region:** `us-east-1`

## Table of contents

-   [Overview](#overview)
-   [Architecture](#architecture)
-   [Technology stack](#technology-stack)
-   [Application services](#application-services)
-   [CI/CD workflow](#cicd-workflow)
-   [Infrastructure and deployment](#infrastructure-and-deployment)
-   [Repository structure](#repository-structure)
-   [Local development](#local-development)
-   [Environment and secrets](#environment-and-secrets)
-   [Database operations](#database-operations)
-   [Operational commands](#operational-commands)
-   [Security](#security)
-   [Next steps](#next-steps)

------------------------------------------------------------------------

## Overview

RUBYS provides a digital storefront for premium organic African haircare
products. The current deployment runs as Docker containers on AWS EC2.

The project demonstrates:

-   A Next.js application packaged as a production Docker image.
-   PostgreSQL 17 and Prisma for persistent data and schema migrations.
-   Separate Docker images for the application, database migrator, and
    one-time product seeder.
-   Terraform-managed AWS infrastructure.
-   AWS Secrets Manager for runtime credentials.
-   GitHub Actions for validation, image publishing, and deployment.
-   GitHub OIDC for short-lived AWS role credentials.
-   AWS Systems Manager (SSM) Run Command for deployment without
    SSH-based file copying.
-   Caddy as the HTTPS reverse proxy.

## Architecture

### Runtime architecture

``` mermaid
flowchart TB
    Customer[Customer browser]
    DNS[DNS: rubys.mustydevops.com.ng]
    Caddy[Caddy reverse proxy<br/>HTTP 80 / HTTPS 443]
    App[Next.js application<br/>Docker container :3000]
    DB[(PostgreSQL 17<br/>Docker named volume)]
    Customer --> DNS --> Caddy
    Caddy --> App
    App --> DB
```

Caddy terminates HTTPS and reverse-proxies requests to Next.js over the
private Docker network. PostgreSQL is not published to the public
internet.

### CI/CD and infrastructure architecture

``` mermaid
flowchart TB
    Developer[Developer]
    GitHub[GitHub repository<br/>main branch]
    Actions[GitHub Actions]
    CI[npm ci<br/>Prisma generate<br/>Lint / typecheck / build]
    GHCR[GitHub Container Registry]
    OIDC[GitHub OIDC]
    IAM[AWS deployment IAM role]
    SSM[AWS Systems Manager<br/>Run Command]
    EC2[AWS EC2 instance]
    Secrets[AWS Secrets Manager]
    Compose[Docker Compose]
    Migrator[Prisma migrate deploy]
    App[Next.js app]
    Caddy[Caddy HTTPS proxy]
    DB[(PostgreSQL 17)]

    Developer --> GitHub --> Actions --> CI --> GHCR
    Actions --> OIDC --> IAM --> SSM --> EC2
    GHCR --> Compose
    SSM --> Compose
    Secrets --> EC2
    Compose --> Migrator --> DB
    Compose --> App
    Compose --> Caddy
    Caddy --> App
    App --> DB
```

Terraform provisions AWS resources and IAM permissions. EC2 bootstrap
installs Docker, Docker Compose, AWS CLI v2, and supporting packages;
retrieves runtime secrets from Secrets Manager; writes protected
environment files; installs the Compose and Caddy configuration; and
starts PostgreSQL.

GitHub Actions then updates the application containers through SSM.

## Technology stack

  -----------------------------------------------------------------------
  Area                    Technology              Responsibility
  ----------------------- ----------------------- -----------------------
  Application             Next.js, React,         Storefront and
                          TypeScript              application routes

  Styling                 Tailwind CSS            Responsive user
                                                  interface

  Runtime                 Node.js 22              Application runtime

  Database                PostgreSQL 17           Persistent application
                                                  data

  ORM and migrations      Prisma 7                Database client and
                                                  schema migrations

  Containers              Docker, Docker Compose  Build and run services

  Edge / HTTPS            Caddy 2                 TLS certificates and
                                                  reverse proxy

  Cloud                   AWS EC2                 Application host

  Infrastructure as Code  Terraform               EC2, networking, IAM,
                                                  Elastic IP, and secret
                                                  resource

  Runtime secrets         AWS Secrets Manager     Application and
                                                  database credentials

  Deployment control      AWS Systems Manager     Runs deployment
                                                  commands on EC2

  CI/CD                   GitHub Actions          Validation, image
                                                  publishing, and
                                                  deployment

  Image registry          GitHub Container        Stores application,
                          Registry                migrator, and seeder
                                                  images

  CI identity             GitHub OIDC             Short-lived AWS role
                                                  assumption
  -----------------------------------------------------------------------

## Application services

The EC2 Compose stack defines these services:

  ---------------------------------------------------------------------------------------------
  Service                 Image / role                                Purpose
  ----------------------- ------------------------------------------- -------------------------
  `app`                   `ghcr.io/musty2025x/rubys-store`            Next.js application on
                                                                      internal port 3000

  `postgres`              `postgres:17-alpine`                        Database stored in a
                                                                      named Docker volume

  `migrator`              `ghcr.io/musty2025x/rubys-store-migrator`   Runs
                                                                      `prisma migrate deploy`
                                                                      as a one-off task

  `seeder`                `ghcr.io/musty2025x/rubys-store-seeder`     Populates initial
                                                                      catalogue data when
                                                                      explicitly run

  `caddy`                 `caddy:2-alpine`                            Publishes ports 80 and
                                                                      443 and proxies to
                                                                      `app:3000`
  ---------------------------------------------------------------------------------------------

Only Caddy publishes web ports to the host. PostgreSQL port `5432` is
not exposed publicly.

## CI/CD workflow

The workflow is defined in `.github/workflows/ci-cd.yml`.

### Pull requests

Pull requests targeting `main` run the CI/build validation path. The
workflow installs dependencies, generates the Prisma client, runs
configured static checks, and builds the application.

### Pushes to `main`

A push to `main` runs the build and deployment pipeline:

1.  Check out the repository and install dependencies with `npm ci`.
2.  Generate the Prisma client.
3.  Run lint and TypeScript checks.
4.  Build the Next.js application.
5.  Build and publish the application, migrator, and seeder images to
    GHCR.
6.  Tag application and migrator images with the commit SHA and
    `latest`.
7.  Assume the AWS deployment role through GitHub OIDC.
8.  Send an AWS Systems Manager command to the EC2 instance.
9.  Pull the matching application and migrator images.
10. Run Prisma migrations with `prisma migrate deploy`.
11. Start/update the application and Caddy containers.
12. Check the HTTPS endpoint and report deployment success or failure.

The application and migrator use the commit SHA as the release tag,
making each deployment traceable to its source commit.

### Deployment flow

``` text
Git push to main
      |
      v
GitHub Actions CI
      |
      +--> npm ci
      +--> Prisma generate
      +--> lint and typecheck
      +--> Next.js build
      |
      v
Build Docker images
      |
      v
Publish images to GHCR
      |
      v
GitHub OIDC assumes AWS deploy role
      |
      v
SSM Run Command on EC2
      |
      v
Pull app + migrator images
      |
      v
Run prisma migrate deploy
      |
      v
docker compose up -d app caddy
      |
      v
HTTPS health check
```

### Container images

``` text
ghcr.io/musty2025x/rubys-store:latest
ghcr.io/musty2025x/rubys-store-migrator:latest
ghcr.io/musty2025x/rubys-store-seeder:latest
```

For a specific deployment, the application and migrator use the commit
SHA tag supplied by the workflow. The seeder is a separate one-time
operational image and is not run on every application deployment.

## Infrastructure and deployment

### AWS resources

The current deployment uses:

-   AWS region `us-east-1`.
-   Ubuntu 24.04 EC2 instance (`t3.small`).
-   20 GB encrypted gp3 root volume.
-   Elastic IP and DNS record for `rubys.mustydevops.com.ng`.
-   Security group allowing web traffic on ports 80 and 443.
-   SSH restricted to the configured administrator CIDR; deployment uses
    SSM.
-   EC2 instance profile with SSM permissions and access to the RUBYS
    application secret.
-   GitHub OIDC provider and a deployment IAM role scoped for SSM
    deployment.
-   AWS Secrets Manager secret named `rubys/dev/application`.

Terraform configuration is under `terraform/environments/dev/`.

### EC2 bootstrap

Terraform renders `terraform/environments/dev/user-data.sh` with the AWS
region, secret ARN, domain, Compose configuration, and Caddy
configuration.

The bootstrap process:

1.  Installs Docker, Docker Compose v2, AWS CLI v2, `jq`, `curl`, and
    supporting packages.
2.  Creates `/home/ubuntu/rubys-deployment`.
3.  Writes `docker-compose.ec2.yml` and `Caddyfile`.
4.  Retrieves the secret from AWS Secrets Manager using the EC2 instance
    role.
5.  Creates `.env.ec2.db` and `.env.ec2.app` with restrictive file
    permissions.
6.  Validates the Compose configuration.
7.  Starts PostgreSQL and waits for its health check.

Secret values are not stored in the repository or embedded in the
bootstrap script.

### Deployment access

GitHub Actions does not require a long-lived SSH private key for
deployment. It uses OIDC to assume the AWS deployment role, then SSM Run
Command to execute release steps on EC2.

This separates provisioning (Terraform), runtime configuration
(bootstrap and Secrets Manager), and application release (GitHub
Actions, GHCR, and SSM).

## Repository structure

Key project paths:

``` text
rubys-store/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── prisma/
│   ├── migrations/
│   └── seed.ts
├── scripts/
│   └── create-rubys-secret.sh
├── src/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── generated/
│   └── lib/
├── terraform/
│   └── environments/
│       └── dev/
│           ├── github-oidc.tf
│           ├── iam.tf
│           ├── main.tf
│           ├── networking.tf
│           ├── outputs.tf
│           ├── providers.tf
│           ├── secrets.tf
│           ├── security.tf
│           ├── variables.tf
│           ├── user-data.sh
│           └── templates/
│               ├── Caddyfile
│               └── docker-compose.ec2.yml
├── Dockerfile
├── docker-compose.ec2.yml
├── prisma.config.ts
├── package.json
└── README.md
```

This is a representative structure. Keep it synchronized with the actual
repository as files are added or renamed.

## Local development

### Prerequisites

-   Node.js 22
-   npm
-   Docker and Docker Compose v2
-   Git
-   Local PostgreSQL or a Docker-based development database

### Install dependencies

``` bash
npm ci
```

### Configure local environment

Create a local environment file using `.env.example` as a reference.
Supply local-only database connection strings and required application
configuration.

Do not copy production secrets from AWS Secrets Manager into the
repository or commit local `.env` files.

### Generate Prisma client

``` bash
npx prisma generate
```

### Run the development server

``` bash
npm run dev
```

Open `http://localhost:3000`.

### Validate the application

``` bash
npm run lint
npx tsc --noEmit
npm run build
```

Use the scripts actually defined in `package.json`; update this section
if script names change.

## Environment and secrets

Production credentials are stored in AWS Secrets Manager under:

``` text
rubys/dev/application
```

The secret supplies these runtime configuration fields:

-   `POSTGRES_DB`
-   `POSTGRES_USER`
-   `POSTGRES_PASSWORD`
-   `AUTH_SECRET`
-   `ADMIN_EMAIL`
-   `ADMIN_PASSWORD_HASH`
-   `CRON_SECRET`

The bootstrap creates separate database and application environment
files on EC2. These files are not source-controlled.

### GitHub Actions configuration

The deployment workflow expects this GitHub Actions secret:

  -----------------------------------------------------------------------
  Name                                Purpose
  ----------------------------------- -----------------------------------
  `AWS_DEPLOY_ROLE_ARN`               ARN of the AWS IAM role assumed
                                      through GitHub OIDC

  -----------------------------------------------------------------------

The repository's OIDC trust policy must match the intended GitHub
repository and branch. Do not store AWS access keys or application
passwords in the workflow file.

Never put secret values in this README.

## Database operations

### Migrations

Production schema changes are applied by the migrator image during
deployment:

``` bash
prisma migrate deploy
```

Create and review migrations in development, commit migration files
under `prisma/migrations/`, and deploy them through the pipeline.

Do not use `prisma migrate dev`, `prisma db push`, or
`prisma migrate reset` against the production EC2 database.

### Initial product seeding

The seeder is a one-off operation. It has populated the initial four
catalogue products on the EC2 database and is not part of every
application deployment.

For a fresh environment, first verify the target database and confirm
that records do not already exist. Then run:

``` bash
cd /home/ubuntu/rubys-deployment
sudo docker compose -f docker-compose.ec2.yml --profile seed run --rm seeder
```

Do not rerun the seed command against a populated production database
unless the seed script has been reviewed and is safe to run repeatedly.

### Persistence and backups

PostgreSQL data is stored in the Docker named volume
`rubys_postgres_data`. Do not remove this volume during routine
deployments.

The EC2-local Docker volume is not a substitute for an off-instance
backup strategy. Configure automated database backups and test
restoration. Replacing or destroying the EC2 instance can result in loss
of data stored only on its local volume.

## Operational commands

Run these commands through an authorized SSM session or SSM Run Command.
The deployment directory on EC2 is `/home/ubuntu/rubys-deployment`.

### Check containers

``` bash
cd /home/ubuntu/rubys-deployment
sudo docker compose -f docker-compose.ec2.yml ps
```

### View application logs

``` bash
sudo docker logs rubys-app --tail 100
```

### View PostgreSQL logs

``` bash
sudo docker logs rubys-postgres --tail 100
```

### View Caddy logs

``` bash
sudo docker logs rubys-caddy --tail 100
```

### Check the live HTTPS endpoint

``` bash
curl -I https://rubys.mustydevops.com.ng
```

The homepage has been verified to return HTTP `200`.

### Inspect disk usage

``` bash
df -h
sudo docker system df
```

Do not run broad Docker prune commands or remove named volumes without
understanding their impact on running services and persistent database
data.

## Security

-   Keep `.env`, `.env.local`, `.env.production.local`, `.env.docker`,
    Terraform state, private keys, and generated credentials out of Git.
-   Use AWS Secrets Manager for runtime secrets.
-   Use the EC2 instance role to retrieve secrets; do not embed AWS
    access keys in user data.
-   Use GitHub OIDC and short-lived role credentials for CI/CD.
-   Keep PostgreSQL private on the Docker network; do not open port 5432
    to the internet.
-   Restrict SSH ingress to a trusted administrator IP range. Use SSM
    for deployment operations.
-   Keep the EC2 root volume encrypted.
-   Review Terraform plans before applying infrastructure changes.
-   Never run destructive Terraform or Docker volume commands against
    the live environment without a verified backup and recovery plan.
-   Redact secrets from logs, screenshots, and support output.

## Next steps

The storefront is live, and the initial product catalogue has been
seeded. A successful homepage response confirms that the web entry point
is serving the application; it does not prove every customer or
administrator workflow is correct.

Recommended next steps:

1.  Test admin authentication and access control.
2.  Test product listing, product detail pages, cart behavior, and order
    creation.
3.  Verify Paystack configuration and complete a controlled test-mode
    payment.
4.  Verify international card and shipping flows before enabling live
    transactions.
5.  Configure automated PostgreSQL backups and perform a restore test.
6.  Add application-level monitoring, alerting, and resource/disk
    monitoring.
7.  Add automated integration tests for checkout and order processing.
8.  Document a tested recovery procedure for EC2 replacement and
    database restoration.

------------------------------------------------------------------------

## Project links

-   **Live storefront:** https://rubys.mustydevops.com.ng
-   **GitHub repository:** https://github.com/Musty2025x/rubys-store
-   **AWS region:** `us-east-1`
-   **Container registry:** https://github.com/Musty2025x?tab=packages

> Keep this README aligned with the actual workflow, Terraform
> resources, Compose configuration, and application scripts. Update the
> documentation whenever the deployment architecture changes.
