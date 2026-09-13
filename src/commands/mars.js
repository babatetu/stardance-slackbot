import { getMarsRoverPhotos } from '../services/nasaService.js';

/**
 * Handle /astro-mars slash command
 * Usage: /astro-mars [search terms or rover name, e.g. 'perseverance', 'curiosity', 'crater']
 */
export async function handleMarsCommand({ command, ack, respond }) {
  await ack();

  const userQuery = (command.text || '').trim();
  const searchQuery = userQuery ? `mars ${userQuery}` : 'mars rover perseverance surface';

  try {
    const data = await getMarsRoverPhotos({ query: searchQuery, count: 15 });

    if (!data.photos || data.photos.length === 0) {
      await respond({
        response_type: 'ephemeral',
        text: `🔴 *Mars Recon Alert:* No photos found for query *"${searchQuery}"*. Try searching \`/astro-mars perseverance\` or \`/astro-mars curiosity\`.`
      });
      return;
    }

    const randomPhoto = data.photos[Math.floor(Math.random() * data.photos.length)];
    const descTruncated = randomPhoto.description && randomPhoto.description.length > 300
      ? randomPhoto.description.substring(0, 297) + '...'
      : (randomPhoto.description || 'NASA Mars mission capture.');

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🔴 NASA Mars Recon: ${randomPhoto.title.substring(0, 90)}`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Date Created:* \`${randomPhoto.date_created}\` • *Center:* \`${randomPhoto.center || 'NASA JPL'}\`\n${descTruncated}`
        }
      },
      {
        type: 'image',
        image_url: randomPhoto.img_src,
        alt_text: randomPhoto.title,
        title: {
          type: 'plain_text',
          text: randomPhoto.title.substring(0, 100)
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `_NASA Asset ID: \`${randomPhoto.id}\` • Query: "${searchQuery}"_`
          }
        ]
      }
    ];

    await respond({
      response_type: 'in_channel',
      blocks
    });
  } catch (error) {
    console.error('Error in handleMarsCommand:', error);
    await respond({
      response_type: 'ephemeral',
      text: `⚠️ *Mars Recon Error:* ${error.message}`
    });
  }
}
