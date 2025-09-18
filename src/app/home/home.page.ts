import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput } from '@ionic/angular/standalone';
import { GeolocationService } from '../services/geolocation.services';
import { JsonPipe } from '@angular/common';
import { PlacesService } from '../services/places.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonInput, IonLabel, IonItem, IonList, IonHeader, IonToolbar, IonTitle, IonContent, JsonPipe, FormsModule],
})
export class HomePage implements OnInit, OnDestroy {
  currentLocation: any = null;
  geofenceEvents: any[] = [];
  searchQuery: string = '';
  searchResults: any[] = [];

  constructor(
    private geoService: GeolocationService,
    private placesService: PlacesService
  ) { }

  async ngOnInit() {
    // Get current location
    this.currentLocation = await this.geoService.getCurrentPosition();

    // Start watching location
    await this.geoService.startWatchingLocation((loc) => {
      this.currentLocation = loc;
    });

    // Listen for geofence triggers
    this.geoService.onGeofenceEvent((event) => {
      this.geofenceEvents.push(event);
    });

    // Add a sample geofence (Google HQ in Mountain View)
    this.geoService.addGeofence('GoogleHQ', 37.422, -122.084, 200);
  }

  async ngOnDestroy() {
    await this.geoService.stopWatchingLocation();
  }

  // Search places
  search() {
    if (this.searchQuery.trim().length === 0) {
      this.searchResults = [];
      return;
    }
    this.placesService.searchPlaces(this.searchQuery).subscribe((res: any) => {
      this.searchResults = res.predictions;
    });
  }

  // Select a place and add geofence
  selectPlace(place: any) {
    this.placesService.getPlaceDetails(place.place_id).subscribe((res: any) => {
      const location = res.result.geometry.location;
      this.geoService.addGeofence(
        place.description,
        location.lat,
        location.lng,
        200
      );
      alert(`Geofence added for ${place.description}`);
      this.searchResults = [];
      this.searchQuery = '';
    });
  }
}
