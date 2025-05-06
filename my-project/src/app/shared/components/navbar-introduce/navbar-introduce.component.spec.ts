import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarIntroduceComponent } from './navbar-introduce.component';

describe('NavbarIntroduceComponent', () => {
  let component: NavbarIntroduceComponent;
  let fixture: ComponentFixture<NavbarIntroduceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarIntroduceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarIntroduceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
