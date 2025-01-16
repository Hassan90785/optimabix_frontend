import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import {jwtDecode} from 'jwt-decode';

export function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const loginUrl = 'login'; // Adjust this to match your login API endpoint

  // Log request details
  console.log('Request URL:', req.url);
  const token = localStorage.getItem('token');
  console.log('Token:', token);
  // Check if the request is for login; if so, bypass token handling
  if (req.url.includes(loginUrl)) {
    return next(req); // Allow login requests without modification
  }

  // Handle token if present
  if (token) {
    const decoded: any = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      // Handle token expiration (e.g., logout the user)
      console.warn('Token expired. Logging out the user.');
      localStorage.removeItem('token');
      // Optionally, you can redirect the user to the login page here
      return next(req); // Pass the request without the token
    }

    // Clone the request to add the Authorization header
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  console.log('Sending request with token:', req.url);
  // Pass the request to the next handler in the chain
  return next(req);
}
