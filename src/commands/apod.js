import { getAPOD } from '../services/nasaService.js';

/**
 * Handle /astro-apod slash command
 */
export async function handleApodCommand({ command, ack, respond, client }) {
  // Acknowledge the command within 3 seconds
  await ack();

  const text = (command.text || '').trim().toLowerCase();
  const isRandom = text.includes('random');
  const dateMatch = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
  const requestedDate = dateMatch ? dateMatch[0] : undefined;

  try {
    const apod = await getAPOD({ date: requestedDate, random: isRandom });

    const explanationTruncated = apod.explanation.length > 500
      ? apod.explanation.substring(0, 497) + '...'
      : apod.explanation;

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🌌 NASA Astronomy Picture of the Day`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${apod.title}*  •  \`${apod.date}\`\n${apod.copyright ? `*Copyright:* ${apod.copyright}\n` : ''}${explanationTruncated}`
        }
      }
    ];

    if (apod.media_type === 'image') {
      blocks.push({
        type: 'image',
        image_url: apod.url,
        alt_text: apod.title,
        title: {
          type: 'plain_text',
          text: apod.title.substring(0, 100)
        }
      });
    } else if (apod.media_type === 'video') {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📹 *Video Link:* <${apod.url}|Watch on YouTube / External Source>`
        }
      });
    }

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🎲 Another Random APOD',
            emoji: true
          },
          action_id: 'action_random_apod',
          style: 'primary'
        },
        ...(apod.hdurl ? [{
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🔍 Full HD Image',
            emoji: true
          },
          url: apod.hdurl
        }] : [])
      ]
    });

    await respond({
      response_type: 'in_channel',
      blocks
    });
  } catch (error) {
    console.error('Error in handleApodCommand:', error);
    await respond({
      response_type: 'ephemeral',
      text: `⚠️ *Mission Control Alert:* Could not retrieve APOD (${error.message}). Try again later or check your API key.`
    });
  }
}

/**
 * Handle interactive button click for random APOD
 */
export async function handleRandomApodAction({ ack, respond }) {
  await ack();
  try {
    const apod = await getAPOD({ random: true });
    const explanationTruncated = apod.explanation.length > 500
      ? apod.explanation.substring(0, 497) + '...'
      : apod.explanation;

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🎲 Random NASA APOD: ${apod.title}`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Date:* \`${apod.date}\`\n${apod.copyright ? `*Copyright:* ${apod.copyright}\n` : ''}${explanationTruncated}`
        }
      }
    ];

    if (apod.media_type === 'image') {
      blocks.push({
        type: 'image',
        image_url: apod.url,
        alt_text: apod.title
      });
    } else {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📹 *Video Link:* <${apod.url}|Watch Video>`
        }
      });
    }

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🎲 Fetch Another',
            emoji: true
          },
          action_id: 'action_random_apod',
          style: 'primary'
        }
      ]
    });

    await respond({
      response_type: 'in_channel',
      blocks
    });
  } catch (err) {
    await respond({
      response_type: 'ephemeral',
      text: `⚠️ Could not fetch random APOD: ${err.message}`
    });
  }
}
