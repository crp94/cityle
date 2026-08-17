import { Locale } from './i18n';

export interface KoppenBreakdown {
  code: string;
  name: string;
  group: string;
  letter1: { letter: string; name: string; desc: string };
  letter2: { letter: string; name: string; desc: string };
  letter3?: { letter: string; name: string; desc: string };
  fullExplanation: string;
}

export const KOPPEN_EXPLANATIONS: Record<Locale, Record<string, KoppenBreakdown>> = {
  en: {
    Csa: {
      code: 'Csa',
      name: 'Hot-summer Mediterranean',
      group: 'C: Temperate',
      letter1: { letter: 'C', name: 'Temperate (Mesothermal)', desc: 'Average temperature of coldest month between -3°C and 18°C.' },
      letter2: { letter: 's', name: 'Dry Summer', desc: 'Precipitation in driest summer month is < 30mm and < 1/3 of wettest winter month.' },
      letter3: { letter: 'a', name: 'Hot Summer', desc: 'Warmest month average temperature is above 22°C.' },
      fullExplanation: 'Csa indicates a classic Mediterranean climate with hot, dry summers and mild, wet winters. Highly susceptible to summer heatwaves, drought, and urban heat island intensification.'
    },
    Csb: {
      code: 'Csb',
      name: 'Warm-summer Mediterranean',
      group: 'C: Temperate',
      letter1: { letter: 'C', name: 'Temperate', desc: 'Mild winters with coldest month average above -3°C.' },
      letter2: { letter: 's', name: 'Dry Summer', desc: 'Substantial reduction of rainfall in summer months.' },
      letter3: { letter: 'b', name: 'Warm Summer', desc: 'Warmest month average below 22°C, but at least 4 months above 10°C (coastal cooling influence).' },
      fullExplanation: 'Csb climates enjoy coastal tempering (e.g. San Francisco, Santiago coastal, Porto) with dry summers but moderated peak temperatures due to oceanic fog and sea breezes.'
    },
    Cfa: {
      code: 'Cfa',
      name: 'Humid Subtropical',
      group: 'C: Temperate',
      letter1: { letter: 'C', name: 'Temperate', desc: 'Coldest month average between -3°C and 18°C.' },
      letter2: { letter: 'f', name: 'Fully Humid (No dry season)', desc: 'Precipitation is evenly distributed throughout all 12 months.' },
      letter3: { letter: 'a', name: 'Hot Summer', desc: 'Warmest month average exceeds 22°C with high humidity.' },
      fullExplanation: 'Cfa climates (e.g. Tokyo, Milan, New York, Buenos Aires) have hot, muggy summers with frequent convective rain and moderate winters.'
    },
    Cfb: {
      code: 'Cfb',
      name: 'Oceanic (Maritime)',
      group: 'C: Temperate',
      letter1: { letter: 'C', name: 'Temperate', desc: 'Mild winter temperatures.' },
      letter2: { letter: 'f', name: 'Fully Humid', desc: 'Steady precipitation all year with no pronounced dry season.' },
      letter3: { letter: 'b', name: 'Warm/Mild Summer', desc: 'Cool to mild summers with all months under 22°C average.' },
      fullExplanation: 'Cfb climates (e.g. London, Paris, Berlin, Melbourne) feature frequent overcast skies, steady moderate rainfall, and moderate year-round temperatures.'
    },
    BSh: {
      code: 'BSh',
      name: 'Hot Semi-Arid (Steppe)',
      group: 'B: Arid',
      letter1: { letter: 'B', name: 'Arid / Semi-Arid', desc: 'Annual precipitation is lower than potential evapotranspiration.' },
      letter2: { letter: 'S', name: 'Steppe / Semi-Arid', desc: 'Intermediate precipitation between desert and humid climates.' },
      letter3: { letter: 'h', name: 'Hot', desc: 'Mean annual temperature exceeds 18°C.' },
      fullExplanation: 'BSh climates experience intense year-round heat and low rainfall, leading to high aquifer stress and dust vulnerability.'
    },
    BSk: {
      code: 'BSk',
      name: 'Cold Semi-Arid',
      group: 'B: Arid',
      letter1: { letter: 'B', name: 'Arid / Semi-Arid', desc: 'Low annual rainfall.' },
      letter2: { letter: 'S', name: 'Steppe', desc: 'Dry grassland climate.' },
      letter3: { letter: 'k', name: 'Cold', desc: 'Mean annual temperature below 18°C with cold winters.' },
      fullExplanation: 'BSk climates (e.g. Zaragoza, Denver, Ankara) feature cold winters, hot dry summers, and high daily thermal range.'
    },
    BWh: {
      code: 'BWh',
      name: 'Hot Desert',
      group: 'B: Arid',
      letter1: { letter: 'B', name: 'Arid', desc: 'Severe moisture deficit.' },
      letter2: { letter: 'W', name: 'Desert (Wüste)', desc: 'Extremely scarce rainfall (< 200mm/yr).' },
      letter3: { letter: 'h', name: 'Hot', desc: 'Mean annual temperature above 18°C.' },
      fullExplanation: 'BWh climates (e.g. Dubai, Cairo, Phoenix) endure extreme scorching heat, minimal cloud cover, and acute water scarcity.'
    },
    Dfa: {
      code: 'Dfa',
      name: 'Hot-summer Continental',
      group: 'D: Continental',
      letter1: { letter: 'D', name: 'Continental (Microthermal)', desc: 'Coldest month average below -3°C (freezing winters).' },
      letter2: { letter: 'f', name: 'Fully Humid', desc: 'No dry season; snow in winter and rain in summer.' },
      letter3: { letter: 'a', name: 'Hot Summer', desc: 'Warmest month exceeds 22°C.' },
      fullExplanation: 'Dfa climates (e.g. Chicago, Boston) experience massive annual temperature swings from sub-zero snowy winters to sweltering humid summers.'
    },
    Aw: {
      code: 'Aw',
      name: 'Tropical Savanna',
      group: 'A: Tropical',
      letter1: { letter: 'A', name: 'Tropical (Megathermal)', desc: 'Every month average temperature is above 18°C.' },
      letter2: { letter: 'w', name: 'Winter Dry Season', desc: 'Pronounced dry season during the low-sun winter months (< 60mm in driest month).' },
      fullExplanation: 'Aw climates (e.g. Rio de Janeiro, Mumbai, Bangkok) have year-round high heat with intense summer monsoon rain and dry winter periods.'
    },
    Af: {
      code: 'Af',
      name: 'Tropical Rainforest',
      group: 'A: Tropical',
      letter1: { letter: 'A', name: 'Tropical', desc: 'Every month above 18°C.' },
      letter2: { letter: 'f', name: 'Fully Humid Rainforest', desc: 'Every month receives at least 60mm of rainfall.' },
      fullExplanation: 'Af climates (e.g. Singapore, Jakarta) experience constant equatorial heat, heavy convective downpours, and high humidity throughout the year.'
    },
    Am: {
      code: 'Am',
      name: 'Tropical Monsoon',
      group: 'A: Tropical',
      letter1: { letter: 'A', name: 'Tropical (Megathermal)', desc: 'Every month average temperature is above 18°C.' },
      letter2: { letter: 'm', name: 'Monsoon', desc: 'A short dry season more than compensated for by very heavy monsoon rainfall in the rest of the year.' },
      fullExplanation: 'Am climates (e.g. Mumbai, Manila) combine year-round tropical heat with an intense monsoon season and a brief, comparatively drier winter.'
    },
    As: {
      code: 'As',
      name: 'Tropical Savanna (Dry Summer)',
      group: 'A: Tropical',
      letter1: { letter: 'A', name: 'Tropical (Megathermal)', desc: 'Every month average temperature is above 18°C.' },
      letter2: { letter: 's', name: 'Dry Summer', desc: 'A pronounced dry season during the high-sun summer months, the reverse pattern of the more common Aw.' },
      fullExplanation: 'As climates (e.g. Honolulu) stay warm year-round but see their driest stretch in summer rather than winter, an uncommon tropical rainfall pattern.'
    },
    Cwa: {
      code: 'Cwa',
      name: 'Monsoon Humid Subtropical',
      group: 'C: Temperate',
      letter1: { letter: 'C', name: 'Temperate (Mesothermal)', desc: 'Average temperature of coldest month between -3°C and 18°C.' },
      letter2: { letter: 'w', name: 'Dry Winter', desc: 'Precipitation in the driest winter month is less than one-tenth of the wettest summer month.' },
      letter3: { letter: 'a', name: 'Hot Summer', desc: 'Warmest month average temperature is above 22°C.' },
      fullExplanation: 'Cwa climates (e.g. Hong Kong, Delhi) have hot, humid, monsoon-fed summers and mild, markedly drier winters.'
    },
    Cwb: {
      code: 'Cwb',
      name: 'Subtropical Highland',
      group: 'C: Temperate',
      letter1: { letter: 'C', name: 'Temperate', desc: 'Coldest month average between -3°C and 18°C, moderated by elevation.' },
      letter2: { letter: 'w', name: 'Dry Winter', desc: 'A pronounced dry season during the low-sun winter months.' },
      letter3: { letter: 'b', name: 'Warm Summer', desc: 'Warmest month average below 22°C, tempered by high altitude.' },
      fullExplanation: 'Cwb climates (e.g. Nairobi, Mexico City, Johannesburg) pair mild, spring-like temperatures year-round with a distinct dry winter, typical of tropical highland plateaus.'
    },
    Dfb: {
      code: 'Dfb',
      name: 'Warm-summer Humid Continental',
      group: 'D: Continental',
      letter1: { letter: 'D', name: 'Continental (Microthermal)', desc: 'Coldest month average below -3°C (freezing winters).' },
      letter2: { letter: 'f', name: 'Fully Humid', desc: 'No dry season; precipitation falls year-round as rain and snow.' },
      letter3: { letter: 'b', name: 'Warm Summer', desc: 'Warmest month average below 22°C, but at least 4 months above 10°C.' },
      fullExplanation: 'Dfb climates (e.g. Toronto, Warsaw, Stockholm) see cold, snowy winters give way to warm but not extreme summers, with rainfall spread across the year.'
    },
    Dwa: {
      code: 'Dwa',
      name: 'Monsoon Humid Continental',
      group: 'D: Continental',
      letter1: { letter: 'D', name: 'Continental', desc: 'Coldest month average below -3°C.' },
      letter2: { letter: 'w', name: 'Dry Winter', desc: 'Winter precipitation is a small fraction of the wettest summer month, driven by the winter monsoon.' },
      letter3: { letter: 'a', name: 'Hot Summer', desc: 'Warmest month average exceeds 22°C.' },
      fullExplanation: 'Dwa climates (e.g. Seoul, Beijing) endure cold, dry winters under the East Asian winter monsoon and hot, humid, rain-drenched summers.'
    },
    Dwb: {
      code: 'Dwb',
      name: 'Monsoon Warm-summer Humid Continental',
      group: 'D: Continental',
      letter1: { letter: 'D', name: 'Continental', desc: 'Coldest month average below -3°C.' },
      letter2: { letter: 'w', name: 'Dry Winter', desc: 'A sharply drier winter driven by the seasonal monsoon, contrasted with a wetter summer.' },
      letter3: { letter: 'b', name: 'Warm Summer', desc: 'Warmest month average below 22°C, with at least 4 months above 10°C.' },
      fullExplanation: 'Dwb climates (e.g. Ulaanbaatar) combine some of the coldest winters of any major city with a brief, milder, comparatively wetter summer.'
    },
    Dfc: {
      code: 'Dfc',
      name: 'Subarctic (Boreal)',
      group: 'D: Continental',
      letter1: { letter: 'D', name: 'Continental', desc: 'Coldest month average below -3°C, with severe winter cold.' },
      letter2: { letter: 'f', name: 'Fully Humid', desc: 'No dry season; precipitation falls year-round, much of it as snow.' },
      letter3: { letter: 'c', name: 'Cold Summer', desc: 'Warmest month average below 22°C, and fewer than 4 months above 10°C.' },
      fullExplanation: 'Dfc climates (e.g. Anchorage) have short, cool summers and long, severe winters typical of high-latitude boreal and taiga regions.'
    },
    BWk: {
      code: 'BWk',
      name: 'Cold Desert',
      group: 'B: Arid',
      letter1: { letter: 'B', name: 'Arid', desc: 'Severe moisture deficit; potential evapotranspiration exceeds precipitation.' },
      letter2: { letter: 'W', name: 'Desert (Wüste)', desc: 'Extremely scarce rainfall (< 200mm/yr).' },
      letter3: { letter: 'k', name: 'Cold', desc: 'Mean annual temperature below 18°C, often with sharply below-freezing winters.' },
      fullExplanation: 'BWk climates (e.g. Urumqi, Ashgabat) combine desert-level aridity with cold, often sub-zero winters and a wide daily and seasonal temperature swing.'
    },
    Cwc: {
      code: 'Cwc',
      name: 'Cold Subtropical Highland',
      group: 'C: Temperate',
      letter1: { letter: 'C', name: 'Temperate', desc: 'Coldest month average between -3°C and 18°C, moderated here by very high elevation.' },
      letter2: { letter: 'w', name: 'Dry Winter', desc: 'A pronounced dry season during the low-sun winter months.' },
      letter3: { letter: 'c', name: 'Cold Summer', desc: 'Warmest month average below 22°C, and fewer than 4 months above 10°C.' },
      fullExplanation: 'Cwc climates (e.g. Potosí) occur on the highest tropical and subtropical plateaus, where altitude keeps every month cool to cold despite a low latitude, with a sharply drier winter.'
    },
    Dsa: {
      code: 'Dsa',
      name: 'Hot-summer Continental (Dry Summer)',
      group: 'D: Continental',
      letter1: { letter: 'D', name: 'Continental (Microthermal)', desc: 'Coldest month average below -3°C (freezing winters).' },
      letter2: { letter: 's', name: 'Dry Summer', desc: 'Precipitation in the driest summer month is well below the wettest winter month.' },
      letter3: { letter: 'a', name: 'Hot Summer', desc: 'Warmest month average temperature is above 22°C.' },
      fullExplanation: 'Dsa climates (e.g. Bishkek) pair cold, snowy continental winters with a hot, markedly dry summer — an unusual combination found mostly in inland basins ringed by mountains.'
    }
  },
  it: {
    Csa: {
      code: 'Csa',
      name: 'Clima Mediterraneo a estate calda',
      group: 'C: Temperato',
      letter1: { letter: 'C', name: 'Temperato (Mesotermico)', desc: 'Temperatura media del mese più freddo compresa tra -3°C e 18°C.' },
      letter2: { letter: 's', name: 'Estate Secca (Dry Summer)', desc: 'Precipitazioni nel mese estivo più secco < 30mm e meno di 1/3 del mese invernale più piovoso.' },
      letter3: { letter: 'a', name: 'Estate Calda', desc: 'Temperatura media del mese più caldo superiore a 22°C.' },
      fullExplanation: 'Il Csa è il classico clima mediterraneo (es. Roma, Madrid, Atene, Barcellona): inverni miti e piovosi, estati torride e siccitose con elevato rischio di ondate di calore e forte isola di calore urbana.'
    },
    Csb: {
      code: 'Csb',
      name: 'Clima Mediterraneo a estate tiepida',
      group: 'C: Temperato',
      letter1: { letter: 'C', name: 'Temperato', desc: 'Inverni miti con temperature medie superiori a -3°C.' },
      letter2: { letter: 's', name: 'Estate Secca', desc: 'Siccità estiva marcata.' },
      letter3: { letter: 'b', name: 'Estate Tiepida', desc: 'Mese più caldo inferiore a 22°C per influenza delle brezze oceaniche o altitudine.' },
      fullExplanation: 'Il Csb (es. San Francisco, Porto, Città del Capo costiera) mantiene estati asciutte ma con temperature moderate dall\'oceano o dalle brezze costiere.'
    },
    Cfa: {
      code: 'Cfa',
      name: 'Clima Subtropicale Umido',
      group: 'C: Temperato',
      letter1: { letter: 'C', name: 'Temperato', desc: 'Mese più freddo compreso tra -3°C e 18°C.' },
      letter2: { letter: 'f', name: 'Sempre Umido (Fully Humid)', desc: 'Precipitazioni distribuite in tutti i 12 mesi senza stagione secca.' },
      letter3: { letter: 'a', name: 'Estate Calda', desc: 'Mese più caldo superiore a 22°C con elevata umidità relativa.' },
      fullExplanation: 'Il Cfa (es. Milano, Bologna, Tokyo, New York) presenta estati calde e afose, piogge regolari tutto l\'anno e frequente ristagno atmosferico in pianura.'
    },
    Cfb: {
      code: 'Cfb',
      name: 'Clima Oceanico (Temperato fresco)',
      group: 'C: Temperato',
      letter1: { letter: 'C', name: 'Temperato', desc: 'Inverni miti senza gelo persistente.' },
      letter2: { letter: 'f', name: 'Sempre Umido', desc: 'Piogge costanti durante tutto l\'anno.' },
      letter3: { letter: 'b', name: 'Estate Fresca/Mite', desc: 'Mese più caldo sotto i 22°C di media.' },
      fullExplanation: 'Il Cfb (es. Londra, Parigi, Berlino) è caratterizzato da frequente nuvolosità, piogge frequenti e modeste escursioni termiche.'
    },
    BSh: {
      code: 'BSh',
      name: 'Clima Semi-Arido Caldo (Steppa calda)',
      group: 'B: Arido',
      letter1: { letter: 'B', name: 'Arido / Semi-Arido', desc: 'Precipitazioni inferiori all\'evapotraspirazione potenziale.' },
      letter2: { letter: 'S', name: 'Steppa', desc: 'Fascia di transizione semiarida.' },
      letter3: { letter: 'h', name: 'Caldo', desc: 'Temperatura media annuale superiore a 18°C.' },
      fullExplanation: 'Il BSh presenta forte stress idrico, estati molto calde e precipitazioni scarse concentrate in brevi periodi.'
    },
    BSk: {
      code: 'BSk',
      name: 'Clima Semi-Arido Freddo',
      group: 'B: Arido',
      letter1: { letter: 'B', name: 'Arido', desc: 'Bassa piovosità annuale.' },
      letter2: { letter: 'S', name: 'Steppa', desc: 'Vegetazione steppica e suoli aridi.' },
      letter3: { letter: 'k', name: 'Freddo', desc: 'Temperatura media annuale inferiore a 18°C con inverni rigidi.' },
      fullExplanation: 'Il BSk (es. Saragozza, Ankara) ha inverni freddi, estati aride e forte escursione termica giorno/notte.'
    },
    BWh: {
      code: 'BWh',
      name: 'Clima Desertico Caldo',
      group: 'B: Arido',
      letter1: { letter: 'B', name: 'Arido', desc: 'Deficit idrico estremo.' },
      letter2: { letter: 'W', name: 'Deserto (Wüste)', desc: 'Precipitazioni inferiori a 200 mm/anno.' },
      letter3: { letter: 'h', name: 'Caldo', desc: 'Temperatura media annua > 18°C con picchi estivi > 45°C.' },
      fullExplanation: 'Il BWh (es. Dubai, Cairo) è dominato da caldo estremo, totale assenza di nubi e forte dipendenza dalla desalinizzazione.'
    },
    Dfa: {
      code: 'Dfa',
      name: 'Clima Continentale a estate calda',
      group: 'D: Continentale',
      letter1: { letter: 'D', name: 'Continentale', desc: 'Mese più freddo inferiore a -3°C (inverni con neve e gelo).' },
      letter2: { letter: 'f', name: 'Sempre Umido', desc: 'Nessuna stagione secca.' },
      letter3: { letter: 'a', name: 'Estate Calda', desc: 'Mese più caldo superiore a 22°C.' },
      fullExplanation: 'Il Dfa (es. Chicago) presenta forti escursioni tra inverni gelidi sotto zero ed estati molto calde e umide.'
    },
    Aw: {
      code: 'Aw',
      name: 'Clima Tropicale della Savana',
      group: 'A: Tropicale',
      letter1: { letter: 'A', name: 'Tropicale', desc: 'Tutti i 12 mesi con temperatura media superiore a 18°C.' },
      letter2: { letter: 'w', name: 'Stagione Secca Invernale', desc: 'Stagione asciutta marcata nei mesi a basso irraggiamento solare.' },
      fullExplanation: 'L\'Aw (es. Rio de Janeiro, Mumbai) ha caldo perenne con monsone piovoso estivo e periodo asciutto invernale.'
    },
    Af: {
      code: 'Af',
      name: 'Clima Equatoriale / Foresta Pluviale',
      group: 'A: Tropicale',
      letter1: { letter: 'A', name: 'Tropicale', desc: 'Caldo perenne sopra i 18°C in ogni mese.' },
      letter2: { letter: 'f', name: 'Sempre Piovoso', desc: 'Almeno 60mm di pioggia in ogni singolo mese dell\'anno.' },
      fullExplanation: 'L\'Af (es. Singapore, Giacarta) presenta calore costante, temporali convettivi quotidiani ed umidità elevatissima.'
    },
    Am: {
      code: 'Am',
      name: 'Clima Monsonico Tropicale',
      group: 'A: Tropicale',
      letter1: { letter: 'A', name: 'Tropicale', desc: 'Temperatura media superiore a 18°C in ogni mese.' },
      letter2: { letter: 'm', name: 'Monsonico', desc: 'Breve stagione secca ampiamente compensata da piogge monsoniche molto intense nel resto dell\'anno.' },
      fullExplanation: 'L\'Am (es. Mumbai, Manila) unisce caldo tropicale costante a un\'intensa stagione monsonica e un inverno breve e relativamente più secco.'
    },
    As: {
      code: 'As',
      name: 'Clima Tropicale della Savana (Estate Secca)',
      group: 'A: Tropicale',
      letter1: { letter: 'A', name: 'Tropicale', desc: 'Temperatura media superiore a 18°C in ogni mese.' },
      letter2: { letter: 's', name: 'Estate Secca', desc: 'Stagione secca marcata nei mesi estivi ad alto irraggiamento, l\'opposto del più comune Aw.' },
      fullExplanation: 'L\'As (es. Honolulu) resta caldo tutto l\'anno ma registra il periodo più secco in estate anziché in inverno, un raro schema pluviometrico tropicale.'
    },
    Cwa: {
      code: 'Cwa',
      name: 'Clima Subtropicale Umido Monsonico',
      group: 'C: Temperato',
      letter1: { letter: 'C', name: 'Temperato', desc: 'Mese più freddo compreso tra -3°C e 18°C.' },
      letter2: { letter: 'w', name: 'Inverno Secco', desc: 'Precipitazioni nel mese invernale più secco inferiori a un decimo del mese estivo più piovoso.' },
      letter3: { letter: 'a', name: 'Estate Calda', desc: 'Temperatura media del mese più caldo superiore a 22°C.' },
      fullExplanation: 'Il Cwa (es. Hong Kong, Delhi) ha estati calde e umide dominate dal monsone e inverni miti e marcatamente più secchi.'
    },
    Cwb: {
      code: 'Cwb',
      name: 'Clima Subtropicale d\'Altopiano',
      group: 'C: Temperato',
      letter1: { letter: 'C', name: 'Temperato', desc: 'Mese più freddo tra -3°C e 18°C, mitigato dall\'altitudine.' },
      letter2: { letter: 'w', name: 'Inverno Secco', desc: 'Stagione secca marcata nei mesi invernali a basso irraggiamento.' },
      letter3: { letter: 'b', name: 'Estate Tiepida', desc: 'Mese più caldo inferiore a 22°C, temperato dall\'alta quota.' },
      fullExplanation: 'Il Cwb (es. Nairobi, Città del Messico, Johannesburg) mantiene temperature miti quasi primaverili tutto l\'anno con un inverno nettamente più secco, tipico degli altopiani tropicali.'
    },
    Dfb: {
      code: 'Dfb',
      name: 'Clima Continentale a estate tiepida',
      group: 'D: Continentale',
      letter1: { letter: 'D', name: 'Continentale', desc: 'Mese più freddo inferiore a -3°C (inverni gelidi).' },
      letter2: { letter: 'f', name: 'Sempre Umido', desc: 'Nessuna stagione secca; precipitazioni tutto l\'anno come pioggia e neve.' },
      letter3: { letter: 'b', name: 'Estate Tiepida', desc: 'Mese più caldo sotto i 22°C, ma almeno 4 mesi sopra i 10°C.' },
      fullExplanation: 'Il Dfb (es. Toronto, Varsavia, Stoccolma) alterna inverni freddi e nevosi a estati miti ma non estreme, con piogge distribuite tutto l\'anno.'
    },
    Dwa: {
      code: 'Dwa',
      name: 'Clima Continentale Monsonico a estate calda',
      group: 'D: Continentale',
      letter1: { letter: 'D', name: 'Continentale', desc: 'Mese più freddo inferiore a -3°C.' },
      letter2: { letter: 'w', name: 'Inverno Secco', desc: 'Precipitazioni invernali minime per effetto del monsone invernale.' },
      letter3: { letter: 'a', name: 'Estate Calda', desc: 'Mese più caldo superiore a 22°C.' },
      fullExplanation: 'Il Dwa (es. Seoul, Pechino) affronta inverni freddi e secchi sotto il monsone invernale dell\'Asia orientale ed estati calde, umide e piovose.'
    },
    Dwb: {
      code: 'Dwb',
      name: 'Clima Continentale Monsonico a estate tiepida',
      group: 'D: Continentale',
      letter1: { letter: 'D', name: 'Continentale', desc: 'Mese più freddo inferiore a -3°C.' },
      letter2: { letter: 'w', name: 'Inverno Secco', desc: 'Inverno nettamente più secco per effetto del monsone stagionale, in contrasto con un\'estate più piovosa.' },
      letter3: { letter: 'b', name: 'Estate Tiepida', desc: 'Mese più caldo sotto i 22°C, con almeno 4 mesi sopra i 10°C.' },
      fullExplanation: 'Il Dwb (es. Ulan Bator) combina uno degli inverni più rigidi tra le città abitate del pianeta con un\'estate breve, più mite e relativamente più piovosa.'
    },
    Dfc: {
      code: 'Dfc',
      name: 'Clima Subartico (Boreale)',
      group: 'D: Continentale',
      letter1: { letter: 'D', name: 'Continentale', desc: 'Mese più freddo inferiore a -3°C, con freddo invernale intenso.' },
      letter2: { letter: 'f', name: 'Sempre Umido', desc: 'Nessuna stagione secca; precipitazioni tutto l\'anno, in gran parte nevose.' },
      letter3: { letter: 'c', name: 'Estate Fredda', desc: 'Mese più caldo sotto i 22°C, e meno di 4 mesi sopra i 10°C.' },
      fullExplanation: 'Il Dfc (es. Anchorage) presenta estati brevi e fresche e inverni lunghi e rigidissimi, tipici delle regioni boreali di alta latitudine.'
    },
    BWk: {
      code: 'BWk',
      name: 'Clima Desertico Freddo',
      group: 'B: Arido',
      letter1: { letter: 'B', name: 'Arido', desc: 'Grave deficit idrico; l\'evapotraspirazione potenziale supera le precipitazioni.' },
      letter2: { letter: 'W', name: 'Deserto (Wüste)', desc: 'Precipitazioni estremamente scarse (< 200 mm/anno).' },
      letter3: { letter: 'k', name: 'Freddo', desc: 'Temperatura media annuale inferiore a 18°C, spesso con inverni sotto lo zero.' },
      fullExplanation: 'Il BWk (es. Urumqi, Ashgabat) unisce l\'aridità tipica del deserto a inverni freddi, spesso sotto zero, con una forte escursione termica giornaliera e stagionale.'
    },
    Cwc: {
      code: 'Cwc',
      name: 'Clima Subtropicale d\'Altopiano Freddo',
      group: 'C: Temperato',
      letter1: { letter: 'C', name: 'Temperato', desc: 'Mese più freddo tra -3°C e 18°C, mitigato qui dall\'altissima quota.' },
      letter2: { letter: 'w', name: 'Inverno Secco', desc: 'Stagione secca marcata nei mesi invernali a basso irraggiamento.' },
      letter3: { letter: 'c', name: 'Estate Fredda', desc: 'Mese più caldo sotto i 22°C, e meno di 4 mesi sopra i 10°C.' },
      fullExplanation: 'Il Cwc (es. Potosí) si trova sugli altopiani tropicali e subtropicali più elevati, dove l\'altitudine mantiene ogni mese fresco o freddo nonostante la bassa latitudine, con un inverno nettamente più secco.'
    },
    Dsa: {
      code: 'Dsa',
      name: 'Clima Continentale a estate calda e secca',
      group: 'D: Continentale',
      letter1: { letter: 'D', name: 'Continentale', desc: 'Mese più freddo inferiore a -3°C (inverni gelidi).' },
      letter2: { letter: 's', name: 'Estate Secca', desc: 'Precipitazioni nel mese estivo più secco nettamente inferiori al mese invernale più piovoso.' },
      letter3: { letter: 'a', name: 'Estate Calda', desc: 'Mese più caldo superiore a 22°C.' },
      fullExplanation: 'Il Dsa (es. Bishkek) abbina inverni continentali freddi e nevosi a un\'estate calda e marcatamente secca, una combinazione rara tipica di bacini interni circondati da montagne.'
    }
  },
  es: {
    Csa: {
      code: 'Csa',
      name: 'Clima Mediterráneo con verano caluroso',
      group: 'C: Templado',
      letter1: { letter: 'C', name: 'Templado (Mesotérmico)', desc: 'Temperatura media del mes más frío entre -3°C y 18°C.' },
      letter2: { letter: 's', name: 'Verano Seco (Dry Summer)', desc: 'Precipitación en el mes más seco < 30mm y menos de 1/3 del mes invernal más húmedo.' },
      letter3: { letter: 'a', name: 'Verano Caluroso', desc: 'Temperatura media del mes más cálido superior a 22°C.' },
      fullExplanation: 'El Csa es el clima mediterráneo típico (ej. Madrid, Barcelona, Sevilla, Roma): inviernos suaves y húmedos, veranos muy calurosos y secos con alta vulnerabilidad a olas de calor e isla de calor urbana.'
    },
    Csb: {
      code: 'Csb',
      name: 'Clima Mediterráneo con verano suave',
      group: 'C: Templado',
      letter1: { letter: 'C', name: 'Templado', desc: 'Inviernos suaves con temperaturas medias sobre -3°C.' },
      letter2: { letter: 's', name: 'Verano Seco', desc: 'Sequía estival marcada.' },
      letter3: { letter: 'b', name: 'Verano Templado/Suave', desc: 'Mes más cálido inferior a 22°C por influencia marina o altitud.' },
      fullExplanation: 'El Csb (ej. San Francisco, Oporto, Vigo) mantiene veranos secos pero con temperaturas moderadas por brisas oceánicas.'
    },
    Cfa: {
      code: 'Cfa',
      name: 'Clima Subtropical Húmedo',
      group: 'C: Templado',
      letter1: { letter: 'C', name: 'Templado', desc: 'Mes más frío entre -3°C y 18°C.' },
      letter2: { letter: 'f', name: 'Sin estación seca (Fully Humid)', desc: 'Precipitaciones repartidas en los 12 meses del año.' },
      letter3: { letter: 'a', name: 'Verano Caluroso', desc: 'Mes más cálido superior a 22°C con alta humedad ambiental.' },
      fullExplanation: 'El Cfa (ej. Tokio, Milán, Nueva York, Buenos Aires) tiene veranos cálidos y bochornosos con lluvias regulares todo el año.'
    },
    Cfb: {
      code: 'Cfb',
      name: 'Clima Oceánico (Marítimo)',
      group: 'C: Templado',
      letter1: { letter: 'C', name: 'Templado', desc: 'Inviernos suaves sin heladas extremas prolongadas.' },
      letter2: { letter: 'f', name: 'Húmedo todo el año', desc: 'Lluvia constante y regular en todas las estaciones.' },
      letter3: { letter: 'b', name: 'Verano Suave/Fresco', desc: 'Mes más cálido por debajo de 22°C de media.' },
      fullExplanation: 'El Cfb (ej. Londres, París, Berlín, Bilbao) destaca por nubosidad frecuente, precipitaciones constantes y baja oscilación térmica.'
    },
    BSh: {
      code: 'BSh',
      name: 'Clima Semiárido Cálido (Estepario cálido)',
      group: 'B: Árido',
      letter1: { letter: 'B', name: 'Árido / Semiárido', desc: 'Precipitación anual inferior a la evapotranspiración potencial.' },
      letter2: { letter: 'S', name: 'Estepa', desc: 'Precipitación intermedia entre desierto y clima húmedo.' },
      letter3: { letter: 'h', name: 'Cálido', desc: 'Temperatura media anual superior a 18°C.' },
      fullExplanation: 'El BSh (ej. Murcia, Alicante, Marrakech) sufre sequías prolongadas, veranos muy calurosos y elevado estrés hídrico.'
    },
    BSk: {
      code: 'BSk',
      name: 'Clima Semiárido Frío',
      group: 'B: Árido',
      letter1: { letter: 'B', name: 'Árido', desc: 'Baja precipitación anual.' },
      letter2: { letter: 'S', name: 'Estepa', desc: 'Suelos áridos y vegetación esteparia.' },
      letter3: { letter: 'k', name: 'Frío', desc: 'Temperatura media anual inferior a 18°C con inviernos fríos.' },
      fullExplanation: 'El BSk (ej. Zaragoza, Denver, Ankara) tiene inviernos fríos, veranos secos y gran amplitud térmica diaria.'
    },
    BWh: {
      code: 'BWh',
      name: 'Clima Desértico Cálido',
      group: 'B: Árido',
      letter1: { letter: 'B', name: 'Árido', desc: 'Déficit hídrico extremo.' },
      letter2: { letter: 'W', name: 'Desierto (Wüste)', desc: 'Precipitaciones inferiores a 200 mm/año.' },
      letter3: { letter: 'h', name: 'Cálido', desc: 'Temperatura media anual superior a 18°C.' },
      fullExplanation: 'El BWh (ej. Dubái, El Cairo, Phoenix) presenta calor extremo diurno, radiación solar máxima y ausencia de lluvia.'
    },
    Dfa: {
      code: 'Dfa',
      name: 'Clima Continental con verano caluroso',
      group: 'D: Continental',
      letter1: { letter: 'D', name: 'Continental', desc: 'Mes más frío por debajo de -3°C (inviernos con nieve y heladas persistentes).' },
      letter2: { letter: 'f', name: 'Sin estación seca', desc: 'Precipitación regular a lo largo del año.' },
      letter3: { letter: 'a', name: 'Verano Caluroso', desc: 'Mes más cálido superior a 22°C.' },
      fullExplanation: 'El Dfa (ej. Chicago) presenta un contraste estacional extremo entre inviernos gélidos bajo cero y veranos muy calurosos.'
    },
    Aw: {
      code: 'Aw',
      name: 'Clima Tropical de Sabana',
      group: 'A: Tropical',
      letter1: { letter: 'A', name: 'Tropical', desc: 'Todos los meses tienen temperatura media superior a 18°C.' },
      letter2: { letter: 'w', name: 'Estación Seca en Invierno', desc: 'Temporada seca marcada durante los meses invernales de bajo sol.' },
      fullExplanation: 'El Aw (ej. Río de Janeiro, Bombay) mantiene calor constante con lluvias torrenciales estivales y sequía en invierno.'
    },
    Af: {
      code: 'Af',
      name: 'Clima Ecuatorial / Selva Tropical',
      group: 'A: Tropical',
      letter1: { letter: 'A', name: 'Tropical', desc: 'Calor perenne por encima de 18°C en todos los meses.' },
      letter2: { letter: 'f', name: 'Húmedo permanente', desc: 'Al menos 60mm de lluvia en cada uno de los 12 meses.' },
      fullExplanation: 'El Af (ej. Singapur, Yakarta) se caracteriza por calor incesante, alta humedad y tormentas vespertinas continuas.'
    },
    Am: {
      code: 'Am',
      name: 'Clima Monzónico Tropical',
      group: 'A: Tropical',
      letter1: { letter: 'A', name: 'Tropical', desc: 'Temperatura media superior a 18°C en todos los meses.' },
      letter2: { letter: 'm', name: 'Monzónico', desc: 'Breve estación seca ampliamente compensada por lluvias monzónicas muy intensas el resto del año.' },
      fullExplanation: 'El Am (ej. Bombay, Manila) combina calor tropical constante con una intensa temporada de monzón y un invierno breve y relativamente más seco.'
    },
    As: {
      code: 'As',
      name: 'Clima Tropical de Sabana (Verano Seco)',
      group: 'A: Tropical',
      letter1: { letter: 'A', name: 'Tropical', desc: 'Temperatura media superior a 18°C en todos los meses.' },
      letter2: { letter: 's', name: 'Verano Seco', desc: 'Estación seca marcada durante los meses de verano de alto sol, el patrón inverso del más común Aw.' },
      fullExplanation: 'El As (ej. Honolulu) se mantiene cálido todo el año pero registra su periodo más seco en verano en lugar de invierno, un patrón pluviométrico tropical poco común.'
    },
    Cwa: {
      code: 'Cwa',
      name: 'Clima Subtropical Húmedo Monzónico',
      group: 'C: Templado',
      letter1: { letter: 'C', name: 'Templado', desc: 'Mes más frío entre -3°C y 18°C.' },
      letter2: { letter: 'w', name: 'Invierno Seco', desc: 'Precipitación del mes invernal más seco inferior a un décimo del mes estival más lluvioso.' },
      letter3: { letter: 'a', name: 'Verano Caluroso', desc: 'Temperatura media del mes más cálido superior a 22°C.' },
      fullExplanation: 'El Cwa (ej. Hong Kong, Delhi) tiene veranos calurosos y húmedos dominados por el monzón e inviernos suaves y marcadamente más secos.'
    },
    Cwb: {
      code: 'Cwb',
      name: 'Clima Subtropical de Altiplano',
      group: 'C: Templado',
      letter1: { letter: 'C', name: 'Templado', desc: 'Mes más frío entre -3°C y 18°C, moderado por la altitud.' },
      letter2: { letter: 'w', name: 'Invierno Seco', desc: 'Estación seca marcada durante los meses invernales de bajo sol.' },
      letter3: { letter: 'b', name: 'Verano Templado', desc: 'Mes más cálido inferior a 22°C, atemperado por la altura.' },
      fullExplanation: 'El Cwb (ej. Nairobi, Ciudad de México, Johannesburgo) mantiene temperaturas suaves casi primaverales todo el año con un invierno claramente más seco, típico de los altiplanos tropicales.'
    },
    Dfb: {
      code: 'Dfb',
      name: 'Clima Continental con verano templado',
      group: 'D: Continental',
      letter1: { letter: 'D', name: 'Continental', desc: 'Mes más frío por debajo de -3°C (inviernos gélidos).' },
      letter2: { letter: 'f', name: 'Sin estación seca', desc: 'Precipitación regular todo el año, como lluvia y nieve.' },
      letter3: { letter: 'b', name: 'Verano Templado', desc: 'Mes más cálido por debajo de 22°C, con al menos 4 meses sobre 10°C.' },
      fullExplanation: 'El Dfb (ej. Toronto, Varsovia, Estocolmo) alterna inviernos fríos y nevados con veranos templados pero no extremos, con lluvias repartidas todo el año.'
    },
    Dwa: {
      code: 'Dwa',
      name: 'Clima Continental Monzónico con verano caluroso',
      group: 'D: Continental',
      letter1: { letter: 'D', name: 'Continental', desc: 'Mes más frío por debajo de -3°C.' },
      letter2: { letter: 'w', name: 'Invierno Seco', desc: 'Precipitación invernal mínima por efecto del monzón de invierno.' },
      letter3: { letter: 'a', name: 'Verano Caluroso', desc: 'Mes más cálido superior a 22°C.' },
      fullExplanation: 'El Dwa (ej. Seúl, Pekín) soporta inviernos fríos y secos bajo el monzón invernal del este asiático y veranos calurosos, húmedos y lluviosos.'
    },
    Dwb: {
      code: 'Dwb',
      name: 'Clima Continental Monzónico con verano templado',
      group: 'D: Continental',
      letter1: { letter: 'D', name: 'Continental', desc: 'Mes más frío por debajo de -3°C.' },
      letter2: { letter: 'w', name: 'Invierno Seco', desc: 'Invierno claramente más seco por efecto del monzón estacional, en contraste con un verano más lluvioso.' },
      letter3: { letter: 'b', name: 'Verano Templado', desc: 'Mes más cálido por debajo de 22°C, con al menos 4 meses sobre 10°C.' },
      fullExplanation: 'El Dwb (ej. Ulán Bator) combina uno de los inviernos más rigurosos entre las ciudades habitadas del planeta con un verano breve, más suave y relativamente más lluvioso.'
    },
    Dfc: {
      code: 'Dfc',
      name: 'Clima Subártico (Boreal)',
      group: 'D: Continental',
      letter1: { letter: 'D', name: 'Continental', desc: 'Mes más frío por debajo de -3°C, con frío invernal severo.' },
      letter2: { letter: 'f', name: 'Sin estación seca', desc: 'Precipitación todo el año, en gran parte en forma de nieve.' },
      letter3: { letter: 'c', name: 'Verano Frío', desc: 'Mes más cálido por debajo de 22°C, y menos de 4 meses sobre 10°C.' },
      fullExplanation: 'El Dfc (ej. Anchorage) presenta veranos cortos y frescos e inviernos largos y muy severos, típicos de las regiones boreales de alta latitud.'
    },
    BWk: {
      code: 'BWk',
      name: 'Clima Desértico Frío',
      group: 'B: Árido',
      letter1: { letter: 'B', name: 'Árido', desc: 'Déficit hídrico severo; la evapotranspiración potencial supera la precipitación.' },
      letter2: { letter: 'W', name: 'Desierto (Wüste)', desc: 'Precipitaciones extremadamente escasas (< 200 mm/año).' },
      letter3: { letter: 'k', name: 'Frío', desc: 'Temperatura media anual inferior a 18°C, a menudo con inviernos bajo cero.' },
      fullExplanation: 'El BWk (ej. Urumqi, Asjabad) combina la aridez propia del desierto con inviernos fríos, a menudo bajo cero, y una amplia oscilación térmica diaria y estacional.'
    },
    Cwc: {
      code: 'Cwc',
      name: 'Clima Subtropical de Altiplano Frío',
      group: 'C: Templado',
      letter1: { letter: 'C', name: 'Templado', desc: 'Mes más frío entre -3°C y 18°C, moderado aquí por la altitud extrema.' },
      letter2: { letter: 'w', name: 'Invierno Seco', desc: 'Estación seca marcada durante los meses invernales de bajo sol.' },
      letter3: { letter: 'c', name: 'Verano Frío', desc: 'Mes más cálido por debajo de 22°C, y menos de 4 meses sobre 10°C.' },
      fullExplanation: 'El Cwc (ej. Potosí) se da en los altiplanos tropicales y subtropicales más elevados, donde la altitud mantiene cada mes fresco o frío pese a la baja latitud, con un invierno claramente más seco.'
    },
    Dsa: {
      code: 'Dsa',
      name: 'Clima Continental con verano caluroso y seco',
      group: 'D: Continental',
      letter1: { letter: 'D', name: 'Continental', desc: 'Mes más frío por debajo de -3°C (inviernos gélidos).' },
      letter2: { letter: 's', name: 'Verano Seco', desc: 'Precipitación del mes estival más seco muy inferior a la del mes invernal más lluvioso.' },
      letter3: { letter: 'a', name: 'Verano Caluroso', desc: 'Mes más cálido superior a 22°C.' },
      fullExplanation: 'El Dsa (ej. Biskek) combina inviernos continentales fríos y nevados con un verano caluroso y marcadamente seco, una combinación poco común típica de cuencas interiores rodeadas de montañas.'
    }
  }
};

export function getKoppenBreakdown(code: string, locale: Locale): KoppenBreakdown {
  const dict = KOPPEN_EXPLANATIONS[locale] || KOPPEN_EXPLANATIONS.en;
  if (dict[code]) return dict[code];

  // Generic fallback if not in common dictionary
  const g1 = code.charAt(0);
  const g2 = code.charAt(1);
  const g3 = code.charAt(2);

  return {
    code,
    name: code,
    group: g1 === 'A' ? 'A: Tropical' : g1 === 'B' ? 'B: Arid' : g1 === 'C' ? 'C: Temperate' : g1 === 'E' ? 'E: Polar' : 'D: Continental',
    letter1: { letter: g1, name: `Group ${g1}`, desc: 'Major climatic thermal zone.' },
    letter2: { letter: g2, name: `Precipitation ${g2}`, desc: 'Seasonal rainfall distribution pattern.' },
    letter3: g3 ? { letter: g3, name: `Temperature ${g3}`, desc: 'Summer thermal intensity tier.' } : undefined,
    fullExplanation: `Köppen climate classification code ${code}.`
  };
}
