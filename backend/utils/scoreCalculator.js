// Update backend/utils/scoreCalculator.js - FIXED VERSION

function normalizeScore(value, allValues, higherIsBetter) {
  if (!allValues || allValues.length === 0) return 0;
  if (allValues.length === 1) return 50;
  
  const validValues = allValues.filter(v => typeof v === 'number' && !isNaN(v));
  if (validValues.length === 0) return 0;
  
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  
  if (min === max) return 50;
  
  if (higherIsBetter) {
    return ((value - min) / (max - min)) * 100;
  } else {
    return ((max - value) / (max - min)) * 100;
  }
}

function calculateLeaderboard(athletes, tests, scores) {
  console.log('\n🔍 DEBUG - calculateLeaderboard called');
  console.log(`Athletes: ${athletes.length}, Tests: ${tests.length}, Scores: ${scores.length}`);
  
  // Convert to maps for easier lookup
  const athleteMap = new Map();
  athletes.forEach(athlete => {
    athleteMap.set(athlete._id.toString(), {
      athleteId: athlete._id,
      name: athlete.name,
      totalPoints: 0,
      testDetails: []
    });
  });
  
  const testMap = new Map();
  tests.forEach(test => {
    testMap.set(test._id.toString(), test);
  });
  
  // Group scores by test for normalization
  const scoresByTest = new Map();
  
  // First pass: collect all scores per test
  scores.forEach(score => {
    let testId;
    let athleteId;
    
    // Handle both populated and non-populated scores
    if (score.testId && score.testId._id) {
      testId = score.testId._id.toString();
    } else if (score.testId) {
      testId = score.testId.toString();
    } else {
      console.log('⚠️ Score missing testId:', score._id);
      return;
    }
    
    if (score.athleteId && score.athleteId._id) {
      athleteId = score.athleteId._id.toString();
    } else if (score.athleteId) {
      athleteId = score.athleteId.toString();
    } else {
      console.log('⚠️ Score missing athleteId:', score._id);
      return;
    }
    
    if (!scoresByTest.has(testId)) {
      scoresByTest.set(testId, []);
    }
    scoresByTest.get(testId).push(score.value);
  });
  
  console.log(`Tests with scores: ${scoresByTest.size}`);
  
  // Second pass: calculate points
  scores.forEach(score => {
    let testId;
    let athleteId;
    
    // Get IDs
    if (score.testId && score.testId._id) {
      testId = score.testId._id.toString();
    } else if (score.testId) {
      testId = score.testId.toString();
    }
    
    if (score.athleteId && score.athleteId._id) {
      athleteId = score.athleteId._id.toString();
    } else if (score.athleteId) {
      athleteId = score.athleteId.toString();
    }
    
    if (!testId || !athleteId) {
      console.log('⚠️ Skipping score with missing IDs:', score._id);
      return;
    }
    
    const athleteData = athleteMap.get(athleteId);
    const test = testMap.get(testId);
    
    if (!athleteData) {
      console.log(`⚠️ Athlete not found for score: ${athleteId}`);
      return;
    }
    
    if (!test) {
      console.log(`⚠️ Test not found for score: ${testId}`);
      return;
    }
    
    const allValues = scoresByTest.get(testId) || [];
    const points = normalizeScore(score.value, allValues, test.higherIsBetter);
    
    console.log(`  ${athleteData.name} - ${test.testName}: ${score.value} → ${points.toFixed(1)} pts`);
    
    athleteData.totalPoints += points;
    athleteData.testDetails.push({
      testId: test._id,
      testName: test.testName,
      rawValue: score.value,
      unit: test.unit,
      points: parseFloat(points.toFixed(1)),
      date: score.date
    });
  });
  
  // Convert to array and filter
  const leaderboard = Array.from(athleteMap.values())
    .filter(athlete => {
      const hasScores = athlete.totalPoints > 0;
      if (!hasScores) {
        console.log(`⚠️ ${athlete.name} has 0 total points`);
      }
      return hasScores;
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((athlete, index) => ({
      rank: index + 1,
      ...athlete,
      totalPoints: parseFloat(athlete.totalPoints.toFixed(1))
    }));
  
  console.log(`✅ Final leaderboard: ${leaderboard.length} athletes`);
  
  return leaderboard;
}

module.exports = { calculateLeaderboard, normalizeScore };