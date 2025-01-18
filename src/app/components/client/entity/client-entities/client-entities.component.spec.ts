import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientEntitiesComponent } from './client-entities.component';

describe('ClientEntitiesComponent', () => {
  let component: ClientEntitiesComponent;
  let fixture: ComponentFixture<ClientEntitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientEntitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientEntitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
