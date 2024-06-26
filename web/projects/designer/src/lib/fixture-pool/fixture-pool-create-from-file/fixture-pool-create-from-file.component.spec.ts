import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixturePoolCreateFromFileComponent } from './fixture-pool-create-from-file.component';

describe('FixturePoolCreateFromFileComponent', () => {
  let component: FixturePoolCreateFromFileComponent;
  let fixture: ComponentFixture<FixturePoolCreateFromFileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FixturePoolCreateFromFileComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixturePoolCreateFromFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
