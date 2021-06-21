import { Component, OnInit, Output, Input, EventEmitter } from "@angular/core";


@Component({
  selector: 'app-product-prices',
  templateUrl: './product-prices.component.html',
  styleUrls: ['./product-prices.component.css']
})
export class ProductPricesComponent implements OnInit {

  constructor() { }
  @Input() product: any;

  ngOnInit(): void {
  }

}
