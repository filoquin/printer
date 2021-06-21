import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
} else {
	platformBrowserDynamic().bootstrapModule(AppModule);	
}

let onDeviceReady = () => {
  platformBrowserDynamic().bootstrapModule(AppModule);
  document.addEventListener("resume", onResume, false);

};
//platformBrowserDynamic().bootstrapModule(AppModule);

document.addEventListener('deviceready', onDeviceReady, false);

function onResume() {
	//alert('resume');
}
