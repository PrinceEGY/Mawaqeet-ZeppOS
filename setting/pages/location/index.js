import { gettext } from "i18n";
import { GeoService } from "../../../shared/geo-service";
import { AppBar } from "../../components/app_bar";
import { Input } from "../../components/input";
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
  const locationPageState = getLocationState();
  const currentLocation = getCurrentLocation();

  if (locationPageState.step === "country") {
    return renderCountrySelection();
  } else {
    return renderCitySelection();
  }

  function getLocationState() {
    return props.settingsStorage.getItem("locationPageState")
      ? JSON.parse(props.settingsStorage.getItem("locationPageState"))
      : {
          step: "country",
          selectedCountry: null,
          selectedCity: null,
        };
  }

  function updatePageState(state) {
    props.settingsStorage.setItem("locationPageState", JSON.stringify(state));
  }

  function getCurrentLocation() {
    return JSON.parse(props.settingsStorage.getItem("currentLocation"));
  }

  function saveSelectedLocation(city) {
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
        { style: { ...TEXT_STYLES.normal } },
        currentLocation
          ? `${currentLocation.country}, ${currentLocation.city}`
          : gettext("no_location_selected")
      ),
      currentLocation
        ? Text(
            { style: { ...TEXT_STYLES.small, marginTop: SPACING.sm } },
            gettext("latitude") +
              `: ${currentLocation.latitude}°, ` +
              gettext("longitude") +
              `: ${currentLocation.longitude}°`
          )
        : null,
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
            lat = validateCoordinate(lat, "lat");
            lon = validateCoordinate(lon, "lon");
            const city = GeoService.getClosestCity(lat, lon);
            saveSelectedLocation(city);
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
                ...locationPageState,
                selectedCountry: country,
                step: "city",
              };
              updatePageState(newState);
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
        title: `${locationPageState.selectedCountry} | ${gettext(
          "loc_select_city"
        )}`,
        onBack: () => {
          locationPageState.step = "country";
          locationPageState.selectedCity = null;
          updatePageState(locationPageState);
        },
        showBackButton: true,
      }),

      Spacer({ height: SPACING.sm }),

      Panel({
        children: [
          ...GeoService.getCitiesByCountry(
            locationPageState.selectedCountry
          ).map((city) =>
            MenuButton({
              label: city.city,
              showArrow: false,
              onClick: () => {
                locationPageState.selectedCity = city;
                updatePageState(locationPageState);
                saveSelectedLocation(city);

                updatePageState({
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
