import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonoRegister } from './bono-register';

describe('BonoRegister', () => {
  let component: BonoRegister;
  let fixture: ComponentFixture<BonoRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonoRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonoRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
