import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Asset } from './models/asset';
import { Category } from './models/category';

/**
 * Asset Management Service
 *
 * Provides CRUD operations for assets and categories.
 * Handles HTTP communication with the .NET backend API.
 *
 * @author Senior Angular Developer
 * @version 1.0.0
 */
@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private readonly baseApiUrl = 'http://localhost:5195/api';

  constructor(private http: HttpClient) {}

  // ===============================
  // CATEGORY OPERATIONS
  // ===============================

  /**
   * Retrieves all categories for dropdown selection
   * @returns Observable<Category[]> - Array of available categories
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseApiUrl}/categories`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ===============================
  // ASSET CRUD OPERATIONS
  // ===============================

  /**
   * Retrieves all assets with optional category relations
   * @returns Observable<Asset[]> - Array of all assets
   */
  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.baseApiUrl}/assets`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Retrieves a single asset by ID
   * @param id - Asset identifier
   * @returns Observable<Asset> - Single asset object
   */
  getAsset(id: number): Observable<Asset> {
    return this.http.get<Asset>(`${this.baseApiUrl}/assets/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Creates a new asset
   * @param asset - Asset data without ID (ID is auto-generated)
   * @returns Observable<Asset> - Created asset with generated ID
   */
  createAsset(asset: Omit<Asset, 'id'>): Observable<Asset> {
    return this.http.post<Asset>(`${this.baseApiUrl}/assets`, asset)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Updates an existing asset
   * @param id - Asset identifier
   * @param asset - Partial asset data to update
   * @returns Observable<Asset> - Updated asset object
   */
  updateAsset(id: number, asset: Partial<Asset>): Observable<Asset> {
    return this.http.put<Asset>(`${this.baseApiUrl}/assets/${id}`, asset)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Deletes an asset by ID
   * @param id - Asset identifier to delete
   * @returns Observable<void> - Completion indicator
   */
  deleteAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}/assets/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ===============================
  // ERROR HANDLING
  // ===============================

  /**
   * Centralized error handling for HTTP operations
   * @param error - HTTP error response
   * @returns Observable<never> - Error observable
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
    }

    console.error('AssetService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}