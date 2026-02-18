const data = require('./extracted/infrastructure-final-additions.json');

const issues = [];

data.projects.forEach((p, i) => {
  const missing = [];

  // Check coordinates
  if (!p.location.coordinates || p.location.coordinates === null) {
    missing.push('coordinates');
  }

  // Check timeline
  if (p.timeline.startYear === null || p.timeline.startYear === undefined) {
    missing.push('startYear');
  }

  // Check media - should have actual photo URLs where available
  if (p.media.photoUrl === null || p.media.photoUrl === undefined) {
    missing.push('photoUrl');
  }

  // Check budget
  if (!p.budget || p.budget.crore === null || p.budget.crore === undefined) {
    missing.push('budget');
  }

  // Check sources - should have working URLs
  if (!p.sources || p.sources.length === 0) {
    missing.push('sources');
  }

  issues.push({
    id: p.id,
    name: p.name.en.substring(0, 50),
    missing: missing.length > 0 ? missing : ['complete'],
    hasCoords: p.location.coordinates ? `${p.location.coordinates.latitude}, ${p.location.coordinates.longitude}` : 'MISSING',
    startYear: p.timeline.startYear || 'MISSING',
    budget: p.budget?.crore || 'MISSING'
  });
});

console.log('=== Data Completeness Report ===\n');
console.log('Total projects:', data.projects.length);

const incomplete = issues.filter(i => i.missing[0] !== 'complete');
console.log('Incomplete projects:', incomplete.length);
console.log('\n--- Projects missing data ---\n');

incomplete.forEach(p => {
  console.log(`${p.id}`);
  console.log(`  Name: ${p.name}`);
  console.log(`  Missing: ${p.missing.join(', ')}`);
  console.log(`  Coords: ${p.hasCoords}`);
  console.log(`  StartYear: ${p.startYear}`);
  console.log(`  Budget: ${p.budget}`);
  console.log('');
});
