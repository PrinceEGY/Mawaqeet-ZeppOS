export const TIMINGS_LIST = [
  { id: "fajr", label: "Fajr" },
  { id: "sunrise", label: "Sunrise" },
  { id: "dhuhr", label: "Dhuhr" },
  { id: "asr", label: "Asr" },
  { id: "maghrib", label: "Maghrib" },
  { id: "isha", label: "Isha" },
  { id: "midnight", label: "Midnight" },
  { id: "lastthird", label: "Last Third" },
];

export const PRAYER_ICONS = {
  fajr: "prayer icons/fajr.png",
  sunrise: "prayer icons/sunrise.png",
  dhuhr: "prayer icons/dhuhr.png",
  asr: "prayer icons/asr.png",
  maghrib: "prayer icons/maghrib.png",
  isha: "prayer icons/isha.png",
  midnight: "prayer icons/midnight.png",
  lastthird: "prayer icons/lastthird.png",
};

export const getPrayerLabel = (prayerId) => {
  const timing = TIMINGS_LIST.find((t) => t.id === prayerId);
  return timing ? timing.label : prayerId;
};

/**
 * Built-in calculation methods from the adhan package.
 * Key maps directly to CalculationMethod[key]() in adhan.
 */
export const CALCULATION_METHODS = [
  { id: "MuslimWorldLeague", label: "Muslim World League" },
  { id: "Egyptian", label: "Egyptian General Authority of Survey" },
  { id: "Karachi", label: "University of Islamic Sciences, Karachi" },
  { id: "UmmAlQura", label: "Umm Al-Qura University, Makkah" },
  { id: "Dubai", label: "Dubai" },
  { id: "MoonsightingCommittee", label: "Moonsighting Committee" },
  { id: "NorthAmerica", label: "Islamic Society of North America (ISNA)" },
  { id: "Kuwait", label: "Kuwait" },
  { id: "Qatar", label: "Qatar" },
  { id: "Singapore", label: "Singapore" },
  { id: "Tehran", label: "Institute of Geophysics, Tehran" },
  { id: "Turkey", label: "Diyanet İşleri Başkanlığı, Turkey" },
];

export const SYNC_SETTINGS_LIST = [
  "currentLocation",
  "calculationMethod",
  "allowAlarmOnSleep",
  ...TIMINGS_LIST.map((timing) => `display:${timing.id}`),
  ...TIMINGS_LIST.map((timing) => `notify:${timing.id}`),
  ...TIMINGS_LIST.map((timing) => `sound:${timing.id}`),
];

export const DEFAULT_SETTINGS = {
  allowAlarmOnSleep: true,

  location: {
    city: "Cairo",
    latitude: 30.0444,
    longitude: 31.2358,
    country: "Egypt",
    iso2: "EG",
    iso3: "EGY",
  },

  display: {
    fajr: true,
    sunrise: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    midnight: false,
    lastthird: false,
  },

  notify: {
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    midnight: false,
    lastthird: false,
  },

  sound: {
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    midnight: false,
    lastthird: false,
  },

  calculationMethod: {
    id: "Egyptian",
    label: "Egyptian General Authority of Survey",
  },
};
