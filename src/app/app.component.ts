import { Component, ChangeDetectorRef } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { BarcodeProvider } from "./_services/intent.service"
import { Events } from "./_services/events.service"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [BarcodeProvider],

})
export class AppComponent {
  title = 'Zebra';



      constructor(
        private barcodeProvider: BarcodeProvider,
        public events: Events, 
        private changeDetectorRef: ChangeDetectorRef,    

        ) { 
 

      

  }
}
