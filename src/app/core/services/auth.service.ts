import {Injectable} from '@angular/core';
import {User} from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _token: string = '';

  constructor() {
  }

  private _user: User | undefined | null = null;

  get user(): any {
    if (this._user)
      return this._user;
  }

  set user(value: User | undefined | null) {
    this._user = value;
  }

  get info(): { name: string, id: string, role: string, companyId: string , logo: string, companyName:string } {
    return {
      name: this.user.fullName,
      id: this.user._id,
      role: this.user.role,
      companyId: this.user.companyId,
      logo: this.user.company.logo,
      companyName: this.user.company.name
    }
  }
}
