const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'src', 'components', 'ResultsViewer.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Replace handleBarberExport function
const startMarker = '  const handleBarberExport = useCallback(async ()';
const endMarker = '}, [createBarberCard, selectedHairstyle]);';

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker, startIdx);
if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find handleBarberExport function');
  process.exit(1);
}
const endPos = endIdx + endMarker.length;

const newFn = `  const handleBarberExport = useCallback(async () => {
    setIsCreatingBarberCard(true);
    triggerHaptic(ImpactStyle.Medium);
    try {
      const blob = await createBarberCard();
      if (!blob) { toast.error('Failed to create stylist card'); return; }
      if (Capacitor.isNativePlatform()) {
        const b64 = await blobToBase64(blob);
        const fn = \`stylist-card-\${Date.now()}.jpg\`;
        await Filesystem.writeFile({ path: fn, data: b64, directory: Directory.Cache, recursive: true });
        const { uri } = await Filesystem.getUri({ path: fn, directory: Directory.Cache });
        await Share.share({
          title: \`\${selectedHairstyle?.name || 'Hairstyle'} - Show Your Stylist\`,
          text: 'Here\\'s the style I want - generated with Hair Studio AI',
          dialogTitle: 'Share Stylist Card',
          files: [uri],
        });
        toast.success('Stylist card shared!');
        setTimeout(async () => { try { await Filesystem.deleteFile({ path: fn, directory: Directory.Cache }); } catch {} }, 2000);
      } else {
        downloadBlob(blob, \`stylist-card-\${selectedHairstyle?.name || 'hairstyle'}.jpg\`);
        toast.success('Stylist card downloaded!');
      }
    } catch (e: any) {
      if (isShareCancel(e)) toast.info('Share cancelled');
      else { console.error('Stylist card export failed:', e); toast.error('Failed to export stylist card'); }
    } finally { setIsCreatingBarberCard(false); }
  }, [createBarberCard, selectedHairstyle]);`;

code = code.substring(0, startIdx) + newFn + code.substring(endPos);

// 2. Fix canvas title
code = code.replace('Show Your Barber This', 'Show Your Stylist This');

// 3. Fix desktop button label if present
code = code.replace(/Show Your Barber/g, 'Show Your Stylist');

fs.writeFileSync(filePath, code, 'utf8');
console.log('Done - fixed handleBarberExport + renamed to Stylist');
