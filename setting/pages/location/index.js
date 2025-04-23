import { gettext } from "i18n";
import { GEO_DATA } from "../../../shared/geo_data.js";

export function locationSettingsPage(onBack, props) {
  // Helper functions to render different screens
  const renderCountrySelection = (props, locationState, currentLocation) => {
    // Extract unique countries from GEO_DATA
    const countries = [...new Set(GEO_DATA.map((item) => item.country))].sort();

    return Section({}, [
      View({ padding: "12px 0" }, [
        Text(
          { fontSize: "20px", fontWeight: "bold", textAlign: "center" },
          gettext("select_country")
        ),

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
      ]),

      // List of countries as a vertical list
      View(
        { padding: "8px 0" },
        countries.map((country) =>
          View({ padding: "4px 0" }, [
            Button({
              label: country,
              onClick: () => {
                locationState.selectedCountry = country;
                locationState.step = "city";
                props.settingsStorage.setItem(
                  "locationState",
                  JSON.stringify(locationState)
                );
              },
            }),
          ])
        )
      ),

      // Back button
      View({ padding: "16px 0" }, [
        Button({
          label: gettext("back"),
          onClick: onBack,
        }),
      ]),
    ]);
  };

  const renderCitySelection = (props, locationState, currentLocation) => {
    // Filter cities based on selected country
    const cities = GEO_DATA.filter(
      (item) => item.country === locationState.selectedCountry
    )
      .map((item) => item.city)
      .sort();

    return Section({}, [
      View({ padding: "12px 0" }, [
        Text(
          { fontSize: "20px", fontWeight: "bold", textAlign: "center" },
          `${locationState.selectedCountry} - ${gettext("select_city")}`
        ),
      ]),

      // List of cities as a vertical list
      View(
        { padding: "8px 0" },
        cities.map((city) =>
          View({ padding: "4px 0" }, [
            Button({
              label: city,
              onClick: () => {
                locationState.selectedCity = city;
                props.settingsStorage.setItem(
                  "locationState",
                  JSON.stringify(locationState)
                );

                // Get lat/long data for the selected city
                const selectedLocation = GEO_DATA.find(
                  (item) =>
                    item.country === locationState.selectedCountry &&
                    item.city === city
                );

                // Save the selected location
                props.settingsStorage.setItem(
                  "selectedLocation",
                  JSON.stringify({
                    country: locationState.selectedCountry,
                    city: locationState.selectedCity,
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  })
                );
              },
            }),
          ])
        )
      ),

      // Submit and Back buttons
      View({ padding: "16px 0" }, [
        locationState.selectedCity &&
          Button({
            label: gettext("submit"),
            onClick: () => {
              // Reset location state
              props.settingsStorage.setItem(
                "locationState",
                JSON.stringify({
                  step: "country",
                  selectedCountry: null,
                  selectedCity: null,
                })
              );
              onBack();
            },
          }),

        Button({
          label: gettext("back_to_countries"),
          onClick: () => {
            locationState.step = "country";
            locationState.selectedCity = null;
            props.settingsStorage.setItem(
              "locationState",
              JSON.stringify(locationState)
            );
          },
        }),
      ]),
    ]);
  };

  // Get or initialize location state
  const locationState = props.settingsStorage.getItem("locationState")
    ? JSON.parse(props.settingsStorage.getItem("locationState"))
    : {
        step: "country",
        selectedCountry: null,
        selectedCity: null,
      };

  // Get current selected location if any
  const currentLocation = props.settingsStorage.getItem("selectedLocation")
    ? JSON.parse(props.settingsStorage.getItem("selectedLocation"))
    : null;

  console.log("Location settings page initialized");

  // Render based on current step
  if (locationState.step === "country") {
    return renderCountrySelection(props, locationState, currentLocation);
  } else if (locationState.step === "city") {
    return renderCitySelection(props, locationState, currentLocation);
  }
}
