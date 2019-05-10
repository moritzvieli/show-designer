import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { DesignerModule } from 'projects/designer/src/public_api';
import { ModalModule, AccordionModule, PopoverModule, TypeaheadModule } from 'ngx-bootstrap';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SortablejsModule } from 'angular-sortablejs';
import { AppHttpInterceptor } from 'src/app/app-http-interceptor/app-http-interceptor';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    DesignerModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AccordionModule.forRoot(),
    PopoverModule.forRoot(),
    TypeaheadModule.forRoot(),
    SortablejsModule.forRoot({
      animation: 300,
      handle: '.list-sort-handle'
    }),
  ],
  providers: [
    AppHttpInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppHttpInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/designer/i18n/", ".json");
}