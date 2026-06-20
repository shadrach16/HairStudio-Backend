// services/deepLink.js
// One canonical place to build shareable deep links + Play Store install-referrer
// URLs for the "Shad Hair Studio" content network. Keep the format here so the
// app, watermark, referral, and share-link endpoint all agree.

const APP_LINK_HOST = (process.env.PUBLIC_APP_LINK_HOST || 'https://213-136-65-247.sslip.io').replace(/\/$/, '');
const ANDROID_PACKAGE = process.env.ANDROID_PACKAGE || 'com.hairstudio.app';
const PLAY_STORE_URL = process.env.PLAY_STORE_URL || `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
const CUSTOM_SCHEME = process.env.APP_SCHEME || 'hairstudio';
const CHANNEL_HANDLE = process.env.CHANNEL_HANDLE || '@ShadHairStudio';

// App Links land on this path on APP_LINK_HOST. Must match the AndroidManifest
// intent-filter path and the /go web fallback route.
const GO_PATH = '/go';

function clean(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && String(v).length > 0) out[k] = String(v);
  }
  return out;
}

/**
 * The install-referrer string carried through the Play Store (URL-encoded once
 * by the caller into the Play URL's &referrer=). The app reads this verbatim on
 * first launch via the Play Install Referrer API to do DEFERRED deep linking.
 */
function buildReferrerString({ source, medium, campaign, content, ref }) {
  const params = new URLSearchParams(clean({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
    content,
    ref
  }));
  return params.toString(); // e.g. utm_source=youtube&utm_campaign=VID&content=ART
}

/** Play Store URL with the install referrer baked in (for the deferred path). */
function buildPlayStoreUrl(attr) {
  const referrer = buildReferrerString(attr);
  const sep = PLAY_STORE_URL.includes('?') ? '&' : '?';
  return `${PLAY_STORE_URL}${sep}referrer=${encodeURIComponent(referrer)}`;
}

/**
 * THE shareable https deep link with UTM baked in.
 * @param {object} a
 * @param {string} a.artifactId  hairstyle/result id referenced by the content (-> content=)
 * @param {string} a.videoId     the source video id (-> utm_campaign=)
 * @param {string} [a.source]    default "youtube"
 * @param {string} [a.medium]    default "video"
 * @param {string} [a.ref]       optional referral code
 * @returns {{ url, scheme, playStoreUrl, referrer }}
 */
function buildShareLink({ artifactId, videoId, source = 'youtube', medium = 'video', ref } = {}) {
  const query = new URLSearchParams(clean({
    content: artifactId,
    utm_source: source,
    utm_medium: medium,
    utm_campaign: videoId,
    ref
  }));
  const qs = query.toString();
  return {
    // Primary: https App Link — opens the app if installed+verified, else hits /go (web fallback -> Play Store w/ referrer)
    url: `${APP_LINK_HOST}${GO_PATH}?${qs}`,
    // Custom scheme (useful inside apps / QR / fallbacks)
    scheme: `${CUSTOM_SCHEME}://go?${qs}`,
    // What the /go fallback redirects non-installed users to
    playStoreUrl: buildPlayStoreUrl({ source, medium, campaign: videoId, content: artifactId, ref }),
    referrer: buildReferrerString({ source, medium, campaign: videoId, content: artifactId, ref })
  };
}

/** Parse UTM/content/ref out of any incoming URL (app link, scheme, or referrer string). */
function parseAttribution(input) {
  if (!input) return {};
  let params;
  try {
    // Full URL?
    params = new URL(input).searchParams;
  } catch {
    // Bare query / referrer string
    params = new URLSearchParams(input.replace(/^\?/, ''));
  }
  return clean({
    source: params.get('utm_source'),
    medium: params.get('utm_medium'),
    campaign: params.get('utm_campaign'),
    content: params.get('content'),
    ref: params.get('ref')
  });
}

module.exports = {
  APP_LINK_HOST,
  ANDROID_PACKAGE,
  PLAY_STORE_URL,
  CUSTOM_SCHEME,
  CHANNEL_HANDLE,
  GO_PATH,
  buildShareLink,
  buildReferrerString,
  buildPlayStoreUrl,
  parseAttribution
};
