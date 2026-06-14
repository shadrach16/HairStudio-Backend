require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');

const { buildMemoMarkdown, runBenchmark } = require('../services/aiBenchmark');

function parseListArg(name) {
  const raw = process.argv.find((value) => value.startsWith(`--${name}=`));
  if (!raw) {
    return null;
  }

  return raw.split('=')[1]
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function main() {
  const candidateIds = parseListArg('candidates');
  const caseIds = parseListArg('cases');
  const summary = await runBenchmark({ candidateIds, caseIds });

  const memoPath = path.join(__dirname, '../../docs/AI_MODEL_RECOMMENDATION_MEMO.md');
  await fs.writeFile(memoPath, buildMemoMarkdown(summary));

  const standard = summary.recommendation.standard;
  const premium = summary.recommendation.premium;

  console.log(JSON.stringify({
    runId: summary.runId,
    generatedAt: summary.generatedAt,
    standardRecommendation: standard.selectedCandidateLabel,
    standardImprovement: standard.improvement,
    premiumRecommendation: premium.selectedCandidateLabel,
    premiumImprovement: premium.improvement,
    blockedCandidates: summary.candidates
      .filter((candidate) => candidate.status === 'blocked')
      .map((candidate) => candidate.label)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});