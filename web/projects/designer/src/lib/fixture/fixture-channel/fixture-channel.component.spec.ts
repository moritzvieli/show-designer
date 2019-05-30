import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureChannelComponent } from './fixture-channel.component';

describe('FixtureChannelComponent', () => {
  let component: FixtureChannelComponent;
  let fixture: ComponentFixture<FixtureChannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixtureChannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
