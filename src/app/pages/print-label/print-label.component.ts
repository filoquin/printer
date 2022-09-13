import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import { HostListener } from "@angular/core";
import { ProductService } from "../../_services/product.service";
import { PrinterService } from "../../_services/printer.service";
import html2canvas from "html2canvas";
import { environment } from "../../../environments/environment";
import { DomSanitizer } from "@angular/platform-browser";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Events } from "../../_services/events.service";
import { BarcodeProvider } from "../../_services/intent.service";
import { ConfigService } from "../../_services/config.service";

function _window(): any {
  // return the global native browser window object
  return window;
}

@Component({
  selector: "app-print-label",
  templateUrl: "./print-label.component.html",
  styleUrls: ["./print-label.component.css"],
  providers: [BarcodeProvider],
})
export class PrintLabelComponent implements OnInit {
  textBus: string = "";
  keyboardDisable: boolean = true;
  intefaceBlocked: boolean = false;
  product: any;
  pricelist_ids: any;
  selected_pricelist_id: any;
  printer_status: boolean;
  prices: any;
  capturedImage;
  searchForm: FormGroup;
  inputMethod = "textBus";
  printAuto: boolean = false;
  printAutoDelay: number = 300;
  spinner: boolean = false;
  log: string = "";
  showLog: boolean = false;


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

  @ViewChild("screen") screen: ElementRef;
  @ViewChild("canvas") canvas: ElementRef;
  //@ViewChild("search") searchElement: ElementRef;


  constructor(
    public productService: ProductService,
    protected sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    public PrinterService: PrinterService,
    public barcodeProvider: BarcodeProvider,
    public events: Events,
    private changeDetectorRef: ChangeDetectorRef,
    public ConfigService: ConfigService
  ) {
  }

  ngOnInit(): void {
    this.printAuto = this.ConfigService.params.printAuto;
    this.printAutoDelay = this.ConfigService.params.printAutoDelay;
    this.inputMethod = this.ConfigService.params.scanMethod;
    this.showLog = this.ConfigService.params.showLog;

    this.searchForm = this.formBuilder.group({
      search: ["", Validators.required],
    });

    //this.connected();
    this.get_pricelist();

    this.textBus = "";
    if (this.inputMethod == "form") {
     // this.searchElement.nativeElement.focus();
    }
    if (!environment.production) {
      //this.barcodeProvider.test();
    }


    let parent = this;
    this.barcodeProvider.BarcodeData.subscribe((res: any) => {
      if (parent.inputMethod == "textBus" && res) {
        parent.textBus = res;
        parent.log = res;
        parent.searchByCode(res);
        parent.changeDetectorRef.detectChanges();

      }
    });
    if(this.ConfigService.params.PrinterName){
      this.conectPrinter();
    }
  }


  conectPrinter(){
    this.PrinterService.connected().subscribe(
      (res: any) => {
        if (res){
          console.log('impresora conectada');
        } else {
          this.PrinterService.connectPrinter(this.ConfigService.params.PrinterName).subscribe();

          //PrinterName
        }
      }
    );
  }
  connected() {
    this.PrinterService.connected().subscribe((res: any) => {
      this.printer_status = res;
    });
  }


  formSearch() {
    const search = this.searchForm.controls.search.value;
    this.searchByCode(search);
    this.searchForm.controls.search.patchValue("");
    //this.searchElement.nativeElement.focus();
  }
  searchByCode(searchSting) {
    //alert('searchSting' + searchSting);
    let parent= this;
    this.log += '|' + searchSting + "|";
    this.product = false;
    this.spinner = true;
    this.changeDetectorRef.detectChanges();
    this.productService.searchByCode(searchSting).subscribe((res) => {
      if (res["length"] > 0) {
        parent.product = res["records"][0];
        parent.log = parent.log + res["records"][0]["name"] + "|";
        parent.product['prices'] = [];
        parent.product['prices_dict'] = {};
        parent.load_price(res["records"][0]["id"]);
      } else {
        alert("Codigo invalido");
        this.spinner = false;
        this.textBus = "";
      }
    });
    this.textBus = "";
  }

  load_price(product_id) {
    let printAutoDelay: number = this.printAutoDelay;
    let parent = this;
    this.productService
      .load_price(product_id, this.selected_pricelist_id)
      .subscribe({
        next(price) {
          parent.log = parent.log + JSON.stringify(price) + "|";
          parent.product["prices"].push(price);
          parent.product['prices_dict'][price['id']] = price['price']
        },
        complete() {
          parent.spinner = false;
          if(parent){

            parent.changeDetectorRef.detectChanges();
          }

          if (parent.printAuto) {
            setTimeout(() => {
              parent.printTag();
            }, parent.printAutoDelay);
          }
        },
      });
  }
  get_pricelist() {
    this.productService.get_pricelists().subscribe((res) => {
      if (res["length"] > 0) {
        this.pricelist_ids = res["records"];
        this.selected_pricelist_id = res["records"];
      }
    });
  }
  setPriceList(pricelist_id) {
    this.selected_pricelist_id = pricelist_id;
    //  this.load_price(this.product.id);
  }
  printTag() {
    if (this.product) {
      html2canvas(document.querySelector(".etiqueta"), {
        width: this.ConfigService.params.labelWidth,
        height: this.ConfigService.params.labelHeight,
        windowWidth: this.ConfigService.params.labelWidth,
        windowHeight: this.ConfigService.params.labelHeight,
        backgroundColor: "#FFFFFF",
      }).then((canvas) => {
        let b64 = canvas.toDataURL();
        this.capturedImage = this.sanitizer.bypassSecurityTrustResourceUrl(
          b64.replace(/\n/g, "")
        );
        this.PrinterService.printBase64(b64).subscribe((res: any) => {
          //console.log(res);
          this.capturedImage = "";
        });
      });
    }
  }

  toglePrintAuto() {
    this.printAuto = !this.printAuto;
  }
}
