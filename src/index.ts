import path from 'path';
import { launchPlaywright } from 'crawlee';
import * as dotenv from 'dotenv';
import { BrowserContext } from 'playwright';

// Fix for __dirname in ES modules
const envPath = path.join(__dirname, '.env');

// Add debug logging for env file loading
console.log('Attempting to load .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
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

async function main() {
  // Debug: Print all environment variables (be careful with sensitive data)
  console.log('Available environment variables:', {
    username: process.env.SWELLNET_USERNAME ? 'SET' : 'NOT SET',
    password: process.env.SWELLNET_PASSWORD ? 'SET' : 'NOT SET',
  });

  // Verify credentials are loaded
  const username = process.env.SWELLNET_USERNAME;
  const password = process.env.SWELLNET_PASSWORD;

  if (!username || !password) {
    console.error('Missing credentials in .env file');
    console.log('Current directory:', __dirname);
    console.log('Attempted to load from:', envPath);
    return;
  }

  const browser = await launchPlaywright({
    launchOptions: {
      headless: false,
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
      await page.waitForLoadState('networkidle');
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

      // Format the content in markdown and display directly to console
      if (content) {
        const formattedContent = formatContentAsMarkdown(content.trim());
        console.log('\nFormatted Forecast:');
        console.log('==================');
        console.log(formattedContent);
        console.log('==================\n');
      } else {
        console.log('No content found');
      }

      // Close browser and exit
      await browser.close();
      process.exit(0);
    } else {
      console.error('Login failed - No SESS cookie found');
      await browser.close();
      process.exit(1);
    }
  } catch (error) {
    console.error('Script failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    await browser.close();
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
