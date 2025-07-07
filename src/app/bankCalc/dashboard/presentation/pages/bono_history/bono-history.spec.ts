import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonoHistory } from './bono-history';

describe('BonoHistory', () => {
  let component: BonoHistory;
  let fixture: ComponentFixture<BonoHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonoHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonoHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
