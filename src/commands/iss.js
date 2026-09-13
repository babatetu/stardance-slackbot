import { getISSTelemetry } from '../services/nasaService.js';

/**
 * Handle /astro-iss slash command
 */
export async function handleIssCommand({ ack, respond }) {
  await ack();

  try {
    const iss = await getISSTelemetry();

    const astronautsByCraft = iss.astronauts.reduce((acc, curr) => {
      acc[curr.craft] = acc[curr.craft] || [];
      acc[curr.craft].push(curr.name);
      return acc;
    }, {});

    let crewMarkdown = '';
    for (const [craft, members] of Object.entries(astronautsByCraft)) {
      crewMarkdown += `*🚀 ${craft}:* ${members.join(', ')}\n`;
    }

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🛰️ International Space Station (ISS) Live Telemetry`,
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*🌐 Coordinates:*\n\`${iss.latitude.toFixed(4)}°, ${iss.longitude.toFixed(4)}°\``
          },
          {
            type: 'mrkdwn',
            text: `*⚡ Orbital Velocity:*\n\`~27,600 km/h (17,150 mph)\``
          },
          {
            type: 'mrkdwn',
            text: `*👨‍🚀 Humans in Space:*\n\`${iss.astronautsCount} astronauts\``
          },
          {
            type: 'mrkdwn',
            text: `*🛰️ Altitude:*\n\`~420 km (260 miles)\``
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Current Active Crew in Orbit:*\n${crewMarkdown}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🗺️ Open on Live Map',
              emoji: true
            },
            url: iss.mapUrl,
            style: 'primary'
          }
        ]
      }
    ];

    await respond({
      response_type: 'in_channel',
      blocks
    });
  } catch (error) {
    console.error('Error in handleIssCommand:', error);
    await respond({
      response_type: 'ephemeral',
      text: `⚠️ *ISS Telemetry Error:* ${error.message}`
    });
  }
}
