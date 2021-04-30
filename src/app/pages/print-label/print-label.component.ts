import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { HostListener } from "@angular/core";
import { ProductService } from "../../_services/product.service";
import { PrinterService } from "../../_services/printer.service";
import html2canvas from "html2canvas";
import { environment } from "../../../environments/environment";
import { DomSanitizer } from "@angular/platform-browser";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

function _window(): any {
  // return the global native browser window object
  return window;
}

@Component({
  selector: "app-print-label",
  templateUrl: "./print-label.component.html",
  styleUrls: ["./print-label.component.css"],
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


  @ViewChild("screen") screen: ElementRef;
  @ViewChild("canvas") canvas: ElementRef;

  constructor(
    public productService: ProductService,
    protected sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,    
    public PrinterService: PrinterService
  ) {}

  ngOnInit(): void {
   this.searchForm = this.formBuilder.group({
      search: ["", Validators.required],
    });

    this.connected();
    this.get_pricelist();
    this.textBus = "";
    if (environment.production == false) {
      //this.printer_status = true;
    }
    //this.addCode();
  }
  connected() {
    // this.printer_status = true;

    this.PrinterService.connected().subscribe((res: any) => {
      this.printer_status = res;
    });
  }

  keyP(event: KeyboardEvent) {
    if (this.intefaceBlocked) {
      return;
    }
    if (this.keyboardDisable == true) {
      if (event.keyCode == 13) {
        this.addCode();
      } else {
        this.textBus += event.key;
        event.stopPropagation();
      }
    }
  }
  keyD(event: KeyboardEvent) {
    if (this.intefaceBlocked) {
      return;
    }
    if (event.keyCode == 27) {
      this.textBus = "";
    } else if (event.keyCode == 8) {
      this.textBus = this.textBus.substring(0, this.textBus.length - 1);
    }
  }


  /*@HostListener("document:keypress", ["$event"])
  handleKeyboardpressEvent(event: KeyboardEvent) {
    if (this.intefaceBlocked) {
      return;
    }
    if (this.keyboardDisable == true) {
      if (event.keyCode == 13) {
        this.addCode();
      } else {
        this.textBus += event.key;
        event.stopPropagation();
      }
    }
  }
  @HostListener("document:keydown", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.intefaceBlocked) {
      return;
    }
    if (event.keyCode == 27) {
      this.textBus = "";
    } else if (event.keyCode == 8) {
      this.textBus = this.textBus.substring(0, this.textBus.length - 1);
    }
  }*/


  addCode() {
    const search = this.searchForm.controls.search.value;


    this.productService.searchByCode(search).subscribe((res) => {
      if (res["length"] > 0) {
        this.product = res["records"][0];
        this.product.prices = [];
        this.load_price(res["records"][0].id);
      }
    });
    //this.textBus = "";
  }

  load_price(product_id) {
    this.productService
      .load_price(product_id, this.selected_pricelist_id)
      .subscribe((res) => {
        this.product.prices.push(res);
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
    this.product.prices = [];
    this.load_price(this.product.id);
  }
  testPrint() {
    if (this.product) {
      html2canvas(document.querySelector(".etiqueta"), {
        width: 300,
        height: 150,
        windowWidth: 300,
        windowHeight: 150,
        backgroundColor: "#FFFFFF",
      }).then((canvas) => {
        let b64 = canvas.toDataURL();
        this.capturedImage = this.sanitizer.bypassSecurityTrustResourceUrl(
          b64.replace(/\n/g, "")
        );
        this.PrinterService.printBase64(b64).subscribe((res: any) => {
          //alert(res);
          //this.capturedImage ='';
        });

        /*let template ="linefeed|\ntext|este es un TEST\ntext|" + this.product.name + "\nlinefeed|\n" 
      this.PrinterService.printTemplate(template);*
      let b64  = this.downloadImage();
    this.PrinterService.printBase64(b64).subscribe((res: any) => {
      alert(res);
    });
*/
      });

      /*this.PrinterService.printText(this.product.name, "4").subscribe(
        (res: any) => {
          this.PrinterService.lineFeed().subscribe((res: any) => {
            this.PrinterService.printText(this.product.price[0].price, "2").subscribe(
              (res: any) => {}
            );
          });
        }
      );*/
    }
  }
}
