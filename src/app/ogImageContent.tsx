// Shared JSX builder for opengraph-image.tsx and twitter-image.tsx.
//
// This is intentionally NOT a Next.js file-convention name (opengraph-image /
// twitter-image), so it isn't picked up as its own route — it just factors
// out the branded layout the two conventions share, since ImageResponse
// requires the `alt` / `size` / `contentType` exports to live directly in
// each convention file.
//
// Kept fully static (solid colors, text, flex layout only — no external
// font/image fetches) so both images can be generated at build time.

const TILE_COLORS = ['#3FD17C', '#FFB238', '#3FD17C', '#FFB238', '#3FD17C'];

export function buildOgLayout() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0A0C10',
        padding: '64px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 128,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: '#eef1f3',
          }}
        >
          CITYLE
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 16,
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: '#3FD17C',
            textTransform: 'uppercase',
          }}
        >
          Urban &amp; Climate Deduction
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 44,
            gap: 14,
          }}
        >
          {TILE_COLORS.map((color, index) => (
            <div
              key={`${color}-${index}`}
              style={{
                display: 'flex',
                width: 56,
                height: 56,
                borderRadius: 8,
                backgroundColor: color,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
