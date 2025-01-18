import {Injectable} from '@angular/core';
import {User} from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _token: string = '';
  private _user: User | undefined | null = null;

  constructor() {
  }

  get user(): User | undefined | null {
    return this._user;
  }

  set user(value: User | undefined | null) {
    this._user = value;
  }

  get info(): any {
    if(this.user) {
      console.log('this.user', this.user);
      return {
        name: this.user.fullName,
        id: this.user.id,
        role: this.user.role,
        companyId: this.user.companyId
      }
    }
  }
}
