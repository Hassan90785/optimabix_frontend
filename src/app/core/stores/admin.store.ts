import {BehaviorSubject} from 'rxjs';

export class AdminStore {

  private static _loader = new BehaviorSubject<boolean>(false);

  static get loader$() {
    return this._loader.asObservable(); // Expose as Observable
  }

  static setLoader(state: boolean) {
    this._loader.next(state);
  }
}
