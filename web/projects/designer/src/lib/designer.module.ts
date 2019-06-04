import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { DesignerComponent } from './designer.component';
import { PreviewComponent } from './preview/preview.component';
import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
import { FormsModule } from '@angular/forms';
import { EffectCurveComponent } from './effect/effect-curve/effect-curve.component';
import { EffectPanTiltComponent } from './effect/effect-pan-tilt/effect-pan-tilt.component';
import { SceneComponent } from './scene/scene.component';
import { TimelineComponent } from './timeline/timeline.component';
import { FixtureCapabilityColorComponent } from './fixture/fixture-capability/fixture-capability-color/fixture-capability-color.component';
import { FixtureComponent } from './fixture/fixture.component';
import { FixtureSettingsPositionComponent } from './fixture/fixture-settings/fixture-settings-position/fixture-settings-position.component';
import { FixtureCapabilityComponent } from './fixture/fixture-capability/fixture-capability.component';
import { FixtureSettingsComponent } from './fixture/fixture-settings/fixture-settings.component';
import { EffectComponent } from './effect/effect.component';
import { FixturePoolComponent } from './fixture-pool/fixture-pool.component';
import { PresetComponent } from './preset/preset.component';
import { MasterDimmerComponent } from './master-dimmer/master-dimmer.component';
import { FixtureCapabilityDimmerComponent } from './fixture/fixture-capability/fixture-capability-dimmer/fixture-capability-dimmer.component';
import { TimelineGridComponent } from './timeline/timeline-grid/timeline-grid.component';
import { CompositionSettingsComponent } from './timeline/composition-settings/composition-settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { SortablejsModule } from 'angular-sortablejs';
import { PopoverModule, AccordionModule, TypeaheadModule } from 'ngx-bootstrap';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ArraySortPipe } from './array-sort-pipe';
import { WarningDialogComponent } from './warning-dialog/warning-dialog.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FixtureCapabilityPanTiltComponent } from './fixture/fixture-capability/fixture-capability-pan-tilt/fixture-capability-pan-tilt.component';
import { FixtureCapabilityChannelComponent } from './fixture/fixture-capability/fixture-capability-channel/fixture-capability-channel.component';
import { FixtureChannelComponent } from './fixture/fixture-channel/fixture-channel.component';

const DROPZONE_CONFIG: DropzoneConfigInterface = {
};

@NgModule({
  declarations: [
    DesignerComponent,
    WarningDialogComponent,
    PreviewComponent,
    EffectCurveComponent,
    EffectPanTiltComponent,
    SceneComponent,
    TimelineComponent,
    FixtureCapabilityColorComponent,
    FixtureComponent,
    FixtureSettingsPositionComponent,
    FixtureCapabilityComponent,
    FixtureSettingsComponent,
    EffectComponent,
    FixturePoolComponent,
    PresetComponent,
    MasterDimmerComponent,
    FixtureCapabilityDimmerComponent,
    TimelineGridComponent,
    CompositionSettingsComponent,
    ArraySortPipe,
    FixtureCapabilityPanTiltComponent,
    FixtureCapabilityChannelComponent,
    FixtureChannelComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    NgxBootstrapSliderModule,
    TranslateModule,
    AccordionModule,
    PopoverModule,
    TypeaheadModule,
    SortablejsModule,
    DropzoneModule.forRoot(DROPZONE_CONFIG),
    ToastrModule.forRoot({
      newestOnTop: true
    }),
  ],
  entryComponents: [
    FixturePoolComponent,
    TimelineGridComponent,
    CompositionSettingsComponent,
    WarningDialogComponent
  ],
  exports: [DesignerComponent]
})

export class DesignerModule {}