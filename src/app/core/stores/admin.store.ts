import {signal} from '@angular/core';


export class AdminStore {
  private static _admins = signal([] as any[]);

  static get admins() {
    return this._admins;
  }

  private static _loader = signal(false);

  static get loader() {
    return this._loader;
  }

  static setAdmins(admins: any[]) {
    this._admins.set(admins);
  }

  static setLoader(state: boolean) {
    this._loader.set(state);
  }
}
