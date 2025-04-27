import { GEO_RAW } from "./geo-raw.js";

export class City {
  constructor(city, latitude, longitude, country, iso2, iso3) {
    this.city = city;
    this.latitude = latitude;
    this.longitude = longitude;
    this.country = country;
    this.iso2 = iso2;
    this.iso3 = iso3;
  }

  static fromObject(data) {
    return new City(
      data.city,
      data.latitude,
      data.longitude,
      data.country,
      data.iso2,
      data.iso3
    );
  }
}

export class GeoService {
  static GEO_RAW = GEO_RAW;

  static COUNTRIES = [
    ...new Set(GeoService.GEO_RAW.map((entry) => entry.country)),
  ].sort();

  static getCitiesByCountry(country) {
    return GeoService.GEO_RAW.filter((entry) => entry.country === country)
      .sort((a, b) => a.city.localeCompare(b.city))
      .map((entry) => City.fromObject(entry));
  }

  static getCityByName(cityName) {
    const entry = GeoService.GEO_RAW.find((entry) => entry.city === cityName);
    return entry ? City.fromObject(entry) : null;
  }
}
