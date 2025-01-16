import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Company} from '../models/Company';

@Injectable({
  providedIn: 'root',
})
export class RestApiService {
  private apiUrl = 'http://localhost:5000/api/v1';

  constructor(private http: HttpClient) {}

  // Admin APIs
  registerAdmin(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  loginAdmin(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/login`, payload);
  }

  getAllAdmins(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  softDeleteAdmin(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Company APIs
  createCompany(payload: Company): Observable<any> {
    return this.http.post(`${this.apiUrl}/companies`, payload);
  }

  getAllCompanies(queryParams?: any): Observable<any> {
    let query = '';
    if (queryParams) {
      query = Object.keys(queryParams)
        .map((key) => `${key}=${queryParams[key]}`)
        .join('&');
    }
    return this.http.get(`${this.apiUrl}/companies${query ? '?' + query : ''}`);
  }

  getCompanyById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/companies/${id}`);
  }

  updateCompany(id: string, payload: Partial<Company>): Observable<any> {
    return this.http.put(`${this.apiUrl}/companies/${id}`, payload);
  }

  updateCompanyAccessStatus(id: string, payload: Partial<Company>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/companies/${id}/access-status`, payload);
  }

  addPaymentRecord(companyId: string, payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/companies/${companyId}/payment`, payload);
  }

  softDeleteCompany(companyId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/companies/${companyId}`);
  }

  restoreCompany(companyId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/companies/${companyId}/restore`, {});
  }
}
