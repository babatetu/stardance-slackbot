import { getAPOD, getNearEarthObjects, getMarsRoverPhotos, getISSTelemetry, getRandomTrivia } from '../src/services/nasaService.js';

async function runTests() {
  console.log('🧪 Running AstroBot Space Services Test Suite...\n');

  try {
    console.log('📡 1. Testing NASA APOD API...');
    const apod = await getAPOD({ random: true });
    console.log(`   ✅ Success! Retrieved APOD: "${apod.title}" (${apod.date})`);

    console.log('\n📡 2. Testing NASA NeoWs Asteroid Radar API...');
    const neo = await getNearEarthObjects();
    console.log(`   ✅ Success! Total asteroids today: ${neo.element_count}, Sample: ${neo.objects[0]?.name || 'N/A'}`);

    console.log('\n📡 3. Testing NASA Mars Images Archive API...');
    const mars = await getMarsRoverPhotos({ query: 'mars rover perseverance', count: 5 });
    console.log(`   ✅ Success! Photos found: ${mars.photos.length}, Sample Title: "${mars.photos[0]?.title}"`);

    console.log('\n📡 4. Testing ISS Live Telemetry & Astronauts...');
    const iss = await getISSTelemetry();
    console.log(`   ✅ Success! ISS Pos: (${iss.latitude}, ${iss.longitude}), Astronauts in space: ${iss.astronautsCount}`);

    console.log('\n📡 5. Testing Space Trivia Generator...');
    const trivia = getRandomTrivia();
    console.log(`   ✅ Success! Sample question: "${trivia.question}"`);

    console.log('\n🎉 ALL NASA & SPACE API TESTS PASSED! Ready for Stardance submission.');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

runTests();
