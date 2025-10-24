FROM mcr.microsoft.com/playwright:v1.52.0-jammy

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy node_modules from local (avoids network issues)
COPY node_modules ./node_modules

# Copy built application
COPY lib ./lib

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose webhook port
EXPOSE 3000

# Start the webhook server
CMD ["node", "lib/webhook.js"]
