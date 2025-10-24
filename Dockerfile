FROM mcr.microsoft.com/playwright:v1.52.0-jammy

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy built application
COPY lib ./lib

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose webhook port
EXPOSE 3000

# Start the webhook server
CMD ["node", "lib/webhook.js"]
