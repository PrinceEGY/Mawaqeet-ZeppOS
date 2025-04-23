import { gettext } from "i18n";
import { GeoService } from "../../../shared/geo_data";

export function locationSettingsPage(onBack, props) {
  // Extract common UI elements
  const createHeader = (title) => {
    return View({ padding: "12px 0" }, [
      Text(
        { fontSize: "20px", fontWeight: "bold", textAlign: "center" },
        title
      ),
    ]);
  };

  const createButtonList = (items, onClick) => {
    return View(
      { padding: "8px 0" },
      items.map((item) =>
        View({ padding: "4px 0" }, [
          Button({
            label: typeof item === "string" ? item : item.city,
            onClick: () => onClick(item),
          }),
        ])
      )
    );
  };

  // Manage location state
  const getLocationState = () => {
    return props.settingsStorage.getItem("locationState")
      ? JSON.parse(props.settingsStorage.getItem("locationState"))
      : {
          step: "country",
          selectedCountry: null,
          selectedCity: null,
        };
  };

  const saveLocationState = (state) => {
    props.settingsStorage.setItem("locationState", JSON.stringify(state));
  };

  const getCurrentLocation = () => {
    return props.settingsStorage.getItem("selectedLocation")
      ? JSON.parse(props.settingsStorage.getItem("selectedLocation"))
      : null;
  };

  const saveSelectedLocation = (city) => {
    props.settingsStorage.setItem(
      "selectedLocation",
      JSON.stringify({
        country: city.country,
        city: city.city,
        latitude: city.lat,
        longitude: city.lng,
      })
    );
  };

  // Helper functions to render different screens
  const renderCountrySelection = (locationState, currentLocation) => {
    return Section({}, [
      createHeader(gettext("select_country")),

      // Show current selection if exists
      currentLocation &&
        View({ padding: "8px 0", textAlign: "center" }, [
          Text(
            { fontSize: "16px", color: "#666" },
            `${gettext("current_selection")}: ${currentLocation.country}, ${
              currentLocation.city
            }`
          ),
        ]),

      // List of countries
      createButtonList(GeoService.COUNTRIES, (country) => {
        locationState.selectedCountry = country;
        locationState.step = "city";
        saveLocationState(locationState);
      }),

      // Back button
      View({ padding: "16px 0" }, [
        Button({
          label: gettext("back"),
          onClick: onBack,
        }),
      ]),
    ]);
  };

  const renderCitySelection = (locationState, currentLocation) => {
    return Section({}, [
      createHeader(
        `${locationState.selectedCountry} - ${gettext("select_city")}`
      ),

      // List of cities
      createButtonList(
        GeoService.getCitiesByCountry(locationState.selectedCountry),
        (city) => {
          locationState.selectedCity = city;
          saveLocationState(locationState);
          saveSelectedLocation(city);

          // Reset location state and return to main menu immediately
          saveLocationState({
            step: "country",
            selectedCountry: null,
            selectedCity: null,
          });
          onBack();
        }
      ),

      // Back button only (Submit button removed)
      View({ padding: "16px 0" }, [
        Button({
          label: gettext("back_to_countries"),
          onClick: () => {
            locationState.step = "country";
            locationState.selectedCity = null;
            saveLocationState(locationState);
          },
        }),
      ]),
    ]);
  };

  // Get states
  const locationState = getLocationState();
  const currentLocation = getCurrentLocation();

  console.log("Location settings page initialized");

  // Render based on current step
  if (locationState.step === "city") {
    return renderCitySelection(locationState, currentLocation);
  } else {
    return renderCountrySelection(locationState, currentLocation);
  }
}
