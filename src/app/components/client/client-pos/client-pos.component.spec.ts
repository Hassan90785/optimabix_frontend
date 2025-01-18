import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPosComponent } from './client-pos.component';

describe('ClientPosComponent', () => {
  let component: ClientPosComponent;
  let fixture: ComponentFixture<ClientPosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
