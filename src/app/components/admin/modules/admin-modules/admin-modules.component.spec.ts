import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminModulesComponent } from './admin-modules.component';

describe('AdminModulesComponent', () => {
  let component: AdminModulesComponent;
  let fixture: ComponentFixture<AdminModulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminModulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
