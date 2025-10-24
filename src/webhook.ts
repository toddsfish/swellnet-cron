import path from 'path';
import * as dotenv from 'dotenv';
import Fastify from 'fastify';
import { scrapeSwellnetForecast } from './scraper';

// Load environment variables from .env file if it exists
// In Docker, env vars are passed via -e flags and this is not needed
const envPath = path.join(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

if (result.error && (result.error as NodeJS.ErrnoException).code !== 'ENOENT') {
  // Only log errors that aren't "file not found" (ENOENT)
  console.error('Error loading .env file:', result.error);
}

const server = Fastify({
  logger: true,
});

// POST endpoint to trigger the scraper
server.post('/webhook', async (_request, reply) => {
  try {
    console.log('Webhook triggered, starting scraper...');

    const forecast = await scrapeSwellnetForecast();

    console.log('\nRaw Forecast:');
    console.log('==================');
    console.log(forecast);
    console.log('==================\n');

    return await reply.code(200).send({
      success: true,
      message: 'Forecast scraped successfully',
      forecast: forecast,
    });
  } catch (error) {
    console.error('Scraper error:', error);

    return reply.code(500).send({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

// Health check endpoint
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start the server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    console.log(`Webhook server listening on http://${host}:${port}`);
    console.log(`Trigger scraper with: POST http://${host}:${port}/webhook`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

void start();
