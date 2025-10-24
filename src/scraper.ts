import path from 'path';
import { launchPlaywright } from 'crawlee';
import * as dotenv from 'dotenv';
import { BrowserContext } from 'playwright';

// Load environment variables from .env file if it exists
// In Docker, env vars are passed via -e flags and this is not needed
const envPath = path.join(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

if (result.error && result.error.code !== 'ENOENT') {
  // Only log errors that aren't "file not found" (ENOENT)
  console.error('Error loading .env file:', result.error);
}

/**
 * Format the raw content as markdown
 * @param content The raw content text
 * @returns Formatted markdown string
 */
function formatContentAsMarkdown(content: string): string {
  // Split content into lines for processing
  const lines = content.split('\n').map((line) => line.trim());

  let formattedContent = '';
  let inList = false;

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (!line) {
      formattedContent += '\n';
      continue;
    }

    // Check if this is a title line (first non-empty line)
    if (i === 0 || (i > 0 && !lines.slice(0, i).some((l) => l.trim()))) {
      formattedContent += `# ${line}\n`;
      continue;
    }

    // Check for author/date line
    if (line.startsWith('by ') || line.includes('(issued ')) {
      formattedContent += `*${line}*\n\n`;
      continue;
    }

    // Check for section headers
    if (line.endsWith(':') && line === line.toUpperCase()) {
      formattedContent += `\n## ${line}\n`;
      continue;
    }

    // Check for bullet points
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      if (!inList) {
        formattedContent += '\n';
        inList = true;
      }
      formattedContent += `${line}\n`;
      continue;
    } else if (inList) {
      inList = false;
      formattedContent += '\n';
    }

    // Regular paragraph
    formattedContent += `${line}\n\n`;
  }

  return formattedContent;
}

async function isLoggedIn(context: BrowserContext): Promise<boolean> {
  const cookies = await context.cookies();
  return cookies.some((cookie) => cookie.name.startsWith('SESS'));
}

/**
 * Scrapes the latest surf forecast from Swellnet and returns it as formatted markdown
 * @returns Promise that resolves to the formatted forecast content
 */
export async function scrapeSwellnetForecast(): Promise<string> {
  // Verify credentials are loaded
  const username = process.env.SWELLNET_USERNAME;
  const password = process.env.SWELLNET_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing SWELLNET_USERNAME or SWELLNET_PASSWORD in .env file');
  }

  const browser = await launchPlaywright({
    launchOptions: {
      headless: true,
    },
  });

  try {
    const contexts = browser.contexts();
    const context = contexts[0];
    const page = await context.newPage();

    console.log('Opening login page');
    await page.goto('https://www.swellnet.com/user/login?destination=/');

    // Wait for the login form elements
    await page.waitForSelector('#edit-name');
    await page.waitForSelector('#edit-pass');

    console.log('Filling login form...');

    // Fill in the username/email field
    await page.fill('#edit-name', username);

    // Fill in the password field
    await page.fill('#edit-pass', password);

    // Click the login button
    await page.click('#edit-submit');

    // Wait a moment for the cookies to be set
    await page.waitForTimeout(2000);

    // Check for successful login using SESS cookie
    if (await isLoggedIn(context)) {
      console.log('Successfully logged in - SESS cookie found');

      // Navigate to the forecaster notes page
      console.log('Navigating to forecaster notes...');
      await page.goto(
        'https://www.swellnet.com/reports/australia/new-south-wales/tweed-coast/forecaster-notes',
      );

      // Wait for the content to load
      await page.waitForSelector('.views-row-1');

      // Find and click the first post link
      const firstPostLink = await page.locator('.views-row-1 a').first();
      console.log('Clicking first post...');
      await firstPostLink.click();

      // Wait for the post page to load
      await page.waitForSelector('.node-forecaster-notes', {
        state: 'attached',
        timeout: 30000,
      });

      console.log('Post loaded successfully');

      // Get current URL to verify we're on the correct page
      const currentUrl = page.url();
      console.log('Current page URL:', currentUrl);

      // Wait for the content element to be available
      await page.waitForSelector(
        '.field.field-name-body.field-type-text-with-summary.field-label-hidden',
      );

      // Extract the content - use first() to handle multiple matching elements
      const content = await page
        .locator(
          '.field.field-name-body.field-type-text-with-summary.field-label-hidden',
        )
        .first()
        .textContent();

      // Close browser
      await browser.close();

      // Format the content in markdown and return
      if (content) {
        const formattedContent = formatContentAsMarkdown(content.trim());
        return formattedContent;
      } else {
        throw new Error('No content found');
      }
    } else {
      await browser.close();
      throw new Error('Login failed - No SESS cookie found');
    }
  } catch (error) {
    await browser.close();
    throw error;
  }
}
