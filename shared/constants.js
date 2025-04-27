export const ALADHAN_URL = "https://api.aladhan.com/v1/calendar";

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

const currentDate = new Date();
export const TWO_YEARS_BEFORE = new Date(
  new Date().setFullYear(currentDate.getFullYear() - 2)
);

export const TWO_YEARS_AFTER = new Date(
  new Date().setFullYear(currentDate.getFullYear() + 2)
);

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
};
