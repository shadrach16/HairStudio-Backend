// routes/deeplink.js
// Mounted at root "/". Two public GETs:
//   GET /.well-known/assetlinks.json  -> Android App Links verification
//   GET /go                            -> web fallback for share links:
//        - app installed + App Link verified -> Android opens the app directly
//          (this route never runs in that case)
//        - otherwise -> try the custom scheme, then redirect to Play Store with
//          the install referrer baked in (enables DEFERRED deep linking).

const express = require('express');
const { ANDROID_PACKAGE, CUSTOM_SCHEME, buildPlayStoreUrl, parseAttribution } = require('../services/deepLink');

const router = express.Router();

// SHA-256 signing fingerprint(s), colon-separated hex. Comma-separate multiple.
// Defaults to the current upload key. IMPORTANT: also add your Play App Signing
// key fingerprint (Play Console -> App integrity -> App signing) or App Links
// won't verify on Play-distributed builds.
const CERT_FINGERPRINTS = (process.env.ANDROID_CERT_SHA256 ||
  'BF:8B:AF:DB:B0:B8:33:9E:7F:BC:A3:5D:54:50:82:90:DC:DE:0C:02:C7:45:F3:68:7A:A6:34:02:BD:41:0A:96'
).split(',').map((s) => s.trim()).filter(Boolean);

router.get('/.well-known/assetlinks.json', (req, res) => {
  res.json([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: ANDROID_PACKAGE,
        sha256_cert_fingerprints: CERT_FINGERPRINTS
      }
    }
  ]);
});

router.get('/go', (req, res) => {
  const attr = parseAttribution(req.originalUrl.split('?')[1] ? `?${req.originalUrl.split('?')[1]}` : '');
  const playUrl = buildPlayStoreUrl({
    source: attr.source,
    medium: attr.medium,
    campaign: attr.campaign,
    content: attr.content,
    ref: attr.ref
  });
  const qs = req.originalUrl.split('?')[1] || '';
  const schemeUrl = `${CUSTOM_SCHEME}://go?${qs}`;

  // Try the app (custom scheme) for an installed-but-unverified app, then fall
  // back to the Play Store (which carries the install referrer for deferral).
  res.set('Content-Type', 'text/html');
  res.send(`<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Opening Hair Studio…</title></head>
<body style="font-family:system-ui,sans-serif;text-align:center;padding:48px 20px;background:#0b0b0c;color:#fff">
<p style="font-size:18px">Opening Hair Studio…</p>
<p style="opacity:.7">If nothing happens, <a id="store" href="${playUrl}" style="color:#F59E0B">get the app</a>.</p>
<script>
  (function(){
    var store=${JSON.stringify(playUrl)};
    try { window.location.href=${JSON.stringify(schemeUrl)}; } catch(e){}
    setTimeout(function(){ window.location.href=store; }, 1200);
  })();
</script>
</body></html>`);
});

module.exports = router;
