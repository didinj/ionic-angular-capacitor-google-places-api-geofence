import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import {
  BackgroundGeolocationPlugin,
  Location,
} from '@capacitor-community/background-geolocation';
import { registerPlugin } from '@capacitor/core';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>("BackgroundGeolocation");

export interface Geofence {
  id: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  inside?: boolean; // track state
}

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private watchId: string | null = null;
  private geofences: Geofence[] = [];
  private geofenceCallbacks: ((event: any) => void)[] = [];

  constructor() { }

  // Get current location once
  async getCurrentPosition(): Promise<Location | null> {
    try {
      const position = await Geolocation.getCurrentPosition();
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      } as Location;
    } catch (err) {
      console.error('Error getting current position:', err);
      return null;
    }
  }

  // Watch continuous location updates
  async startWatchingLocation(callback: (loc: Location) => void) {
    this.watchId = await BackgroundGeolocation.addWatcher(
      {
        backgroundMessage: 'Tracking your location in the background',
        backgroundTitle: 'Location Tracking',
        requestPermissions: true,
        stale: false,
      },
      (location, err) => {
        if (err) {
          if (err.code === 'NOT_AUTHORIZED') {
            alert(
              'This app needs location access. Please grant permission in settings.'
            );
          }
          console.error('BackgroundGeolocation error:', err);
          return;
        }
        if (location) {
          callback(location);
          this.checkGeofences(location);
        }
      }
    );
  }

  async stopWatchingLocation() {
    if (this.watchId) {
      await BackgroundGeolocation.removeWatcher({ id: this.watchId });
      this.watchId = null;
    }
  }

  // Add geofence
  addGeofence(id: string, latitude: number, longitude: number, radius: number) {
    const geofence: Geofence = { id, latitude, longitude, radius, inside: false };
    this.geofences.push(geofence);
    console.log(`Geofence ${id} added`);
  }

  // Register a callback for geofence events
  onGeofenceEvent(callback: (event: any) => void) {
    this.geofenceCallbacks.push(callback);
  }

  // Check geofences against current location
  private checkGeofences(location: Location) {
    this.geofences.forEach((geofence) => {
      const distance = this.getDistanceFromLatLonInM(
        location.latitude,
        location.longitude,
        geofence.latitude,
        geofence.longitude
      );

      const wasInside = geofence.inside;
      const isInside = distance <= geofence.radius;

      if (!wasInside && isInside) {
        this.triggerGeofenceEvent({
          id: geofence.id,
          type: 'enter',
          location,
        });
      } else if (wasInside && !isInside) {
        this.triggerGeofenceEvent({
          id: geofence.id,
          type: 'exit',
          location,
        });
      }

      geofence.inside = isInside;
    });
  }

  // Trigger event to listeners
  private triggerGeofenceEvent(event: any) {
    console.log('Geofence event:', event);
    this.geofenceCallbacks.forEach((cb) => cb(event));
  }

  // Haversine formula: distance in meters
  private getDistanceFromLatLonInM(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth radius in m
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
