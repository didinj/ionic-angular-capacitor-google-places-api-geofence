import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private apiKey = 'YOUR_GOOGLE_PLACES_API_KEY'; // 🔑 Replace this

  constructor(private http: HttpClient) { }

  // Search place suggestions
  searchPlaces(query: string): Observable<any> {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&key=${this.apiKey}`;
    return this.http.get(url);
  }

  // Get place details (lat/lng)
  getPlaceDetails(placeId: string): Observable<any> {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${this.apiKey}`;
    return this.http.get(url);
  }
}
