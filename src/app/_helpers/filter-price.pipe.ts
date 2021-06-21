import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filterPrice",
})
export class FilterPricePipe implements PipeTransform {

  transform(prices: any, pricelist_id: number): number {
    console.log(prices);
    let v= prices.filter((v: { id: number; })=> v.id == 31);
    console.log(v);
    return v.price;
  }
}
