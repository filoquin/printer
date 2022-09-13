import { Injectable } from "@angular/core";
import { OdooRPCService } from "./odoo-rpc.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  constructor(public odooRPC: OdooRPCService) {}

  searchByCode(code) {
    const transaction$ = new Observable((observer) => {
      const leaf = ["|", ["default_code", "=", code], ["barcode", "=", code]];
      this.odooRPC
        .searchRead(
          "product.product",
          leaf,
          ["name", "display_name", "default_code", "barcode", "description","product_tmpl_id",'price_public'],
          1,0,{"lang": "es_AR", 'display_default_code': false}
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

  load_price(product_id, pricelist_ids) {
    const transaction$ = new Observable((observer) => {
      var prlsIds: any = [];
      for (let list in pricelist_ids) {
        prlsIds.push(pricelist_ids[list].id);
      }
      this.odooRPC
        .call("product.pricelist", "price_get", [prlsIds, product_id, 1], {})
        .then((res) => {
          for (let list in pricelist_ids) {
            observer.next({
              id: pricelist_ids[list].id,
              name: pricelist_ids[list].name,
              price: res[pricelist_ids[list].id] * 1.21,
            });
          }

          observer.complete();
        })
        .catch((err) => {
          alert(err);
        });
    });
    return transaction$;
  }


  get_stock(product_id) {
    const transaction$ = new Observable((observer) => {
      this.odooRPC
        .searchRead(
          "stock.availability",
          [["product_id", "=", product_id]],
          ["virtual_available", "warehouse_id"]
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
  get_pricelists() {
    const transaction$ = new Observable((observer) => {
      this.odooRPC
        .searchRead(
          "product.pricelist",
          [['currency_id.name', '=', 'ARS']],
          ["name"]
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
  searchByTmplId(id) {
    const transaction$ = new Observable((observer) => {
      this.odooRPC
        .searchRead(
          "product.product",
          [['product_tmpl_id', '=', id]],
          ["name", "display_name", "default_code", "description","barcode","product_tmpl_id",'price_public'],
          1,0,{"lang": "es_AR", 'display_default_code': false}
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
/*  getDetail(item) {
    if (item.detailed) {
      item.detailed = false;
      return;
    }
    item.detailed = {};
    this.odooRPC
      .read("product.product", item.id, ["image", "description"])
      .then((res) => {
        if (res["description"]) {
          item.detailed.description = res["description"];
        }
        if (res["image"]) {
          item.detailed.image = this.sanitizer.bypassSecurityTrustResourceUrl(
            "data:image/jpg;base64," + res["image"].replace(/\n/g, "")
          );
        }
      });

    var prlsIds: any = [];

    for (let list in this.pricelists) {
      prlsIds.push(this.pricelists[list].id);
    }

    item.detailed.prices = [];
    this.odooRPC
      .call("product.pricelist", "price_get", [prlsIds, item.id, 1], {})
      .then((res) => {
      });

    this.odooRPC
      .searchRead(
        "stock.availability",
        [["product_id", "=", item.id]],
        ["virtual_available", "warehouse_id"],
        0,
        0,
        {}
      )
      .then((res) => {
        item.detailed.stock = [];
        for (let stock in res["records"]) {
          item.detailed.stock.push({
            name: this.warehouses_names[res["records"][stock]["warehouse_id"]],
            virtual_available: res["records"][stock]["virtual_available"],
          });
        }
      });
  }*/
