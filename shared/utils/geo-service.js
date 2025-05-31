import { GEO_DATA } from "../data/geo-data";

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
  static GEO_DATA = GEO_DATA;

  static COUNTRIES = [
    ...new Set(this.GEO_DATA.map((entry) => entry.country)),
  ].sort();

  static getCitiesByCountry(country) {
    return this.GEO_DATA.filter((entry) => entry.country === country)
      .sort((a, b) => a.city.localeCompare(b.city))
      .map((entry) => City.fromObject(entry));
  }

  static getCityByName(cityName) {
    const entry = this.GEO_DATA.find((entry) => entry.city === cityName);
    return entry ? City.fromObject(entry) : null;
  }

  static getClosestCity(latitude, longitude) {
    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (
      isNaN(latNum) ||
      latNum < -90 ||
      latNum > 90 ||
      isNaN(lonNum) ||
      lonNum < -180 ||
      lonNum > 180
    ) {
      console.error(
        "Invalid coordinates provided to getClosestCity:",
        latitude,
        longitude
      );
      return null;
    }

    let closestCity = null;
    let minDistance = Infinity;

    for (const entry of this.GEO_DATA) {
      const distance = this._calculateDistance(
        latNum,
        lonNum,
        entry.latitude,
        entry.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestCity = entry;
      }
    }

    return closestCity ? City.fromObject(closestCity) : null;
  }

  static _calculateDistance(lat1, lon1, lat2, lon2) {
    // Calculate distance using the Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }
}
