import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  params: any;
  default_params: any = JSON.stringify({
    scanMethod:'textBus', 
    showLog:false, 
    printAuto:false, 
    printAutoDelay:300,
    labelWidth:300,
    labelHeight:250,
    PrinterName: '',
    priceChageDate: '',
  });

  constructor() {
	this.loadConfig();
   }

  loadConfig(){
  	this.params = JSON.parse(localStorage.getItem('appConfig') || this.default_params);  
  }

  saveParam(param , value){
    this.params['param'] = value;
     localStorage.setItem('appConfig',JSON.stringify(this.params));  
  }


  saveConfig(params){
  	 localStorage.setItem('appConfig',JSON.stringify(params));  
  	 this.params = params;
  }

}
