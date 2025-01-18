import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientInventoryComponent } from './client-inventory.component';

describe('ClientInventoryComponent', () => {
  let component: ClientInventoryComponent;
  let fixture: ComponentFixture<ClientInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientInventoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
