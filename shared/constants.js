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
  calculationMethod: -1, // -1 means "auto"

  // Fetching settings defaults
  fetching: {
    monthsMax: 120,
    monthsMin: 1,
    monthsBefore: 24,
    monthsAfter: 24,
    autoFetchDays: 7,
  },
};
