// Shared JSX builder for this route's opengraph-image.tsx, mirroring the
// pattern set by `src/app/ogImageContent.tsx` (a plain function, flex
// layout, no hooks, no external font/image fetches — Satori-safe so it can
// be generated at build/request time).

import { City } from '../../../../lib/types';
import { getCountryFlag } from '../../../../lib/geo';

interface StatRow {
  label: string;
  value: string;
}

function statsFor(city: City): StatRow[] {
  return [
    { label: 'Population', value: `${(city.population_metro / 1_000_000).toFixed(1)}M` },
    { label: 'PM2.5', value: `${city.pm25_annual_ugm3} µg/m³` },
    { label: 'Mean Temp', value: `${city.temp_mean_annual_c.toFixed(1)}°C` },
    { label: 'Elevation', value: `${city.elevation_m}m` },
    { label: 'Köppen', value: city.koppen_current.code },
    { label: 'Transit Share', value: `${city.transit_active_share_pct}%` },
  ];
}

function StatRowView({ label, value }: StatRow) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingTop: 9,
        paddingBottom: 9,
        borderTop: '1px solid rgba(232,236,240,0.14)',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 19,
          color: '#8f9dac',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: '#eef1f3' }}>{value}</div>
    </div>
  );
}

function CityColumn({ city }: { city: City }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '44%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div style={{ display: 'flex', fontSize: 44 }}>{getCountryFlag(city.countryCode)}</div>
        <div
          style={{
            display: 'flex',
            fontSize: 18,
            fontWeight: 700,
            color: '#0A0C10',
            backgroundColor: '#FFB238',
            borderRadius: 6,
            padding: '3px 9px',
          }}
        >
          {city.countryCode}
        </div>
      </div>
      <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', color: '#eef1f3' }}>
        {city.name}
      </div>
      <div style={{ display: 'flex', fontSize: 20, color: '#3FD17C', marginBottom: 16 }}>{city.country}</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {statsFor(city).map((row) => (
          <StatRowView key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  );
}

export function buildAtlasLayout(cityA: City, cityB: City) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0A0C10',
        padding: '52px 60px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#FFB238',
            textTransform: 'uppercase',
          }}
        >
          Cityle Atlas
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <CityColumn city={cityA} />
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            fontWeight: 700,
            color: '#5c6773',
            alignSelf: 'center',
          }}
        >
          VS
        </div>
        <CityColumn city={cityB} />
      </div>
    </div>
  );
}
