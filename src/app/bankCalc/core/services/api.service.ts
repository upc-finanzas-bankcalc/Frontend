import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    // Here you can add logic to get the token from local storage or cookies
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.http.get(`${environment.api_url}${path}`, { headers: this.getHeaders(), params });
  }

  post(path: string, body: object = {}): Observable<any> {
    return this.http.post(`${environment.api_url}${path}`, JSON.stringify(body), { headers: this.getHeaders() });
  }

  put(path: string, body: object = {}): Observable<any> {
    return this.http.put(`${environment.api_url}${path}`, JSON.stringify(body), { headers: this.getHeaders() });
  }

  delete(path: string): Observable<any> {
    return this.http.delete(`${environment.api_url}${path}`, { headers: this.getHeaders() });
  }
} 