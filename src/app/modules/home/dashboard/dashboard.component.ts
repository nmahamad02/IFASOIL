import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import * as moment from 'moment';
import { BaseChartDirective } from 'ng2-charts';
import { LookupService } from 'src/app/services/lookup/lookup.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;
  
  runtimeData: any[] = [];
  chartData: any[] = [];
  parameterData: any[] = [];
  
  dayData: any[] = [];
  evtData: number[] = [];
  dateLabelData: string[] = []

  tempData: number[] = [];
  humdData: number[] = [];
  labelData: string[] = [];

  checkTemp: boolean = true;
  checkHumd: boolean = false;

  utc = new Date();
  mCurMonth = this.formatMonth(this.utc);
  mCurYear = this.formatYear(this.utc);

  constructor(private lookupDataService: LookupService) { }

  ngOnInit(): void {
    this.lookupDataService.getBatchData(this.mCurMonth).subscribe((res: any) => {
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

    for (let j = Number(this.mCurMonth.substring(1,2)); j !=0; j--) {
      this.lookupDataService.getChartData(`${j}-${this.mCurYear}`).subscribe((res: any) => {
        this.chartData = res.recordset;
        console.log(this.chartData);
  
        for (let i = 0; i < this.chartData.length; i++) {
          const dateTime = `${this.chartData[i].CHECKTIME}, ${this.chartData[i].CHECKDATE}`
          this.labelData.push(dateTime)
          this.tempData.push(Number(this.chartData[i].OUTSIDETEMPERATURE))
          this.humdData.push(Number(this.chartData[i].HUMIDITY))
        }
  
        this.charts.forEach((child) => {
          console.log(this.charts)
          child.chart!.update()
        });
      })
    }

    this.lookupDataService.getDayData().subscribe((res: any) => {
      this.dayData = res.recordset;

      for (let i=0; i < this.dayData.length; i++) {
        this.lookupDataService.getDaywiseData(this.dayData[i].CHECKDATE).subscribe((resp: any) => {
          this.dateLabelData.push(this.dayData[i].CHECKDATE)
          let tempData = resp.recordset;
          console.log(tempData)
          var tMean = (tempData[0].MAXTEMP + tempData[0].MINTEMP)/2
          
          // Finding DELTA
          var A = ((17.27 * tMean)/(tMean + 237.3))
          var B = Math.exp(A)
          var C = 4098*0.6108*B
          var D = (tMean + 273.3)^2
          var delta = C/D

          // Finding eTMax
          var E = ((17.27 * tempData[0].MAXTEMP)/(tempData[0].MAXTEMP + 237.3))
          var F = Math.exp(E)
          var eTMAx = 0.6108*F
          
          // Finding eTMin
          var G = ((17.27 * tempData[0].MINTEMP)/(tempData[0].MINTEMP + 237.3))
          var H = Math.exp(G)
          var eTMin = 0.6108*H

          // Finding eS
          var eS = (eTMAx + eTMin)/2

          // Finding eA
          var eA = ((eTMAx*(tempData[0].MINHUMD/100)) + (eTMin * (tempData[0].MAXHUMD/100)))/2

          // Finding evt
          var I = 19.5 - 0.371
          var J = 0.408 * delta * I
          var K = eS - eA
          var L = 900/(tMean + 273)
          var M = K * L * 0.0674 * 281
          var N = (1 + (0.34*281))
          var O = 0.0674 * N
          var P = delta + O
          var evt = (J + M) / P

          this.evtData.push(evt);
        })
      }
    })

  }

  public chart1Data: ChartConfiguration<'line'>['data'] = {
    labels: this.labelData,
    datasets: [
      {
        data: this.tempData,
        label: 'Soil Temperature (˚C)',
        fill: false,
        tension: 0.5,
        borderColor: 'rgba(255,0,0,1)',
        backgroundColor: 'rgba(255,0,0,0.5)',
        yAxisID: 'y-axis-l',
      },
      {
        data: this.humdData,
        label: 'Soil Humidity (%)',
        fill: false,
        tension: 0.5,
        borderColor: 'rgba(255,128,0,1)',
        backgroundColor: 'rgba(255,128,0,0.3)',
        yAxisID: 'y-axis-r',
      },
    ],
  };


  public chart2Data: ChartConfiguration<'line'>['data'] = {
    labels: this.dateLabelData,
    datasets: [
      {
        data: this.tempData,
        label: 'Evapotranspiration (mm/day)',
        fill: false,
        tension: 0.5,
        borderColor: 'rgba(0,255,0,1)',
        backgroundColor: 'rgba(0,255,0,0.5)',
        yAxisID: 'y-axis-l',
      },
    ],
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      'y-axis-l': {
        position: 'left',
      },
      'y-axis-r': {
        position: 'right',
      },
    },
  };
  public lineChartLegend = true;
  

  formatMonth(date: any) {
    var d = new Date(date), day = '' + d.getDate(), month = '' + (d.getMonth() + 1), year = d.getFullYear();

    if (day.length < 2) {
      day = '0' + day;
    } 
    if (month.length < 2) {
      month = '0' + month;
    }
    return [month, year].join('-');
  }

  formatYear(date: any) {
    var d = new Date(date), day = '' + d.getDate(), month = '' + (d.getMonth() + 1), year = d.getFullYear();

    if (day.length < 2) {
      day = '0' + day;
    } 
    if (month.length < 2) {
      month = '0' + month;
    }
    return [year].join('-');
  }

}
