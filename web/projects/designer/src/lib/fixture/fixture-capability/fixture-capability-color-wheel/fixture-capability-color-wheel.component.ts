import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PresetService } from '../../../services/preset.service';
import { FixtureWheelSlot } from '../../../models/fixture-wheel-slot';
import { FixtureWheel } from '../../../models/fixture-wheel';
import { FixtureTemplate } from '../../../models/fixture-template';
import { FixtureService } from '../../../services/fixture.service';

@Component({
  selector: 'app-fixture-capability-color-wheel',
  templateUrl: './fixture-capability-color-wheel.component.html',
  styleUrls: ['./fixture-capability-color-wheel.component.css']
})
export class FixtureCapabilityColorWheelComponent implements OnInit {

  _fixtureTemplate: FixtureTemplate; 
  _wheelName: string;
  wheel: FixtureWheel;

  @Input()
  set fixtureTemplate(value: FixtureTemplate) {
    this._fixtureTemplate = value;
    this.update();
  }

  @Input()
  set wheelName(value: string) {
    this._wheelName = value;
    this.update();
  }

  @Input()
  wheelIndex: number;

  constructor(
    public presetService: PresetService,
    private changeDetectorRef: ChangeDetectorRef,
    private fixtureService: FixtureService
  ) { }

  ngOnInit() {
  }

  private update() {
    if(this._fixtureTemplate && this._wheelName) {
      this.wheel = this.fixtureService.getWheelByName(this._fixtureTemplate, this._wheelName);
    }

    this.changeDetectorRef.detectChanges();
  }

  getSlotColorStyle(slot: FixtureWheelSlot): any {
    if (slot.colors.length == 1) {
      // solid color
      return { 'background-color': slot.colors[0] }
    } else if (slot.colors.length == 2) {
      // mixed colors -> gradient

    }
  }

  getCurrentSlotIndex(): number {
    return this.presetService.getWheelValue(this._wheelName, this._fixtureTemplate.uuid);
  }

  slotIndexIsSelected(index: number): boolean {
    let selectedIndex = this.getCurrentSlotIndex();

    if(selectedIndex >= 0) {
      // a slot is selected
      return selectedIndex == index;
    } else {
      // no slot is selected and the capability is inactive
      // -> show the approx. color, if a color or a similar slot from a different wheel has been selected
      let approximatedColorWheelSlotIndex = this.presetService.getApproximatedColorWheelSlotIndex(this._wheelName, this._fixtureTemplate.uuid);
      return index == approximatedColorWheelSlotIndex;
    }
  }

  changeActive(active: boolean) {
    if (active) {
      this.presetService.setWheelValue(this._wheelName, this._fixtureTemplate.uuid, 0);
    } else {
      this.presetService.deleteWheelValue(this._wheelName, this._fixtureTemplate.uuid);
    }
  }

  selectSlotIndex(index: number) {
    this.presetService.setWheelValue(this._wheelName, this._fixtureTemplate.uuid, index);
  }

}
