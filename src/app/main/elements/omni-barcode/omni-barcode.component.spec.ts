import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OmniBarcodeComponent } from './omni-barcode.component';

describe('OmniBarcodeComponent', () => {
  let component: OmniBarcodeComponent;
  let fixture: ComponentFixture<OmniBarcodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OmniBarcodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OmniBarcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
