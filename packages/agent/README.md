# @slicemachine/agent

Headless CLI agent for syncing Prismic models and generating TypeScript types without the Slice Machine UI.

## Features

- Autonomous headless agent that syncs models from your Prismic repository
- Fetches custom type and slice models directly via the Custom Types API
- Generates TypeScript types using `prismic-ts-codegen`
- Works independently of Slice Machine UI (no `slicemachine.config.json` required)
- Supports all Prismic environments (production, staging, dev-tools, etc.)
- Designed for CI/CD pipelines and headless workflows

## Installation

```bash
npm install -g @slicemachine/agent
# or
yarn global add @slicemachine/agent
```

## Usage

### Prerequisites

Authenticate with Prismic:

```bash
npx prismic login
```

### Basic Usage

```bash
slicemachine-agent --repository my-repo
# or use the short alias
sm-agent --repository my-repo
```

### With Verbose Output

```bash
sm-agent -r my-repo -v
```

### Using Environment Variables

```bash
PRISMIC_REPOSITORY=my-repo sm-agent
```

### Using Different Prismic Environments

```bash
# Staging
sm-agent -r my-repo -e staging

# Dev Tools
SM_ENV=dev-tools sm-agent -r my-repo

# Marketing Tools
sm-agent -r my-repo -e marketing-tools
```

### In CI/CD Pipelines

```bash
# GitHub Actions, GitLab CI, etc.
- run: npx @slicemachine/agent -r ${{ secrets.PRISMIC_REPO }} -v
```

## Options

- `-r, --repository <name>` - Prismic repository name (required)
- `-e, --environment <env>` - Prismic environment (default: production)
  - Options: `production`, `staging`, `dev-tools`, `marketing-tools`, `platform`, `development`
- `-v, --verbose` - Show detailed output and sync progress
- `-h, --help` - Show help message

## Environment Variables

- `PRISMIC_REPOSITORY` - Alternative to `--repository` flag
- `SM_ENV` - Alternative to `--environment` flag

## Output

Types are always written to `prismicio-types.d.ts` in the current working directory. The generated types are well-formatted and ready to use.

## Authentication

This CLI uses the same authentication mechanism as other Prismic tools:

1. Run `npx prismic login` to authenticate
2. Your credentials are stored in `~/.prismic`
3. The CLI automatically reads these credentials

## How It Works

1. Reads authentication from `~/.prismic` file
2. Fetches all custom type models from the Prismic Custom Types API
3. Fetches all slice models from the Prismic Custom Types API
4. Generates TypeScript types using `prismic-ts-codegen`
5. Writes to `prismicio-types.d.ts`

## Local Development

```bash
# Install dependencies
yarn install

# Build
yarn build

# Test locally
cd /path/to/your/nextjs-project
node /path/to/slice-machine/packages/agent/bin/agent.js -r my-repo -v
```

## License

Apache-2.0

