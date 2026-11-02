import * as Location from 'expo-location';

export interface DetectedPlace {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export type DetectResult =
  | { kind: 'ok'; place: DetectedPlace }
  | { kind: 'denied'; canAskAgain: boolean }
  | { kind: 'error' };

interface AddressParts {
  city?: string | null;
  subregion?: string | null;
  district?: string | null;
  region?: string | null;
  country?: string | null;
}

// Geocoders fill different fields in different countries, so fall back through the options.
// Offline, there is no address at all: show rounded coordinates rather than failing.
export function describePlace(
  coords: { latitude: number; longitude: number },
  address: AddressParts | null,
): DetectedPlace {
  const city = address?.city || address?.subregion || address?.district || address?.region;
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    city: city || `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`,
    country: address?.country || '',
  };
}

export function formatPlace(place: { city: string; country: string }): string {
  return place.country ? `${place.city}, ${place.country}` : place.city;
}

export async function hasLocationPermission(): Promise<boolean> {
  const { granted } = await Location.getForegroundPermissionsAsync();
  return granted;
}

export async function detectLocation(): Promise<DetectResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return { kind: 'denied', canAskAgain: permission.canAskAgain };

    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude, longitude } = position.coords;
    const addresses = await Location.reverseGeocodeAsync({ latitude, longitude }).catch(() => []);
    return { kind: 'ok', place: describePlace({ latitude, longitude }, addresses[0] ?? null) };
  } catch {
    return { kind: 'error' };
  }
}
