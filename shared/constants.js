import { gettext } from "i18n";

export const ALADHAN_URL = "https://api.aladhan.com/v1/calendar";

export const ALADHAN_METHODS_URL = "https://api.aladhan.com/v1/methods";

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

export const SYNC_SETTINGS_LIST = [
  "prayerTimes",
  "lastPrayerTimesUpdate",
  "currentLocation",
  "calculationMethod",
  "autoFetchDays",
  ...TIMINGS_LIST.map((timing) => `display:${timing.name}`),
  ...TIMINGS_LIST.map((timing) => `notify:${timing.name}`),
];

export const DEFAULT_SETTINGS = {
  // Location defaults
  location: {
    country: "Egypt",
    city: "Cairo",
  },

  // Prayer settings defaults
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

  // Calculation method defaults
  calculationMethod: {
    id: -1,
    label: "Auto",
    name: gettext("calculation_method_auto"),
    params: {},
  },

  // Fetching settings defaults
  fetching: {
    monthsMax: 120,
    monthsMin: 1,
    monthsBefore: 12,
    monthsAfter: 12,
    automaticFetchInterval: 7,
  },
};
