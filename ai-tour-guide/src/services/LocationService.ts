import * as ExpoLocation from 'expo-location';
import { Location } from '../types';

class LocationService {
  private static instance: LocationService;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  async getCurrentLocation(): Promise<Location | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Location permission not granted');
        return null;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      const reverseGeocode = await ExpoLocation.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const placeName = reverseGeocode[0]
        ? `${reverseGeocode[0].city || ''} ${reverseGeocode[0].name || ''}`.trim()
        : undefined;

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        placeName,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }
}

export default LocationService.getInstance();
