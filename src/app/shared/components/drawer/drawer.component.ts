import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Drawer} from 'primeng/drawer';
import {Button, ButtonDirective} from 'primeng/button';
import {Ripple} from 'primeng/ripple';
import {Avatar} from 'primeng/avatar';
import {CommonModule} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {Divider} from 'primeng/divider';

@Component({
  selector: 'app-drawer',
  imports: [
    CommonModule,
    Drawer,
    Button,
    Ripple,
    Avatar,
    ButtonDirective,
    RouterLink,
    RouterLinkActive,
    Divider
  ],
  templateUrl: './drawer.component.html',
  standalone: true,
  styleUrl: './drawer.component.scss'
})
export class DrawerComponent {
  @ViewChild('drawerRef') drawerRef!: Drawer;
  @Input() visible: boolean = false;
  @Input() menuItems: any[] = []
  @Output() eventEmitter: EventEmitter<boolean> = new EventEmitter()

  onClose() {
    console.log('closed')
    this.eventEmitter.emit(false)
  }
}
