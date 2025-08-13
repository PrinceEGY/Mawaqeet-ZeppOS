export const ALADHAN_URL = "https://api.aladhan.com/v1/calendar";

export const ALADHAN_CALCULATION_METHODS_URL =
  "https://api.aladhan.com/v1/methods";

export const TIMINGS_LIST = [
  { name: "fajr", label: "Fajr" },
  { name: "sunrise", label: "Sunrise" },
  { name: "dhuhr", label: "Dhuhr" },
  { name: "asr", label: "Asr" },
  { name: "maghrib", label: "Maghrib" },
  { name: "isha", label: "Isha" },
  { name: "midnight", label: "Midnight" },
  { name: "lastthird", label: "Last Third" },
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

export const getPrayerLabel = (prayerName) => {
  const timing = TIMINGS_LIST.find((t) => t.name === prayerName);
  return timing ? timing.label : prayerName;
};

export const SYNC_SETTINGS_LIST = [
  "prayerTimes",
  "currentLocation",
  "calculationMethod",
  "fetchMetaData",
  ...TIMINGS_LIST.map((timing) => `display:${timing.name}`),
  ...TIMINGS_LIST.map((timing) => `notify:${timing.name}`),
];

export const DEFAULT_SETTINGS = {
  location: {
    country: "Egypt",
    city: "Cairo",
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

  calculationMethod: {
    id: -1,
    label: "Auto",
    name: "Auto (Recommended)",
    params: {},
  },

  fetching: {
    monthsMax: 120,
    monthsMin: 1,
    monthsBefore: 1,
    monthsAfter: 1,
    autoFetchInterval: 30,
  },
};
