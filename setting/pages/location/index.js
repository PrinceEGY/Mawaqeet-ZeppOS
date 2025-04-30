import { gettext } from "i18n";
import { GeoService } from "../../../shared/geo-service";
import { AppBar } from "../../components/app_bar";
import { MenuButton } from "../../components/menu_button";
import { Panel } from "../../components/panel";
import { Spacer } from "../../components/spacer";
import {
  BUTTON_STYLES,
  LAYOUT_STYLES,
  SPACING,
  TEXT_STYLES,
} from "../../utils/styles";
import { Theme } from "../../utils/theme";

export function locationSettingsPage(onBack, props) {
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
    return JSON.parse(props.settingsStorage.getItem("currentLocation"));
  };

  const saveSelectedLocation = (city) => {
    props.settingsStorage.setItem(
      "currentLocation",
      JSON.stringify({
        country: city.country,
        city: city.city,
        latitude: city.latitude,
        longitude: city.longitude,
      })
    );
    props.settingsStorage.setItem("lastPrayerTimesUpdate", null);
  };

  const renderCountrySelection = (locationState, currentLocation) => {
    return Section({ style: LAYOUT_STYLES.mainContainer }, [
      AppBar({
        title: gettext("loc_select_country"),
        onBack: onBack,
        showBackButton: true,
      }),

      Spacer({ height: SPACING.sm }),

      currentLocation &&
        Panel({
          children: [
            Text(
              {
                style: {
                  ...TEXT_STYLES.heading,
                  marginBottom: SPACING.xs,
                },
              },
              gettext("current_location")
            ),
            Text(
              {
                style: TEXT_STYLES.normal,
                marginBottom: SPACING.md,
              },
              `${currentLocation.country}, ${currentLocation.city}`
            ),

            View({
              style: {
                ...LAYOUT_STYLES.separator,
                margin: `${SPACING.md} 0`,
              },
            }),

            Text(
              {
                style: {
                  ...TEXT_STYLES.subheading,
                  marginBottom: SPACING.xs,
                },
              },
              gettext("use_gps_location")
            ),
            Text(
              {
                style: {
                  ...TEXT_STYLES.small,
                  marginBottom: SPACING.sm,
                  color: Theme.textPrimaryColor,
                },
              },
              gettext("update_using_device_gps")
            ),
            Button({
              label: gettext("gps_check"),
              style: { ...BUTTON_STYLES.primary },
              onClick: () => {
                // Empty handler for now - will implement GPS location update later
                console.log("GPS location update requested");
              },
            }),
          ],
        }),

      currentLocation && Spacer({ height: SPACING.sm }),

      Text(
        {
          style: {
            ...TEXT_STYLES.subheading,
            padding: `${SPACING.md} ${SPACING.md} 0px`,
            textAlign: "left",
          },
        },
        gettext("select_manually")
      ),

      // List of countries
      Panel({
        children: GeoService.COUNTRIES.map((country) =>
          MenuButton({
            label: country,
            showArrow: true,
            onClick: () => {
              locationState.selectedCountry = country;
              locationState.step = "city";
              saveLocationState(locationState);
            },
          })
        ),
      }),
    ]);
  };

  const renderCitySelection = (locationState, currentLocation) => {
    return Section({ style: LAYOUT_STYLES.mainContainer }, [
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

      Spacer({ height: SPACING.sm }),

      Panel({
        children: [
          ...GeoService.getCitiesByCountry(locationState.selectedCountry).map(
            (city) =>
              MenuButton({
                label: city.city,
                showArrow: false,
                onClick: () => {
                  locationState.selectedCity = city;
                  saveLocationState(locationState);
                  saveSelectedLocation(city);

                  saveLocationState({
                    step: "country",
                    selectedCountry: null,
                    selectedCity: null,
                  });
                },
              })
          ),
        ],
      }),
    ]);
  };

  const locationState = getLocationState();
  const currentLocation = getCurrentLocation();

  if (locationState.step === "city") {
    return renderCitySelection(locationState, currentLocation);
  } else {
    return renderCountrySelection(locationState, currentLocation);
  }
}
