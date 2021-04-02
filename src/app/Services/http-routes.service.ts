import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpRoutesService {
  private baseUrl: string = 'http://repos.local:8000/api';

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  register(data: any) {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  logout() {
    return this.http.post(`${this.baseUrl}/auth/logout`, null);
  }

  refreshToken() {
    return this.http.post(`${this.baseUrl}/auth/refresh`, null);
  }

  ping() {
    return this.http.post(`${this.baseUrl}/auth/ping`, null);
  }
}
