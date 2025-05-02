import { gettext } from "i18n";
import { GeoService } from "../../../shared/geo-service";
import { AppBar } from "../../components/app_bar";
import { MenuButton } from "../../components/menu_button";
import { Panel } from "../../components/panel";
import { Spacer } from "../../components/spacer";
import { Input } from "../../components/input";
import {
  BUTTON_STYLES,
  LAYOUT_STYLES,
  SPACING,
  TEXT_STYLES,
} from "../../utils/styles";
import { Theme } from "../../utils/theme";

export function locationSettingsPage(onBack, props) {
  const locationState = getLocationState();
  const currentLocation = getCurrentLocation();

  if (locationState.step === "city") {
    return renderCitySelection();
  } else {
    return renderCountrySelection();
  }

  function getLocationState() {
    return props.settingsStorage.getItem("locationState")
      ? JSON.parse(props.settingsStorage.getItem("locationState"))
      : {
          step: "country",
          selectedCountry: null,
          selectedCity: null,
        };
  }

  function saveLocationState(state) {
    props.settingsStorage.setItem("locationState", JSON.stringify(state));
  }

  function getCurrentLocation() {
    return JSON.parse(props.settingsStorage.getItem("currentLocation"));
  }

  function saveSelectedLocation(locationData) {
    let locationToSave;

    if (locationData.city && locationData.country) {
      locationToSave = {
        country: locationData.country,
        city: locationData.city,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };
    } else {
      const lat = parseFloat(validateCoordinate(locationData.latitude, "lat"));
      const lon = parseFloat(validateCoordinate(locationData.longitude, "lon"));

      const closestCity = GeoService.getClosestCity(lat, lon);

      locationToSave = {
        country: closestCity.country,
        city: closestCity.city,
        latitude: closestCity.latitude,
        longitude: closestCity.longitude,
      };
    }

    props.settingsStorage.setItem(
      "currentLocation",
      JSON.stringify(locationToSave)
    );
    props.settingsStorage.setItem("lastPrayerTimesUpdate", null);

    props.settingsStorage.removeItem("tempLatitude");
    props.settingsStorage.removeItem("tempLongitude");
  }

  function validateCoordinate(value, type) {
    const num = parseFloat(value);

    if (isNaN(num)) {
      return 0;
    }

    if (type === "lat") {
      return Math.max(-90, Math.min(90, num));
    } else {
      return Math.max(-180, Math.min(180, num));
    }
  }

  // --- Build Methods ---
  function buildCurrentLocationPanel() {
    return Section({}, [
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
    ]);
  }

  function buildGpsLocationPanel() {
    return Section({}, [
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
      Text(
        {
          style: {
            ...TEXT_STYLES.small,
            marginBottom: SPACING.sm,
          },
        },
        gettext("gps_location_limitation")
      ),
      // TODO: Implement GPS location update functionality based on device capabilities
      // Button({
      //   label: gettext("gps_check"),
      //   style: { ...BUTTON_STYLES.primary },
      //   onClick: () => {
      //     // Empty handler for now - will implement GPS location update later
      //     console.log("GPS location update requested");
      //   },
      // }),
    ]);
  }

  function buildManualCoordinatesPanel() {
    let lat = props.settingsStorage.getItem("tempLatitude")
      ? props.settingsStorage.getItem("tempLatitude")
      : 0;
    let lon = props.settingsStorage.getItem("tempLongitude")
      ? props.settingsStorage.getItem("tempLongitude")
      : 0;

    return Panel({
      children: [
        Text(
          {
            style: {
              ...TEXT_STYLES.subheading,
              marginBottom: SPACING.xs,
            },
          },
          gettext("enter_coordinates_manually")
        ),
        Text(
          {
            style: {
              ...TEXT_STYLES.small,
              marginBottom: SPACING.sm,
            },
          },
          gettext("coordinates_range_info")
        ),
        Input({
          label: gettext("latitude"),
          value: lat,
          onChange: (value) => {
            lat = validateCoordinate(value, "lat");
            props.settingsStorage.setItem("tempLatitude", lat);
          },
        }),
        Spacer({ height: SPACING.xs }),
        Input({
          label: gettext("longitude"),
          value: lon,
          onChange: (value) => {
            lon = validateCoordinate(value, "lon");
            props.settingsStorage.setItem("tempLongitude", lon);
          },
        }),
        Spacer({ height: SPACING.sm }),
        Button({
          label: gettext("save_coordinates"),
          style: { ...BUTTON_STYLES.primary },
          onClick: () => {
            saveSelectedLocation({
              latitude: lat,
              longitude: lon,
            });
          },
        }),
      ],
    });
  }

  function buildManualSelectionPanel() {
    return [
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
      Panel({
        children: GeoService.COUNTRIES.map((country) =>
          MenuButton({
            label: country,
            showArrow: true,
            onClick: () => {
              props.settingsStorage.removeItem("tempLatitude");
              props.settingsStorage.removeItem("tempLongitude");

              const newState = {
                ...locationState,
                selectedCountry: country,
                step: "city",
              };
              saveLocationState(newState);
            },
          })
        ),
      }),
    ];
  }

  function renderCountrySelection() {
    return Section({ style: LAYOUT_STYLES.mainContainer }, [
      AppBar({
        title: gettext("loc_select_country"),
        onBack: onBack,
        showBackButton: true,
      }),

      Spacer({ height: SPACING.xs }),

      Panel({
        children: [buildCurrentLocationPanel(), buildGpsLocationPanel()],
      }),
      Spacer({ height: SPACING.xs }),

      buildManualCoordinatesPanel(),

      Spacer({ height: SPACING.xs }),

      buildManualSelectionPanel(),
    ]);
  }

  function renderCitySelection() {
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
  }
}
