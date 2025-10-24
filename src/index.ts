import { scrapeSwellnetForecast } from './scraper';

async function main() {
  try {
    const forecast = await scrapeSwellnetForecast();

    console.log('\nRaw Forecast:');
    console.log('==================');
    console.log(forecast);
    console.log('==================\n');

    process.exit(0);
  } catch (error) {
    console.error('Script failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
export class Hello {
  public sayHello() {
    return 'hello, world!';
  }
}
