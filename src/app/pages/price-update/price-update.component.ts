import { Component, OnInit } from "@angular/core";
import { ProductService } from "../../_services/product.service";
import { PriceChangesService } from "../../_services/price-changes.service";
import { PrinterService } from "../../_services/printer.service";
import { environment } from "../../../environments/environment";
import { DomSanitizer } from "@angular/platform-browser";
import { ConfigService } from "../../_services/config.service";
import html2canvas from "html2canvas";

@Component({
	selector: "app-price-update",
	templateUrl: "./price-update.component.html",
	styleUrls: ["./price-update.component.css"],

})
export class PriceUpdateComponent implements OnInit {
	product: any;
	product_ids: any;
	pricelist_ids: any;
	selected_pricelist_id: any;
	printer_status: boolean;
	prices: any;
	capturedImage;
	printAuto: boolean = false;
	printAutoDelay: number = 300;
	spinner: boolean = false;
	log: string = "";
	showLog: boolean = false;
	priceChageDate: string = "2021-05-14 00:00:00";
	//priceChageDate: string = "14/05/2021 00:00:00";

	constructor(
		public productService: ProductService,
		protected sanitizer: DomSanitizer,
		public PrinterService: PrinterService,
		public ConfigService: ConfigService,
		public PriceChangesService: PriceChangesService,
	
		) {}

	ngOnInit(): void {
		this.printAuto = this.ConfigService.params.printAuto;
		this.printAutoDelay = this.ConfigService.params.printAutoDelay;
		this.showLog = this.ConfigService.params.showLog;
		this.priceChageDate = this.ConfigService.params.priceChageDate;

		this.get_pricelist();
		if (this.ConfigService.params.PrinterName) {
			this.conectPrinter();
		}
		this.getPricechanges(this.priceChageDate);
	}
	conectPrinter() {
		this.PrinterService.connected().subscribe((res: any) => {
			if (res) {
				console.log("impresora conectada");
			} else {
				this.PrinterService.connectPrinter(
					this.ConfigService.params.PrinterName
				).subscribe();

				//PrinterName
			}
		});
	}
	connected() {
		this.PrinterService.connected().subscribe((res: any) => {
			this.printer_status = res;
		});
	}

	getPricechanges(date) {
		let parent = this;
		this.PriceChangesService.getPriceHistory(date).subscribe({
			next(res) {
				parent.product_ids = res["records"].map(item => item).filter(
					(value, index, self) => self.indexOf({product_tmpl_id: value.product_tmpl_id}) == -1);
			},

			complete() {
				console.log(parent.product_ids);
			},
		});
	}

	changeDate(event){
		if (event){
			this.priceChageDate = event;
			this.ConfigService.params.priceChageDate = event;
			this.ConfigService.saveParam('priceChageDate', event)
		}
	}

	searchByTmplId(line) {
		let parent = this;
		this.product = false;
		this.spinner = true;
		//this.changeDetectorRef.detectChanges();
		this.productService.searchByTmplId(line['product_tmpl_id'][0]).subscribe((res) => {
			if (res["length"] > 0) {
				parent.product = res["records"][0];
				parent.product["prices"] = [];
				parent.load_price(res["records"][0]["id"],line);

			} else {
				alert("Codigo invalido");
				this.spinner = false;
			}
		});
	}
	load_price(product_id, line) {
		let printAutoDelay: number = this.printAutoDelay;
		let parent = this;
		this.productService
			.load_price(product_id, this.selected_pricelist_id)
			.subscribe({
				next(price) {
					parent.product["prices"].push(price);
				},
				complete() {
					parent.spinner = false;
					parent.changeDate(line.datetime);
					line.printed = true;
					if (parent) {
						//parent.changeDetectorRef.detectChanges();
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
