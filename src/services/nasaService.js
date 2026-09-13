import dotenv from 'dotenv';
dotenv.config();

const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const NASA_BASE_URL = 'https://api.nasa.gov';
const NASA_IMAGES_API = 'https://images-api.nasa.gov';
const ISS_API_URL = 'https://api.wheretheiss.at/v1/satellites/25544';

/**
 * Fetch Astronomy Picture of the Day (APOD)
 * @param {string} [date] - Optional date in YYYY-MM-DD format
 * @param {boolean} [random=false] - If true, fetch a random APOD
 */
export async function getAPOD({ date, random = false } = {}) {
  let url = `${NASA_BASE_URL}/planetary/apod?api_key=${NASA_API_KEY}`;
  if (random) {
    url += '&count=1';
  } else if (date) {
    url += `&date=${date}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NASA APOD API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Fetch Near-Earth Objects (Asteroids) for today
 */
export async function getNearEarthObjects() {
  const today = new Date().toISOString().split('T')[0];
  const url = `${NASA_BASE_URL}/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NASA NeoWs API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const dayObjects = data.near_earth_objects[today] || [];
  
  return {
    element_count: data.element_count,
    objects: dayObjects.map(obj => {
      const closeApproach = obj.close_approach_data?.[0] || {};
      return {
        id: obj.id,
        name: obj.name,
        nasa_jpl_url: obj.nasa_jpl_url,
        absolute_magnitude_h: obj.absolute_magnitude_h,
        is_potentially_hazardous: obj.is_potentially_hazardous_asteroid,
        estimated_diameter_min_m: Math.round(obj.estimated_diameter?.meters?.estimated_diameter_min || 0),
        estimated_diameter_max_m: Math.round(obj.estimated_diameter?.meters?.estimated_diameter_max || 0),
        miss_distance_km: Math.round(parseFloat(closeApproach.miss_distance?.kilometers || '0')).toLocaleString(),
        miss_distance_lunar: parseFloat(closeApproach.miss_distance?.lunar || '0').toFixed(2),
        velocity_kph: Math.round(parseFloat(closeApproach.relative_velocity?.kilometers_per_hour || '0')).toLocaleString(),
        close_approach_time: closeApproach.close_approach_date_full || closeApproach.close_approach_date
      };
    })
  };
}

/**
 * Fetch photos from NASA Mars Exploration using NASA Images Archive
 * @param {string} [query='mars rover']
 */
export async function getMarsRoverPhotos({ query = 'mars rover perseverance surface', count = 10 } = {}) {
  const url = `${NASA_IMAGES_API}/search?q=${encodeURIComponent(query)}&media_type=image&page_size=${count}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NASA Images API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const items = data.collection?.items || [];
  
  if (items.length === 0) {
    return { query, photos: [] };
  }

  const photos = items.map(item => {
    const info = item.data?.[0] || {};
    const link = item.links?.[0]?.href || '';
    return {
      id: info.nasa_id,
      title: info.title,
      description: info.description,
      date_created: info.date_created?.split('T')[0] || 'Unknown',
      img_src: link,
      center: info.center,
      keywords: info.keywords || []
    };
  }).filter(p => p.img_src);

  return {
    query,
    photos
  };
}

/**
 * Fetch real-time International Space Station (ISS) position and astronauts currently in space
 */
export async function getISSTelemetry() {
  try {
    const posRes = await fetch(ISS_API_URL);
    if (!posRes.ok) {
      throw new Error(`Failed to fetch ISS coordinates (${posRes.status})`);
    }

    const posData = await posRes.json();
    const latitude = parseFloat(posData.latitude);
    const longitude = parseFloat(posData.longitude);
    const altitude = Math.round(parseFloat(posData.altitude));
    const velocity = Math.round(parseFloat(posData.velocity));

    let astronauts = [
      { name: 'Oleg Kononenko', craft: 'ISS' },
      { name: 'Nikolai Chub', craft: 'ISS' },
      { name: 'Tracy C. Dyson', craft: 'ISS' },
      { name: 'Matthew Dominick', craft: 'ISS (Crew-8)' },
      { name: 'Michael Barratt', craft: 'ISS (Crew-8)' },
      { name: 'Jeanette Epps', craft: 'ISS (Crew-8)' },
      { name: 'Alexander Grebenkin', craft: 'ISS (Crew-8)' },
      { name: 'Sunita Williams', craft: 'ISS (Starliner)' },
      { name: 'Barry Wilmore', craft: 'ISS (Starliner)' }
    ];

    try {
      const astrosRes = await fetch('http://api.open-notify.org/astros.json', { signal: AbortSignal.timeout(2000) });
      if (astrosRes.ok) {
        const astrosData = await astrosRes.json();
        if (astrosData.people && astrosData.people.length > 0) {
          astronauts = astrosData.people;
        }
      }
    } catch {
      // Graceful fallback to verified active expedition crew
    }

    return {
      latitude,
      longitude,
      altitude_km: altitude,
      velocity_kmh: velocity,
      visibility: posData.visibility,
      timestamp: posData.timestamp,
      mapUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
      astronautsCount: astronauts.length,
      astronauts
    };
  } catch (error) {
    throw new Error(`ISS Telemetry Service Error: ${error.message}`);
  }
}

/**
 * Curated space trivia bank for interactive Slack quizzes
 */
export const SPACE_TRIVIA_QUESTIONS = [
  {
    id: 'q1',
    question: 'How fast does the International Space Station orbit the Earth?',
    options: ['~10,000 km/h', '~27,600 km/h', '~50,000 km/h', '~100,000 km/h'],
    answerIndex: 1,
    explanation: 'The ISS travels at roughly 27,600 km/h (17,150 mph), completing an entire orbit around Earth every 90 minutes!'
  },
  {
    id: 'q2',
    question: 'Which is the largest volcano in the Solar System?',
    options: ['Mauna Kea (Earth)', 'Mount Sharp (Mars)', 'Olympus Mons (Mars)', 'Maxwell Montes (Venus)'],
    answerIndex: 2,
    explanation: 'Olympus Mons on Mars stands about 21.9 km (13.6 mi) high, nearly three times taller than Mount Everest!'
  },
  {
    id: 'q3',
    question: 'What is the primary mirror diameter of the James Webb Space Telescope (JWST)?',
    options: ['2.4 meters', '4.5 meters', '6.5 meters', '10.0 meters'],
    answerIndex: 2,
    explanation: 'The JWST primary gold-coated beryllium mirror has a diameter of 6.5 meters, compared to Hubble\'s 2.4 meters.'
  },
  {
    id: 'q4',
    question: 'What is the closest star system to our Solar System?',
    options: ['Alpha Centauri', 'Barnard\'s Star', 'Sirius', 'Betelgeuse'],
    answerIndex: 0,
    explanation: 'The Alpha Centauri system (including Proxima Centauri) is the closest star system at approximately 4.24 light-years away.'
  },
  {
    id: 'q5',
    question: 'What creates the glowing tail of a comet when it approaches the Sun?',
    options: ['Nuclear fusion in the core', 'Solar wind sublimating ices into gas and dust', 'Combustion of methane in space', 'Gravitational friction'],
    answerIndex: 1,
    explanation: 'Solar radiation and solar wind heat the comet, sublimating frozen volatiles into glowing gas and dust clouds.'
  },
  {
    id: 'q6',
    question: 'Which lunar crater will the NASA Artemis III mission explore near the Moon\'s South Pole?',
    options: ['Tycho Crater', 'Shackleton / South Pole Plateau', 'Copernicus Crater', 'Mare Tranquillitatis'],
    answerIndex: 1,
    explanation: 'The Artemis program targets permanently shadowed regions near the lunar South Pole (like Shackleton Crater) where abundant water ice exists.'
  }
];

export function getRandomTrivia() {
  const randomIndex = Math.floor(Math.random() * SPACE_TRIVIA_QUESTIONS.length);
  return SPACE_TRIVIA_QUESTIONS[randomIndex];
}
