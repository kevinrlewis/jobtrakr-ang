import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderbarOutComponent } from './headerbar-out.component';

describe('HeaderbarOutComponent', () => {
  let component: HeaderbarOutComponent;
  let fixture: ComponentFixture<HeaderbarOutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderbarOutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderbarOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
