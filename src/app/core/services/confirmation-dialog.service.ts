import {Injectable} from '@angular/core';
import {ConfirmationService} from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  constructor(private confirmationService: ConfirmationService) {
  }

  confirm(header: string, message: string, onAccept: () => void, onReject?: () => void): void {
    this.confirmationService.confirm({
      message,
      header,
      accept: onAccept,
      reject: onReject,
    });
  }
}
