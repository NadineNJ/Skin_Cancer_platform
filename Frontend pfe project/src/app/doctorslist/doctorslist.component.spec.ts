import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorsListComponent } from './doctorslist.component';  // PascalCase
import { HttpClientModule } from '@angular/common/http';

describe('DoctorsListComponent', () => {
  let component: DoctorsListComponent;
  let fixture: ComponentFixture<DoctorsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorsListComponent, HttpClientModule] // standalone component + HttpClient
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
