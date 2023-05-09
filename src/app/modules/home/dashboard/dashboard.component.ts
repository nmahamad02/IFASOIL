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
    
  }

  public chart1Data: ChartConfiguration<'line'>['data'] = {
    labels: this.labelData,
    datasets: [
      {
        data: this.tempData,
        label: 'Soil Tempearture (˚C)',
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
