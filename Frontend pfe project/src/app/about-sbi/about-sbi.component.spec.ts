import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutSbiComponent } from './about-sbi.component';

describe('AboutSbiComponent', () => {
  let component: AboutSbiComponent;
  let fixture: ComponentFixture<AboutSbiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutSbiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutSbiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
