import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import {AdminStore} from '../stores/admin.store';

export function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const loginUrl = 'login'; // Adjust this to match your login API endpoint

  // Log request details
  const token = localStorage.getItem('token');

  if (req.url.includes(loginUrl)) {
    return next(req);
  }

  // Show Loader (Spinner)
  AdminStore.setLoader(true);




  // Pass the request to the next handler in the chain
  return next(req).pipe(
    finalize(() => AdminStore.setLoader(false)) // Hide Loader when request completes
  );
}
