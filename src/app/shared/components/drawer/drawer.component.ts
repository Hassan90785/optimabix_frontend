import {Component, Input, ViewChild} from '@angular/core';
import {Drawer} from 'primeng/drawer';
import {ImportsModule} from '../../module/primeNg';

@Component({
  selector: 'app-drawer',
  imports: [
    ImportsModule
  ],
  templateUrl: './drawer.component.html',
  standalone: true,
  styleUrl: './drawer.component.scss'
})
export class DrawerComponent {
  @ViewChild('drawerRef') drawerRef!: Drawer;
  @Input() visible: boolean = false;

  closeCallback(e: any): void {
    this.visible = false;
    this.drawerRef.close(e);
  }
}
