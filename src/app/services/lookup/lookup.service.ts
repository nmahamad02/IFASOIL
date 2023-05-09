import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private url = 'http://15.185.46.105:5013/api/';

  constructor(private http:HttpClient) { }

  getAllData(){
    return this.http.get(this.url + 'data')
  }

  getBatchData(month: string){
    return this.http.get(this.url + 'batch/data/' + month)
  }  
  
  getChartData(month: string){
    return this.http.get(this.url + 'chart/data/' + month)
  }  
  
  getParameterData(){
    return this.http.get(this.url + 'parameter/data')

  }
}
