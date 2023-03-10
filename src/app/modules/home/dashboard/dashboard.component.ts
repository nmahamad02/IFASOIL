import { Component, OnInit } from '@angular/core';
import { LookupService } from 'src/app/services/lookup/lookup.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  runtimeData: any[] = [];
  parameterData: any[] = [];

  checkTemp: boolean = true;
  checkHumd: boolean = false;

  constructor(private lookupDataService: LookupService) { }

  ngOnInit(): void {
    this.lookupDataService.getBatchData().subscribe((res: any) => {
      console.log(res);
      this.runtimeData = res.recordset;
      console.log(this.runtimeData);
    })
    this.lookupDataService.getParameterData().subscribe((res: any) => {
      console.log(res);
      this.parameterData = res.recordset;
      console.log(this.parameterData);
      if ((this.runtimeData[0].OUTSIDETEMPERATURE > this.parameterData[0].MINVAL) && (this.runtimeData[0].OUTSIDETEMPERATURE > this.parameterData[0].MAXVAL)) {
        this.checkTemp = true;
      } else {
        this.checkTemp = false;
      }
      if ((this.runtimeData[0].HUMIDITY > this.parameterData[1].MINVAL) && (this.runtimeData[0].HUMIDITY > this.parameterData[1].MAXVAL)) {
        this.checkHumd = true;
      } else {
        this.checkHumd = false;
      }
    })
  }

}
