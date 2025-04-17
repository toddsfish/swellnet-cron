# Swellnet Cron

A Node.js application that scrapes surf forecasts from Swellnet.com and formats them as markdown.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Compile Typescript to js (lib/index.js)
   npm run build

3. Create a `.env` file in the lib folder with Swellnet credentials:
   ```
   SWELLNET_USERNAME=your_username
   SWELLNET_PASSWORD=your_password
   ```

4. Install Playwright browsers:
   ```
   npx playwright install
   ```

## Usage

Run the script to fetch the latest forecast:

```
node lib/index.js
```

The script will:
1. Log in to Swellnet using your credentials
2. Navigate to the forecaster notes page
3. Open the latest forecast
4. Extract and format the content as markdown
5. Display the formatted forecast in the console

## Development

This project uses TypeScript. To make changes:

1. Edit files in the `src` directory
2. Compile TypeScript:
   ```
   npm run build
   ```
3. Run the compiled code:
   ```
   node lib/index.js
   ```
