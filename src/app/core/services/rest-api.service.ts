import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestApiService {
  private apiUrl = 'http://localhost:5000/api/v1/admin';

  constructor(private http: HttpClient) {}

  registerAdmin(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  loginAdmin(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, payload);
  }

  getAllAdmins(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  softDeleteAdmin(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
