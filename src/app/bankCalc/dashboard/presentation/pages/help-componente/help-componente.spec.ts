import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpComponente } from './help-componente';

describe('HelpComponente', () => {
  let component: HelpComponente;
  let fixture: ComponentFixture<HelpComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpComponente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
