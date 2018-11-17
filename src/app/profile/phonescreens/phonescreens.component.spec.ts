import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhonescreensComponent } from './phonescreens.component';

describe('PhonescreensComponent', () => {
  let component: PhonescreensComponent;
  let fixture: ComponentFixture<PhonescreensComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhonescreensComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhonescreensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
