import pkg from '@slack/bolt';
const { App, LogLevel } = pkg;
import dotenv from 'dotenv';
dotenv.config();

import { handleApodCommand, handleRandomApodAction } from './commands/apod.js';
import { handleNeoCommand } from './commands/neo.js';
import { handleMarsCommand } from './commands/mars.js';
import { handleIssCommand } from './commands/iss.js';
import { handleQuizCommand, handleQuizAnswerAction } from './commands/quiz.js';
import { handleHelpCommand } from './commands/help.js';

const isSocketMode = Boolean(process.env.SLACK_APP_TOKEN);

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: isSocketMode,
  appToken: process.env.SLACK_APP_TOKEN,
  port: parseInt(process.env.PORT || '3000', 10),
  logLevel: LogLevel.INFO
});

// --- Register Slash Commands ---
app.command('/astro-apod', handleApodCommand);
app.command('/astro-neo', handleNeoCommand);
app.command('/astro-asteroids', handleNeoCommand);
app.command('/astro-mars', handleMarsCommand);
app.command('/astro-iss', handleIssCommand);
app.command('/astro-quiz', handleQuizCommand);
app.command('/astro-help', handleHelpCommand);

// --- Register Interactive Block Kit Actions ---
app.action('action_random_apod', handleRandomApodAction);
app.action('action_next_quiz', async ({ ack, respond }) => {
  await ack();
  await handleQuizCommand({ ack: async () => {}, respond });
});
app.action(/action_quiz_answer_.*/, handleQuizAnswerAction);

// --- App Mention / Welcome Event ---
app.event('app_mention', async ({ event, say }) => {
  await say({
    text: `🚀 Greetings <@${event.user}>! AstroBot is online and reporting for duty. Type \`/astro-help\` to explore all available NASA mission telemetry commands!`
  });
});

// --- Start App ---
(async () => {
  try {
    await app.start();
    console.log('⚡️ ========================================================');
    console.log(`🚀 AstroBot is running in ${isSocketMode ? 'SOCKET MODE' : 'HTTP MODE'}!`);
    console.log('🌌 Ready to process NASA Stardance mission commands.');
    console.log('⚡️ ========================================================');
  } catch (error) {
    console.error('❌ Failed to start AstroBot Slack App:', error);
    process.exit(1);
  }
})();
