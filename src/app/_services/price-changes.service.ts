import { Injectable } from "@angular/core";
import { OdooRPCService } from "./odoo-rpc.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PriceChangesService {

  constructor(public odooRPC: OdooRPCService) {}

  getPriceHistory(fromDate, location_ids=[]) {
    const transaction$ = new Observable((observer) => {
      const leaf = [['datetime', '>=',fromDate]];
      this.odooRPC
        .searchRead(
          "watching.products.price.changes",
          leaf,
          ['product_template_id','datetime', 'list_price'],
          300,0,{"lang": "es_AR"}, 'datetime asc'
        )
        .then((res) => {
          observer.next(res);
          observer.complete();
        })
        .catch((err) => {
          alert(err);
        });
    });
    return transaction$;
  }


  
}
