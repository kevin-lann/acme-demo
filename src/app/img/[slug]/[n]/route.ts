/** Generated SVG product shots, so the fixture ships no binary assets. */

const PALETTES = [
  ["#dbeafe", "#1d4ed8"],
  ["#fce7f3", "#be185d"],
  ["#dcfce7", "#15803d"],
  ["#fef3c7", "#b45309"],
  ["#ede9fe", "#6d28d9"],
  ["#e0f2fe", "#0369a1"],
];

function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

const ANGLES = ["Front", "Side", "Detail", "In use"];

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  const index = Number.parseInt(n, 10) || 0;
  const [bg, fg] = PALETTES[(hash(slug) + index) % PALETTES.length];
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const label = ANGLES[index % ANGLES.length];
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
<rect width="600" height="600" fill="${bg}"/>
<circle cx="${220 + index * 50}" cy="${260 - index * 20}" r="${140 - index * 15}" fill="${fg}" opacity="0.18"/>
<rect x="170" y="200" width="260" height="200" rx="32" fill="${fg}" opacity="0.85"/>
<text x="300" y="480" font-family="system-ui, sans-serif" font-size="30" font-weight="600" text-anchor="middle" fill="${fg}">${esc(title)}</text>
<text x="300" y="520" font-family="system-ui, sans-serif" font-size="20" text-anchor="middle" fill="${fg}" opacity="0.7">${label} view</text>
</svg>`;
  return new Response(svg, {
    headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" },
  });
}
