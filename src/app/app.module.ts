import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { PreviewComponent } from './preview/preview.component';

import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
import { AccordionModule, PopoverModule } from 'ngx-bootstrap';
import { SortablejsModule } from 'angular-sortablejs';
import { FormsModule } from '@angular/forms';
import { EffectCurveComponent } from './effects/effect-curve/effect-curve.component';
import { EffectPanTiltComponent } from './effects/effect-pan-tilt/effect-pan-tilt.component';

@NgModule({
  declarations: [
    AppComponent,
    PreviewComponent,
    EffectCurveComponent,
    EffectPanTiltComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgxBootstrapSliderModule,
    AccordionModule.forRoot(),
    PopoverModule.forRoot(),
    SortablejsModule.forRoot({
      animation: 300,
      handle: '.list-sort-handle'
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
