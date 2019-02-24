import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AppComponent } from './app.component';
import { PreviewComponent } from './preview/preview.component';

import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
import { AccordionModule, PopoverModule } from 'ngx-bootstrap';
import { SortablejsModule } from 'angular-sortablejs';
import { FormsModule } from '@angular/forms';
import { EffectCurveComponent } from './effect/effect-curve/effect-curve.component';
import { EffectPanTiltComponent } from './effect/effect-pan-tilt/effect-pan-tilt.component';
import { SceneComponent } from './scene/scene/scene.component';
import { TimelineComponent } from './timeline/timeline.component';
import { FixturePropertyColorComponent } from './fixture/fixture-property/fixture-property-color/fixture-property-color.component';
import { FixtureComponent } from './fixture/fixture.component';
import { FixtureSettingsPositionComponent } from './fixture/fixture-settings/fixture-settings-position/fixture-settings-position.component';
import { FixturePropertyComponent } from './fixture/fixture-property/fixture-property.component';
import { FixtureSettingsComponent } from './fixture/fixture-settings/fixture-settings.component';
import { EffectComponent } from './effect/effect.component';
import { FixturePoolComponent } from './fixture-pool/fixture-pool.component';

@NgModule({
  declarations: [
    AppComponent,
    PreviewComponent,
    EffectCurveComponent,
    EffectPanTiltComponent,
    SceneComponent,
    TimelineComponent,
    FixturePropertyColorComponent,
    FixtureComponent,
    FixtureSettingsPositionComponent,
    FixturePropertyComponent,
    FixtureSettingsComponent,
    EffectComponent,
    FixturePoolComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgxBootstrapSliderModule,
    AccordionModule.forRoot(),
    PopoverModule.forRoot(),
    SortablejsModule.forRoot({
      animation: 300,
      handle: '.list-sort-handle'
    }),
  ],
  entryComponents: [
    FixturePoolComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
