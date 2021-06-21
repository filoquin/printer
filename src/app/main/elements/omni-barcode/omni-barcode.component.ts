import {
	Component,
	OnInit,
	ElementRef,
	ViewChild,
	ChangeDetectorRef,
	Output,
	Input,
	EventEmitter,
	HostListener,
} from "@angular/core";
import { ProductService } from "../../../_services/product.service";
import { environment } from "../../../../environments/environment";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Events } from "../../../_services/events.service";
import { BarcodeProvider } from "../../../_services/intent.service";

@Component({
	selector: "app-omni-barcode",
	templateUrl: "./omni-barcode.component.html",
	styleUrls: ["./omni-barcode.component.css"],
})
export class OmniBarcodeComponent implements OnInit {
    searchForm: FormGroup;
    textBus: string = "";
 
	@Output() sendBarcode = new EventEmitter();
	@Input() inputMethod: any;


	  //ZEBRA
	  private scans = [];
	  private scanners = [{ "SCANNER_NAME": "Please Wait...", "SCANNER_INDEX": 0, "SCANNER_CONNECTION_STATE": true }];
	  private selectedScanner = "Please Select...";
	  private selectedScannerId = -1;
	  private ean8Decoder = true;   //  Model for decoder
	  private ean13Decoder = true;  //  Model for decoder
	  private code39Decoder = true; //  Model for decoder
	  private code128Decoder = true;//  Model for decoder
	  private dataWedgeVersion = "Pre 6.3. Please create & configure profile manually.  See the ReadMe for more details.";
	  private availableScannersText = "Requires Datawedge 6.3+"
	  private activeProfileText = "Requires Datawedge 6.3+";
	  private commandResultText = "Messages from DataWedge will go here";
	  private uiHideDecoders = true;
	  private uiDatawedgeVersionAttention = true;
	  private uiHideSelectScanner = true;
	  private uiHideShowAvailableScanners = false;
	  private uiHideCommandMessages = true;
	  private uiHideFloatingActionButton = true;
	  //ZEBRA


  constructor(
    public productService: ProductService,
    private formBuilder: FormBuilder,
    public barcodeProvider: BarcodeProvider,
    public events: Events,
    private changeDetectorRef: ChangeDetectorRef
  ) {    this.barcodeProvider.sendCommand("com.symbol.datawedge.api.GET_VERSION_INFO", "");

      ////////////////////////////
      //  EVENT HANDLING
      ////////////////////////////

      //  6.3 DataWedge APIs are available
      events.subscribe('status:dw63ApisAvailable', (isAvailable) => {
        console.log("DataWedge 6.3 APIs are available");
        //  We are able to create the profile under 6.3.  If no further version events are received, notify the user
        //  they will need to create the profile manually
        this.barcodeProvider.sendCommand("com.symbol.datawedge.api.CREATE_PROFILE", "CasaGoro");
        this.dataWedgeVersion = "6.3.  Please configure profile manually.  See the ReadMe for more details.";

        //  Although we created the profile we can only configure it with DW 6.4.
        this.barcodeProvider.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");

        //  Enumerate the available scanners on the device
        this.barcodeProvider.sendCommand("com.symbol.datawedge.api.ENUMERATE_SCANNERS", "");

        //  Functionality of the FAB is available so display the button
        this.uiHideFloatingActionButton = false;

        this.changeDetectorRef.detectChanges();
      });

      //  6.4 Datawedge APIs are available
      events.subscribe('status:dw64ApisAvailable', (isAvailable) => {
        console.log("DataWedge 6.4 APIs are available");

        //  Documentation states the ability to set a profile config is only available from DW 6.4.
        //  For our purposes, this includes setting the decoders and configuring the associated app / output params of the profile.
        this.dataWedgeVersion = "6.4";
        this.uiDatawedgeVersionAttention = false;
        this.uiHideDecoders = !isAvailable;

        //  Configure the created profile (associated app and keyboard plugin)
        let profileConfig = {
          "PROFILE_NAME": "CasaGoro",
          "PROFILE_ENABLED": "true",
          "CONFIG_MODE": "UPDATE",
          "PLUGIN_CONFIG": {
            "PLUGIN_NAME": "BARCODE",
            "RESET_CONFIG": "true",
            "PARAM_LIST": {}
          },
          "APP_LIST": [{
            "PACKAGE_NAME": "com.filoquin.goro",
            "ACTIVITY_LIST": ["*"]
          }]
        };
        this.barcodeProvider.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);

        //  Configure the created profile (intent plugin)
        let profileConfig2 = {
          "PROFILE_NAME": "CasaGoro",
          "PROFILE_ENABLED": "true",
          "CONFIG_MODE": "UPDATE",
          "PLUGIN_CONFIG": {
            "PLUGIN_NAME": "INTENT",
            "RESET_CONFIG": "true",
            "PARAM_LIST": {
              "intent_output_enabled": "true",
              "intent_action": "com.filoquin.goro.ACTION",
              "intent_delivery": "2"
            }
          }
        };
        this.barcodeProvider.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig2);

        //  Give some time for the profile to settle then query its value
        setTimeout(function () {
          barcodeProvider.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");
        }, 1000);

        this.changeDetectorRef.detectChanges();
      });

      //  6.5 Datawedge APIs are available
      events.subscribe('status:dw65ApisAvailable', (isAvailable) => {
        console.log("DataWedge 6.5 APIs are available");

        //  The ability to switch to a new scanner is only available from DW 6.5 onwards
        //  Reconfigure UI so the user can choose the desired scanner
        this.uiHideSelectScanner = false;
        this.uiHideShowAvailableScanners = true;

        //  6.5 also introduced messages which are received from the API to indicate success / failure
        this.uiHideCommandMessages = false;
        this.barcodeProvider.requestResult(true);
        this.dataWedgeVersion = "6.5 or higher";
        this.changeDetectorRef.detectChanges();
      });

      //  Response to our request to find out the active DW profile
      events.subscribe('data:activeProfile', (activeProfile) => {
        console.log("Active profile: " + activeProfile);

        //  Update the UI
        this.activeProfileText = activeProfile;

        this.changeDetectorRef.detectChanges();
      });

      //  The result (success / failure) of our last API call along with additional information
      events.subscribe('data:commandResult', (commandResult) => {
        this.commandResultText = commandResult;
        this.changeDetectorRef.detectChanges();
      });

      //  Response to our requet to enumerte the scanners
      events.subscribe('data:enumeratedScanners', (enumeratedScanners) => {
        //  Maintain two lists, the first for devices which support DW 6.5+ and shows a combo box to select
        //  the scanner to use.  The second will just display the available scanners in a list and be available
        //  for 6.4 and below
        this.scanners = enumeratedScanners;
        let humanReadableScannerList = "";
        enumeratedScanners.forEach((scanner, index) => {
          console.log("Scanner found: name= " + scanner.SCANNER_NAME + ", id=" + scanner.SCANNER_INDEX + ", connected=" + scanner.SCANNER_CONNECTION_STATE);
          humanReadableScannerList += scanner.SCANNER_NAME;
          if (index < enumeratedScanners.length - 1)
            humanReadableScannerList += ", ";
        });
        this.availableScannersText = humanReadableScannerList;
        this.scanners.unshift({"SCANNER_NAME": "Please Select...", "SCANNER_INDEX":-1, "SCANNER_CONNECTION_STATE":false});
        this.changeDetectorRef.detectChanges();
      });

      //  A scan has been received
      events.subscribe('data:scan', (data: any) => {
        //  Update the list of scanned barcodes
        let scannedData = data.scanData.extras["com.symbol.datawedge.data_string"];
        let scannedType = data.scanData.extras["com.symbol.datawedge.label_type"];
        this.scans.unshift({ "data": scannedData, "type": scannedType, "timeAtDecode": data.time });

        //  On older devices, if a scan is received we can assume the profile was correctly configured manually
        //  so remove the yellow highlight.
        this.uiDatawedgeVersionAttention = false;

        //this.changeDetectorRef.detectChanges();
      });}


	@HostListener("document:keypress", ["$event"])
	handleKeyboardpressEvent(event: KeyboardEvent) {
		if (this.inputMethod == "form" && event.keyCode == 13) {
			this.formSearch();
		}
		if (this.inputMethod != "textBus") {
			return;
		}
		if (event.keyCode == 13) {
			this.emitBarcode(this.textBus);
		} else {
			this.textBus += event.key;
			event.stopPropagation();
		}
	}
	@HostListener("document:keydown", ["$event"])
	handleKeyboardEvent(event: KeyboardEvent) {
		if (this.inputMethod != "textBus") {
			return;
		}
		if (event.keyCode == 27) {
			this.textBus = "";
		} else if (event.keyCode == 8) {
			//this.textBus = this.textBus.substring(0, this.textBus.length - 1);
		}
	}
  	ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      search: ["", Validators.required],
    });

	}
	emitBarcode(code){

	}
	formSearch() {
    const search = this.searchForm.controls.search.value;
    this.emitBarcode(search);
    this.searchForm.controls.search.patchValue("");
  }
	
}
