# Swellnet Cron

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with Swellnet credentials:
   ```bash
   SWELLNET_USERNAME="your_username"
   SWELLNET_PASSWORD="your_password"
   PORT="3000"
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Run CLI (one-time scrape)

```bash
node lib/index.js
```

### Run Webhook Server

```bash
npm run webhook
```

Then trigger the scraper via webhook:
```bash
curl -X POST http://localhost:3000/webhook
```

## Docker

### Build Docker Image

```bash
npm run build
docker build -t swellnet-webhook .
```

### Run Docker Container

```bash
# Source environment variables
set -a && source .env && set +a

# Run container
docker run -d \
  -p 3000:3000 \
  -e SWELLNET_USERNAME=$SWELLNET_USERNAME \
  -e SWELLNET_PASSWORD=$SWELLNET_PASSWORD \
  -e PORT=$PORT \
  --name swellnet-webhook \
  swellnet-webhook
```

### Docker Commands

```bash
# View logs
docker logs -f swellnet-webhook

# Test webhook
curl -X POST http://localhost:3000/webhook

# Stop container
docker stop swellnet-webhook

# Remove container
docker rm swellnet-webhook

# Restart after code changes
npm run build
docker rm -f swellnet-webhook
docker build -t swellnet-webhook .
docker run -d -p 3000:3000 \
  -e SWELLNET_USERNAME=$SWELLNET_USERNAME \
  -e SWELLNET_PASSWORD=$SWELLNET_PASSWORD \
  -e PORT=$PORT \
  --name swellnet-webhook \
  swellnet-webhook
```

## Development

This project uses TypeScript and projen for project management.

1. Edit files in the `src` directory
2. Build: `npm run build`
3. Run: `npm run webhook` or `node lib/index.js`
