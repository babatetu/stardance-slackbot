import { getNearEarthObjects } from '../services/nasaService.js';

/**
 * Handle /astro-neo or /astro-asteroids slash command
 */
export async function handleNeoCommand({ command, ack, respond }) {
  await ack();

  try {
    const data = await getNearEarthObjects();
    const today = new Date().toISOString().split('T')[0];

    const hazardousCount = data.objects.filter(o => o.is_potentially_hazardous).length;
    const topObjects = data.objects.slice(0, 5);

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `☄️ NASA Asteroid Radar: Near-Earth Approachers (${today})`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Total detected passing today:* \`${data.element_count}\` objects\n*Potentially Hazardous:* ${
            hazardousCount > 0 ? `🚨 *${hazardousCount} flagged*` : '🛡️ None detected today!'
          }`
        }
      },
      {
        type: 'divider'
      }
    ];

    topObjects.forEach(obj => {
      const hazardBadge = obj.is_potentially_hazardous ? '🚨 *HAZARDOUS*' : '🟢 Safe pass';
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<${obj.nasa_jpl_url}|${obj.name}>*  •  ${hazardBadge}\n• *Diameter:* ${obj.estimated_diameter_min_m}m - ${obj.estimated_diameter_max_m}m\n• *Miss Distance:* ${obj.miss_distance_lunar} Lunar Distances (${obj.miss_distance_km} km)\n• *Speed:* ${obj.velocity_kph} km/h`
        }
      });
    });

    if (data.objects.length > 5) {
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `_Showing 5 of ${data.objects.length} asteroids. Data provided in real-time by NASA JPL / NeoWs API._`
          }
        ]
      });
    }

    await respond({
      response_type: 'in_channel',
      blocks
    });
  } catch (error) {
    console.error('Error in handleNeoCommand:', error);
    await respond({
      response_type: 'ephemeral',
      text: `⚠️ *Asteroid Radar Error:* ${error.message}`
    });
  }
}
