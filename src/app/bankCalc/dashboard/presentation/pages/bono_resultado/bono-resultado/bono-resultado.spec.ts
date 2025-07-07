import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonoResultado } from './bono-resultado';

describe('BonoResultado', () => {
  let component: BonoResultado;
  let fixture: ComponentFixture<BonoResultado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonoResultado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonoResultado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
