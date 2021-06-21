import { Component, OnInit, Output, Input, EventEmitter } from "@angular/core";
import { ConfigService } from "../../../_services/config.service";


@Component({
  selector: 'app-price-label',
  templateUrl: './price-label.component.html',
  styleUrls: ['./price-label.component.css']
})
export class PriceLabelComponent implements OnInit {

  constructor(public ConfigService: ConfigService) { }
  @Output() printLabel = new EventEmitter();

  @Input() product: any;

  ngOnInit(): void {
  }

  filter_price(pricelist, list){
    return pricelist.filter(v => v['id'] >= list);
  }
  print(){
  	this.printLabel.emit();
  }

}
