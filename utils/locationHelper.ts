import * as Location from "expo-location";

const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
  "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

export function matchDistrict(value: string): string {
  if (!value) return "";
  const normalized = value.replace(/\s+district$/i, "").replace(/\s+province$/i, "").trim();
  return SRI_LANKA_DISTRICTS.find((d) => d.toLowerCase() === normalized.toLowerCase()) ?? "";
}

function extractDistrict(address: Location.LocationGeocodedAddress): string {
  const candidates = [address.subregion, address.district, address.city, address.region];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const matched = matchDistrict(candidate);
    if (matched) return matched;
  }
  return "";
}

export type GpsResult = {
  coords: { latitude: number; longitude: number };
  district: string;
  village: string;
  locationText: string;
};

async function resolvePosition(): Promise<Location.LocationObject> {
  const lastKnown = await Location.getLastKnownPositionAsync();
  if (lastKnown) return lastKnown;

  return Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
    mayShowUserSettingsDialog: true,
  });
}

function toFriendlyGpsError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("permission") || lower.includes("denied")) {
    return "Location permission denied. Allow location access in app settings.";
  }
  if (lower.includes("disabled") || lower.includes("unavailable") || lower.includes("services")) {
    return "Location services are off. Please enable GPS on your device.";
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "GPS timed out. Move outdoors and try again.";
  }
  return "Could not get location. Enable GPS and try again.";
}

export async function fetchCurrentLocation(): Promise<GpsResult> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      throw new Error("Location services are off. Please enable GPS on your device.");
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Location services")) {
      throw error;
    }
    // If the services check itself fails, still try to read GPS.
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission denied. Allow location access in app settings.");
  }

  let loc: Location.LocationObject;
  try {
    loc = await resolvePosition();
  } catch (error: unknown) {
    throw new Error(toFriendlyGpsError(error));
  }

  const coords = {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };

  let district = "";
  let village = "";
  let locationText = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;

  try {
    const addresses = await Location.reverseGeocodeAsync(coords);
    if (addresses.length > 0) {
      const a = addresses[0];
      district = extractDistrict(a);
      village = a.name || a.district || a.city || a.subregion || "";
      const place = [a.name, a.city || a.subregion].filter(Boolean).join(", ");
      if (place) locationText = place;
    }
  } catch {
    // coords are still valid even if reverse geocode fails
  }

  return { coords, district, village, locationText };
}
