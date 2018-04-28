import { APP_DECLARATIONS } from './app.declarations';
import { APP_ENTRY_COMPONENTS } from './app.entry-components';
import { APP_IMPORTS } from './app.imports';
import { APP_PROVIDERS } from './app.providers';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
// import { routes } from './app.routing';
// import { IdlePreload, IdlePreloadModule } from 'angular-idle-preload';
@NgModule({
  declarations: [
    AppComponent,
    APP_DECLARATIONS
  ],
  entryComponents: [APP_ENTRY_COMPONENTS],
  imports: [
    HttpClientModule,
    BrowserModule,
    RouterModule.forRoot([]),
    SharedModule,
    APP_IMPORTS,
    // IdlePreloadModule.forRoot(), // forRoot ensures the providers are only created once
    // RouterModule.forRoot(routes, { useHash: false, preloadingStrategy: IdlePreload }),
  ],
  providers: [
    APP_PROVIDERS,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
