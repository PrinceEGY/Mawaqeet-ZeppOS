import { gettext } from "i18n";
import { GeoService } from "../../../shared/geo_data";
import { Theme } from "../../utils/theme";
import { AppBar } from "../../components/app_bar";

export function locationSettingsPage(onBack, props) {
  // Extract common UI elements

  const createButtonList = (items, onClick) => {
    return View(
      { padding: "8px 0" },
      items.map((item) =>
        View({ padding: "4px 0" }, [
          Button({
            style: {
              backgroundColor: Theme.bgSecondaryColor,
              color: Theme.textPrimaryColor,
            },
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
    return Section({ backgroundColor: Theme.bgPrimaryColor }, [
      AppBar({
        title: gettext("loc_select_country"),
        onBack: onBack,
        showBackButton: true,
      }),

      // Show current selection if exists
      currentLocation &&
        View({ padding: "8px 0", textAlign: "center" }, [
          Text(
            { fontSize: "16px", color: Theme.dividerColor },
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
    ]);
  };

  const renderCitySelection = (locationState, currentLocation) => {
    return Section({ backgroundColor: Theme.bgPrimaryColor }, [
      AppBar({
        title: `${locationState.selectedCountry} | ${gettext(
          "loc_select_city"
        )}`,
        onBack: () => {
          locationState.step = "country";
          locationState.selectedCity = null;
          saveLocationState(locationState);
        },
        showBackButton: true,
      }),

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

      View({ padding: "16px 0" }, [
        Button({
          style: {
            backgroundColor: Theme.bgSecondaryColor,
            color: Theme.textPrimaryColor,
          },
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
