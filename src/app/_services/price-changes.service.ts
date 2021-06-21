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
          "product.sale.price.history",
          leaf,
          ['product_tmpl_id','datetime'],
          0,0,{"lang": "es_AR", 'display_default_code': false}, 'datetime asc'
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
