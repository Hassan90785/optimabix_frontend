import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Company} from '../models/Company';
import {User} from '../models/User';
import {Role} from '../models/Role';

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

  // Users APIs
  getAllUsers(queryParams?: any): Observable<any> {
    let params = new HttpParams();
    if (queryParams) {
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key]) {
          params = params.set(key, queryParams[key]);
        }
      });
    }
    return this.http.get(`${this.apiUrl}/users`, { params });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  createUser(payload: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, payload);
  }

  updateUser(id: string, payload: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, payload);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  loginUser(payload: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login`, payload);
  }


  // Roles APIs
  getAllRoles(queryParams?: any): Observable<any> {
    let params = new HttpParams();
    if (queryParams) {
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key]) {
          params = params.set(key, queryParams[key]);
        }
      });
    }
    return this.http.get(`${this.apiUrl}/roles`, { params });
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/roles/${id}`);
  }

  createRole(payload: Role): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, payload);
  }

  updateRole(id: string, payload: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/roles/${id}`, payload);
  }

  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/roles/${id}`);
  }
}
