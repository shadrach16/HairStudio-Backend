// backend/services/attributeExtractor.js
// A2: Extract structured attributes from a hairstyle's ai_description using Gemini

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EXTRACTION_PROMPT = `You are a hairstyle classification engine. Given a hairstyle description, extract structured attributes as JSON.

Return ONLY a valid JSON object with these fields (use null for unknown):

{
  "hairType": one of ["straight","wavy","curly","coily","kinky","locked","braided","twisted","woven"],
  "hairTexture": string like "4C","3B","2A" or null,
  "length": one of ["buzz","short","medium","long","extra-long"],
  "lengthMm": { "min": number|null, "max": number|null },
  "fadeType": one of ["none","taper","low-fade","mid-fade","high-fade","skin-fade","drop-fade","burst-fade","shadow-fade","temp-fade"],
  "fadeStartGuard": string like "#0" or null,
  "fadeEndGuard": string like "#2" or null,
  "hasLineup": boolean,
  "hasHardPart": boolean,
  "stylingTechnique": one of ["natural","blow-out","finger-coils","twist-out","braid-out","rod-set","flat-iron","cornrow","box-braid","feed-in-braid","crochet","sew-in","wig","faux-loc","palm-roll","interlock","free-form","sculpted","tapered","other"],
  "volumeProfile": one of ["flat","low","medium","high","very-high"],
  "partingPattern": one of ["none","center","side-left","side-right","diagonal","zigzag","free-form","geometric"],
  "complexity": one of ["simple","moderate","intricate","highly-intricate"],
  "requiresEdgeWork": boolean,
  "baseColor": string default "natural-black",
  "hasColorTreatment": boolean,
  "colorNotes": string or null,
  "promptFamily": one of ["low-cut","standard","braids-twists","locs","natural-textured","protective-install"]
}

Rules for promptFamily:
- "low-cut": buzz cuts, fades without length on top, skin fades, Caesar cuts, waves with very short hair
- "braids-twists": cornrows, box braids, twists, feed-in braids, flat twists, Bantu knots
- "locs": dreadlocks, faux locs, sisterlocks, loc styles
- "natural-textured": afros, coils, twist-outs, wash-and-go, finger coils, natural styles with volume
- "protective-install": weaves, wigs, crochet, sew-ins
- "standard": everything else (bobs, straight styles, relaxed, modern cuts with length)

Hairstyle description:
"""
{DESCRIPTION}
"""

Also consider the hairstyle name: "{NAME}" and category: "{CATEGORY}"

Return ONLY the JSON object, no markdown fences, no explanation.`;

/**
 * Extract structured attributes from a hairstyle's description using AI.
 * Falls back to heuristic extraction if AI is unavailable.
 */
async function extractAttributes(hairstyle) {
  const { name, category, ai_description } = hairstyle;

  // Try AI extraction first
  try {
    const prompt = EXTRACTION_PROMPT
      .replace('{DESCRIPTION}', (ai_description || '').slice(0, 3000))
      .replace('{NAME}', name || '')
      .replace('{CATEGORY}', category || '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: prompt }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const parsed = JSON.parse(text);
      return { success: true, attributes: sanitizeAttributes(parsed), method: 'ai' };
    }
  } catch (err) {
    console.warn('AI attribute extraction failed, using heuristic:', err.message);
  }

  // Fallback: heuristic extraction from category + description keywords
  return { success: true, attributes: heuristicExtract(name, category, ai_description), method: 'heuristic' };
}

/**
 * Heuristic fallback: derive attributes from category and keywords.
 */
function heuristicExtract(name, category, description) {
  const desc = ((description || '') + ' ' + (name || '')).toLowerCase();
  const attrs = {
    hairType: null,
    hairTexture: null,
    length: null,
    lengthMm: { min: null, max: null },
    fadeType: 'none',
    fadeStartGuard: null,
    fadeEndGuard: null,
    hasLineup: false,
    hasHardPart: false,
    stylingTechnique: 'natural',
    volumeProfile: 'medium',
    partingPattern: 'none',
    complexity: 'moderate',
    requiresEdgeWork: false,
    baseColor: 'natural-black',
    hasColorTreatment: false,
    colorNotes: null,
    promptFamily: 'standard'
  };

  // Prompt family from category
  const categoryMap = {
    'Low Cut': 'low-cut', 'Fades': 'low-cut',
    'Braids': 'braids-twists', 'Twists': 'braids-twists', 'Cornrows': 'braids-twists',
    'Locs': 'locs',
    'Afros': 'natural-textured', 'Coils': 'natural-textured',
    'Weaves': 'protective-install', 'Protective': 'protective-install',
    'Bob': 'standard', 'Straight': 'standard', 'Relaxed': 'standard',
    'Traditional': 'standard', 'Modern': 'standard', 'Fashion': 'standard'
  };
  attrs.promptFamily = categoryMap[category] || 'standard';

  // Hair type from keywords
  if (desc.includes('braid') || desc.includes('cornrow')) attrs.hairType = 'braided';
  else if (desc.includes('twist')) attrs.hairType = 'twisted';
  else if (desc.includes('loc') || desc.includes('dread')) attrs.hairType = 'locked';
  else if (desc.includes('weave') || desc.includes('sew-in')) attrs.hairType = 'woven';
  else if (desc.includes('coil') || desc.includes('afro') || desc.includes('kinky')) attrs.hairType = 'coily';
  else if (desc.includes('curl')) attrs.hairType = 'curly';
  else if (desc.includes('straight') || desc.includes('relaxed')) attrs.hairType = 'straight';

  // Fade detection
  if (desc.includes('skin fade')) attrs.fadeType = 'skin-fade';
  else if (desc.includes('drop fade')) attrs.fadeType = 'drop-fade';
  else if (desc.includes('burst fade')) attrs.fadeType = 'burst-fade';
  else if (desc.includes('high fade')) attrs.fadeType = 'high-fade';
  else if (desc.includes('mid fade')) attrs.fadeType = 'mid-fade';
  else if (desc.includes('low fade')) attrs.fadeType = 'low-fade';
  else if (desc.includes('taper')) attrs.fadeType = 'taper';
  else if (desc.includes('fade')) attrs.fadeType = 'low-fade';

  // Length
  if (desc.includes('buzz') || desc.includes('bald')) { attrs.length = 'buzz'; attrs.lengthMm = { min: 0, max: 3 }; }
  else if (attrs.promptFamily === 'low-cut') { attrs.length = 'short'; attrs.lengthMm = { min: 3, max: 25 }; }
  else if (desc.includes('long') || desc.includes('waist') || desc.includes('shoulder')) attrs.length = 'long';
  else if (desc.includes('medium') || desc.includes('chin')) attrs.length = 'medium';
  else if (desc.includes('short')) attrs.length = 'short';

  // Edge work
  if (desc.includes('line-up') || desc.includes('lineup') || desc.includes('edge-up') || desc.includes('edge up')) {
    attrs.hasLineup = true;
    attrs.requiresEdgeWork = true;
  }
  if (desc.includes('hard part') || desc.includes('razor part')) {
    attrs.hasHardPart = true;
    attrs.requiresEdgeWork = true;
  }
  if (attrs.fadeType !== 'none') attrs.requiresEdgeWork = true;

  // Styling technique
  if (desc.includes('cornrow')) attrs.stylingTechnique = 'cornrow';
  else if (desc.includes('box braid')) attrs.stylingTechnique = 'box-braid';
  else if (desc.includes('feed-in') || desc.includes('feed in')) attrs.stylingTechnique = 'feed-in-braid';
  else if (desc.includes('crochet')) attrs.stylingTechnique = 'crochet';
  else if (desc.includes('sew-in') || desc.includes('sew in')) attrs.stylingTechnique = 'sew-in';
  else if (desc.includes('finger coil')) attrs.stylingTechnique = 'finger-coils';
  else if (desc.includes('twist out') || desc.includes('twist-out')) attrs.stylingTechnique = 'twist-out';
  else if (desc.includes('blow out') || desc.includes('blow-out')) attrs.stylingTechnique = 'blow-out';
  else if (desc.includes('flat iron') || desc.includes('flat-iron')) attrs.stylingTechnique = 'flat-iron';
  else if (desc.includes('palm roll')) attrs.stylingTechnique = 'palm-roll';
  else if (desc.includes('interlock')) attrs.stylingTechnique = 'interlock';
  else if (desc.includes('faux loc')) attrs.stylingTechnique = 'faux-loc';
  else if (desc.includes('free-form') || desc.includes('freeform')) attrs.stylingTechnique = 'free-form';

  // Volume
  if (desc.includes('very high volume') || desc.includes('big afro') || desc.includes('voluminous')) attrs.volumeProfile = 'very-high';
  else if (desc.includes('high volume') || (category === 'Afros')) attrs.volumeProfile = 'high';
  else if (attrs.promptFamily === 'low-cut') attrs.volumeProfile = 'low';

  // Complexity
  if (desc.includes('intricate') || desc.includes('complex') || desc.includes('detailed')) attrs.complexity = 'highly-intricate';
  else if (desc.includes('simple') || attrs.promptFamily === 'low-cut') attrs.complexity = 'simple';
  else if (attrs.promptFamily === 'braids-twists' || attrs.promptFamily === 'locs') attrs.complexity = 'intricate';

  // Color
  if (desc.includes('blonde') || desc.includes('blond')) { attrs.hasColorTreatment = true; attrs.baseColor = 'blonde'; }
  else if (desc.includes('red') || desc.includes('auburn')) { attrs.hasColorTreatment = true; attrs.baseColor = 'red'; }
  else if (desc.includes('grey') || desc.includes('gray') || desc.includes('silver')) { attrs.hasColorTreatment = true; attrs.baseColor = 'grey'; }
  else if (desc.includes('highlight') || desc.includes('ombr') || desc.includes('balayage')) { attrs.hasColorTreatment = true; attrs.colorNotes = 'color highlights'; }

  return sanitizeAttributes(attrs);
}

/**
 * Sanitize and validate extracted attributes against schema enums.
 */
function sanitizeAttributes(attrs) {
  const validEnums = {
    hairType: ['straight','wavy','curly','coily','kinky','locked','braided','twisted','woven'],
    length: ['buzz','short','medium','long','extra-long'],
    fadeType: ['none','taper','low-fade','mid-fade','high-fade','skin-fade','drop-fade','burst-fade','shadow-fade','temp-fade'],
    stylingTechnique: ['natural','blow-out','finger-coils','twist-out','braid-out','rod-set','flat-iron','cornrow','box-braid','feed-in-braid','crochet','sew-in','wig','faux-loc','palm-roll','interlock','free-form','sculpted','tapered','other'],
    volumeProfile: ['flat','low','medium','high','very-high'],
    partingPattern: ['none','center','side-left','side-right','diagonal','zigzag','free-form','geometric'],
    complexity: ['simple','moderate','intricate','highly-intricate'],
    promptFamily: ['low-cut','standard','braids-twists','locs','natural-textured','protective-install']
  };

  const result = { ...attrs };
  for (const [key, allowed] of Object.entries(validEnums)) {
    if (result[key] && !allowed.includes(result[key])) {
      result[key] = null;
    }
  }

  // Ensure booleans
  for (const bk of ['hasLineup', 'hasHardPart', 'requiresEdgeWork', 'hasColorTreatment']) {
    result[bk] = !!result[bk];
  }

  // Ensure promptFamily has a default
  if (!result.promptFamily) result.promptFamily = 'standard';

  return result;
}

module.exports = { extractAttributes, heuristicExtract, sanitizeAttributes };
