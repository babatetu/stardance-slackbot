/**
 * Handle /astro-help slash command
 */
export async function handleHelpCommand({ ack, respond }) {
  await ack();

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🚀 AstroBot: NASA Mission Control Operations`,
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Welcome to *AstroBot* — your real-time aerospace and NASA exploration companion built for Hack Club's **Stardance Challenge**! Here are the available slash commands:`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🌌 *\`/astro-apod [YYYY-MM-DD | random]\`*\nFetches NASA's official Astronomy Picture of the Day with high-resolution space photography and scientific breakdown.`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `☄️ *\`/astro-neo\`*\nScans NASA's JPL Asteroid Radar for Near-Earth Objects passing by Earth today, including size, velocity, and hazard status.`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🔴 *\`/astro-mars [curiosity|perseverance] [sol]\`*\nExplores high-resolution surface photos captured on Mars by active rovers.`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🛰️ *\`/astro-iss\`*\nReal-time telemetry of the International Space Station, orbital velocity, current overflown coordinates, and active astronauts in orbit.`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🧠 *\`/astro-quiz\`*\nChallenges the channel to an interactive space science trivia quiz with live scoring!`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `_Built with ❤️ for Hack Club Stardance • Powered by NASA Open APIs_`
        }
      ]
    }
  ];

  await respond({
    response_type: 'ephemeral',
    blocks
  });
}
