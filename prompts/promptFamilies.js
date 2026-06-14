// backend/prompts/promptFamilies.js
// A2: Model-specific prompt families that replace the monolithic prompt file.
// Each family is optimized for a hairstyle category and uses structured attributes
// to generate targeted, shorter prompts (~200-300 lines vs. the old ~500 lines).

const PROMPT_VERSION = 'v2.0.0';

// ─── Shared constraint blocks (DRY) ─────────────────────────────────────────

const PRESERVATION_BLOCK = `
Critical Preservation Rules (Highest Priority):
1. STRICT PRESERVATION — the following are INVIOLABLE and must remain 100% identical to the source:
   • Head position, orientation, and viewing angle — do NOT rotate, tilt, or move.
   • Facial hair (beard, mustache, goatee, sideburns) — use EXACTLY what appears in the original.
   • Facial features (eyes, nose, mouth, ears, structure), skin tone, texture, expression.
   • Clothing, accessories, body posture, shoulders, neck.
   • Background and all environmental elements.
   • Lighting direction, intensity, and color temperature.
2. OVERRIDE RULES — if the hairstyle description mentions viewing angle, head position, or facial hair, IGNORE those portions completely. Always default to the original image.
3. SCALP HAIR ONLY — your editing scope is LIMITED to hair growing from the scalp (top, sides, back). Do NOT modify facial hair, eyebrows, or any feature below the hairline.
4. ADAPTIVE HEAD MORPHOLOGY — you may make subtle, natural adjustments to head shape above the hairline and scalp contour to accommodate the new hairstyle. Do NOT affect the face or features below the hairline.
`;

const LIGHTING_BLOCK = `
Photorealistic Lighting and Integration:
• Match the source image's existing lighting: direction, shadow intensity, color temperature, highlights.
• The new hairstyle must appear as if captured in the same photographic session.
• All edges where new hair meets original skin must be imperceptible.
• Hair must match the overall image grain and photographic quality.
`;

// ─── Family: low-cut ────────────────────────────────────────────────────────
// For: buzz cuts, fades, waves, Caesar cuts, low cuts, skin fades

function lowCut(description, attributes = {}) {
  const fadeHint = attributes.fadeType && attributes.fadeType !== 'none'
    ? `Pay particular attention to the ${attributes.fadeType} — the transition from skin to hair must be gradual, blended, and razor-sharp where specified.`
    : '';

  const lineupHint = attributes.hasLineup
    ? 'The line-up/edge-up must be surgically precise — straight lines, sharp C-cups at temples, and clean nape definition.'
    : '';

  return `Act as an expert digital artist specializing in photorealistic hair editing, with precision for short and low-cut hairstyles.

PRIMARY GOAL: Replace the entire scalp hairstyle with the described low-cut style using a BLANK SLATE approach — generate the new hair as if the original scalp hair were completely absent.

Target Hairstyle: """${description}"""

${PRESERVATION_BLOCK}

Low-Cut Specific Constraints:
• BLANK SLATE RULE: The new low-cut hairstyle must be generated as if the original hair were absent. No artifacts from previous hair.
• HAIRSTYLE FIDELITY: Every detail — hair type, texture, fade specifications, guard numbers, lengths, line-ups, color, sheen, styling direction — must be faithfully rendered.
${fadeHint}
${lineupHint}
• SEAMLESS TRANSITIONS: Side hair and fades must transition flawlessly to original sideburns/facial hair. The nape must blend naturally with the neck.
• SCALP RENDERING: Pay meticulous attention to how light interacts with very short hair, skin fades, and visible scalp.

${LIGHTING_BLOCK}

Priority Order: 1) Hairstyle accuracy + blank slate  2) Original image preservation  3) Realistic integration  4) Photorealism

OUTPUT: A single photorealistic image of the same person wearing the target low-cut hairstyle, looking in the same direction as the original.`;
}

// ─── Family: braids-twists ──────────────────────────────────────────────────
// For: cornrows, box braids, twists, feed-in braids, flat twists, Bantu knots

function braidsTwists(description, attributes = {}) {
  const techniqueHint = attributes.stylingTechnique
    ? `The primary technique is ${attributes.stylingTechnique}. Ensure each unit is uniform from root to tip.`
    : '';

  const complexityHint = attributes.complexity === 'highly-intricate' || attributes.complexity === 'intricate'
    ? 'This is a complex braided/twisted style — maintain consistent section sizes, tension, and pattern throughout.'
    : '';

  return `Act as an expert digital artist specializing in photorealistic hair editing, with expertise in African braiding and twisting techniques.

PRIMARY GOAL: Replace the scalp hairstyle with the described braided/twisted style, ensuring each braid/twist/unit follows natural hair growth patterns and parting geometry.

Target Hairstyle: """${description}"""

${PRESERVATION_BLOCK}

Braids & Twists Specific Constraints:
• PARTING GEOMETRY: Render precise, geometric partings that match the style description. Section sizes must be consistent.
${techniqueHint}
${complexityHint}
• TENSION & TEXTURE: Each braid/twist must show appropriate tension at the root — tight enough for structure, natural enough to avoid an artificial look. Hair texture between parts should show natural scalp and edges.
• DIRECTIONAL FLOW: Follow the described flow pattern (forward, backward, diagonal, etc.). The arrangement must create the described silhouette.
• ROOT-TO-TIP CONSISTENCY: Each unit must maintain consistent diameter, twist/braid tightness, and finish from root to tip.
• SIDE INTEGRATION: Where braids/twists meet faded or natural sides, the transition must be clean and natural.

${LIGHTING_BLOCK}

Priority Order: 1) Original image preservation  2) Hairstyle fidelity (adapted to pose)  3) Realistic integration  4) Photorealism

OUTPUT: A single photorealistic image of the same person wearing the target braided/twisted hairstyle from the original viewing angle.`;
}

// ─── Family: locs ───────────────────────────────────────────────────────────
// For: dreadlocks, faux locs, sisterlocks, loc styles

function locs(description, attributes = {}) {
  const locType = attributes.stylingTechnique || 'palm-roll';
  
  return `Act as an expert digital artist specializing in photorealistic hair editing, with mastery of loc'd hairstyles.

PRIMARY GOAL: Replace the scalp hairstyle with the described loc'd style, respecting the unique weight, fall, and organic texture of locs.

Target Hairstyle: """${description}"""

${PRESERVATION_BLOCK}

Locs Specific Constraints:
• LOC CHARACTER: Each loc must show organic, natural texture — not perfectly uniform. Locs have individual personality with slight variations in thickness and texture.
• LOC METHOD HINT: The forming technique appears to be ${locType}. Render root texture, body texture, and tips accordingly.
• WEIGHT & GRAVITY: Locs have significant weight. They must fall naturally according to gravity from the original head position. Do not defy physics.
• SCALP BETWEEN LOCS: Show realistic scalp visibility between locs with natural parting patterns.
• VOLUME & GATHERING: If the style describes an updo, bun, or gathered arrangement, the locs must maintain their individual identity while forming the described shape.
• ROOT GROWTH: Show natural root growth texture where locs begin — the transition from scalp to formed loc.

${LIGHTING_BLOCK}

Priority Order: 1) Original image preservation  2) Hairstyle fidelity (adapted to pose)  3) Loc authenticity  4) Photorealism

OUTPUT: A single photorealistic image of the same person wearing the target loc'd hairstyle from the original viewing angle.`;
}

// ─── Family: natural-textured ───────────────────────────────────────────────
// For: afros, coils, twist-outs, wash-and-go, finger coils, natural hair

function naturalTextured(description, attributes = {}) {
  const volumeHint = attributes.volumeProfile
    ? `Target volume: ${attributes.volumeProfile}. `
    : '';

  return `Act as an expert digital artist specializing in photorealistic hair editing, with deep expertise in natural African hair textures.

PRIMARY GOAL: Replace the scalp hairstyle with the described natural-textured style, honoring the authentic curl pattern, volume, and movement of natural hair.

Target Hairstyle: """${description}"""

${PRESERVATION_BLOCK}

Natural Texture Specific Constraints:
• CURL PATTERN FIDELITY: Render the exact curl/coil pattern described. Each strand should show the natural spiral, coil, or wave pattern.
• VOLUME IS KEY: ${volumeHint}Natural hair volume comes from individual strand curl patterns stacking together — render this 3D volume accurately, not as a flat mass.
• TEXTURE DEFINITION: Show individual curl/coil definition with appropriate product sheen. Natural hair has depth — front curls should overlap and partially occlude rear ones.
• SHRINKAGE: Natural hair appears shorter than its stretched length. Respect this property for the given hair type.
• EDGES & HAIRLINE: The hairline should show natural baby hairs and edge patterns. If edge control is described, render laid edges with appropriate sheen.
• MOVEMENT: Natural hair has subtle movement and asymmetry — it should not look like a helmet or wig.

${LIGHTING_BLOCK}

Priority Order: 1) Original image preservation  2) Hairstyle fidelity (adapted to pose)  3) Natural texture authenticity  4) Photorealism

OUTPUT: A single photorealistic image of the same person wearing the target natural-textured hairstyle from the original viewing angle.`;
}

// ─── Family: protective-install ─────────────────────────────────────────────
// For: weaves, wigs, crochet, sew-ins

function protectiveInstall(description, attributes = {}) {
  return `Act as an expert digital artist specializing in photorealistic hair editing, with expertise in installed protective hairstyles.

PRIMARY GOAL: Replace the scalp hairstyle with the described installed style (weave/wig/crochet), ensuring the install looks natural and undetectable.

Target Hairstyle: """${description}"""

${PRESERVATION_BLOCK}

Protective Install Specific Constraints:
• NATURAL INSTALLATION LOOK: The style must look like natural hair, not an obvious wig or weave. The hairline must blend seamlessly with the person's natural skin.
• HAIRLINE INTEGRATION: If a frontal/closure is described, render a natural-looking hairline with baby hairs. If no frontal, show a natural leave-out blend.
• PARTING REALISM: Any part should show scalp-realistic coloring and texture, not an obvious mesh or track.
• HAIR FIBER QUALITY: Render the described hair texture (straight, body wave, deep wave, kinky straight, etc.) with consistent quality throughout.
• MOVEMENT & FALL: The installed hair should drape and move naturally according to gravity and the described texture.

${LIGHTING_BLOCK}

Priority Order: 1) Original image preservation  2) Hairstyle fidelity (adapted to pose)  3) Natural install appearance  4) Photorealism

OUTPUT: A single photorealistic image of the same person wearing the target installed hairstyle from the original viewing angle.`;
}

// ─── Family: standard (catch-all) ───────────────────────────────────────────
// For: bobs, straight styles, relaxed, modern cuts with length, anything unclassified

function standard(description, attributes = {}) {
  return `Act as an expert digital artist specializing in photorealistic in-painting and image editing.

PRIMARY GOAL: Seamlessly replace the hairstyle of the person in the uploaded source image with a new one based precisely on the provided description. The new hairstyle must be realistically adapted to fit the subject's original head position and orientation.

Target Hairstyle: """${description}"""

${PRESERVATION_BLOCK}

Standard Generation Constraints:
• HAIRSTYLE FIDELITY (ADAPTED TO POSE): Render the hairstyle as described, but only as it would naturally appear from the source image's fixed viewing angle. If a feature is not visible from the original pose, render only visible portions.
• SEAMLESS INTEGRATION: The blend between new hairstyle and original features must be undetectable. Hairline integrates naturally with forehead and temples. Side hair transitions seamlessly to sideburns. Nape blends naturally with neck.

${LIGHTING_BLOCK}

Priority Order: 1) Original image preservation  2) Override rules (ignore angle/facial hair descriptions)  3) Hairstyle fidelity (adapted to pose)  4) Photorealism

OUTPUT: A single photorealistic image of the same person wearing the target hairstyle from the original viewing angle.`;
}

// ─── Router: select prompt family based on attributes ───────────────────────

/**
 * Select and generate the appropriate prompt for a hairstyle.
 * @param {string} description - The ai_description text
 * @param {object} attributes - Structured attributes (from Hairstyle.attributes)
 * @param {string} category - Hairstyle category (fallback routing)
 * @returns {{ promptText: string, promptFamily: string, promptVersion: string }}
 */
function buildPrompt(description, attributes = {}, category = '') {
  // Determine prompt family: prefer attributes.promptFamily, fall back to category-based routing
  let family = attributes.promptFamily;

  if (!family) {
    const categoryFamilyMap = {
      'Low Cut': 'low-cut', 'Fades': 'low-cut',
      'Braids': 'braids-twists', 'Twists': 'braids-twists',
      'Locs': 'locs',
      'Afros': 'natural-textured', 'Coils': 'natural-textured',
      'Weaves': 'protective-install', 'Protective': 'protective-install'
    };
    family = categoryFamilyMap[category] || 'standard';
  }

  const familyFns = {
    'low-cut': lowCut,
    'braids-twists': braidsTwists,
    'locs': locs,
    'natural-textured': naturalTextured,
    'protective-install': protectiveInstall,
    'standard': standard
  };

  const fn = familyFns[family] || standard;
  const promptText = fn(description, attributes);

  return {
    promptText,
    promptFamily: family,
    promptVersion: PROMPT_VERSION
  };
}

// ─── A3: Edit-centric prompt enhancement ────────────────────────────────────
//
// Wraps the category prompt with mask-aware spatial constraints.
// This moves from "here's a photo + a hairstyle description" to
// "edit the hair region of this specific face, preserving everything else."

/**
 * Build an edit-centric prompt using hair mask analysis data.
 * @param {string} description - ai_description text
 * @param {object} attributes - Structured attributes
 * @param {string} category - Hairstyle category
 * @param {object|null} maskData - Output from hairMask.analyzeHairRegion()
 * @returns {{ promptText: string, promptFamily: string, promptVersion: string }}
 */
function buildEditPrompt(description, attributes = {}, category = '', maskData = null) {
  // Start with the standard family prompt
  const base = buildPrompt(description, attributes, category);

  if (!maskData || !maskData.hairRegion) {
    // No mask data available — fall back to standard prompt
    return base;
  }

  const hr = maskData.hairRegion;
  const cs = maskData.currentHairState || {};
  const fr = maskData.faceRegion || {};

  // Build spatial + contextual prefix
  const editPrefix = `
=== EDIT-MODE DIRECTIVES (A3) ===

EDITING REGION — Only modify pixels within the HAIR REGION, approximately:
  top: ${hr.top}% from image top | bottom: ${hr.bottom}% | left: ${hr.left}% | right: ${hr.right}%
  Everything outside this region (face, clothing, background) must be pixel-identical.

FACE PRESERVATION ZONE — The face occupies approximately:
  top: ${fr.top || 25}% | bottom: ${fr.bottom || 85}% | left: ${fr.left || 20}% | right: ${fr.right || 80}%
  This region is INVIOLABLE — zero modifications allowed.

CURRENT HAIR STATE (use for natural transitions):
  Length: ${cs.length || 'unknown'} | Color: ${cs.color || 'unknown'}
  Texture: ${cs.texture || 'unknown'} | Coverage: ${cs.coverage || 'full'}
  Hairline: ${maskData.hairlineBoundary || 'unknown'}

TRANSITION RULES:
  • Where new hair meets the forehead/temples, follow the detected ${maskData.hairlineBoundary || 'natural'} hairline shape.
  • Blend new hair seamlessly at the boundary between hair region and skin.
  • If current hair is ${cs.length || 'unknown'} length, ensure the hairstyle change looks physically plausible.
${maskData.obstructions?.length ? `\nOBSTRUCTION WARNING: The following items may partially cover the hair region: ${maskData.obstructions.join(', ')}. Work around them naturally.\n` : ''}
=== END EDIT-MODE DIRECTIVES ===

`;

  return {
    promptText: editPrefix + base.promptText,
    promptFamily: base.promptFamily,
    promptVersion: PROMPT_VERSION + '-edit'
  };
}

module.exports = {
  buildPrompt,
  buildEditPrompt,
  lowCut,
  braidsTwists,
  locs,
  naturalTextured,
  protectiveInstall,
  standard,
  PROMPT_VERSION
};
