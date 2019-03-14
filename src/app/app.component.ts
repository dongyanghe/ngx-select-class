import { Component } from '@angular/core';
import {
  SelectClass, SelectClassMode, Class
} from './ngx-select-class/entity';

import {
  Observable, Observer
} from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ngx-select-class';
  selectAddressList: [];
  cityData: [];
  selectClass: SelectClass = new SelectClass('地区', undefined, 'cityList', null, true, false,
          undefined, undefined, 'TreeRadio', undefined, [
            {
              name: '省份',
              nameKey: 'name',
              dataList: null
            },
            {
              name: '城市',
              nameKey: 'name',
              dataList: null
            },
            {
              name: '区县',
              nameKey: 'name',
              dataList: null
            },
            {
              name: '街道',
              nameKey: 'name',
              dataList: null
            }
          ], [], (data: any, index: number): Observable<any> => {
            if (!data || !data.id) {
              data = { id: 0 };
            }
            const observable: Observable<any> = Observable.create(observer => {
              const returnObservable = () => {
                observer.next(
                  []
                );
              };
              if (!this.cityData || !this.cityData.length) {
                returnObservable();
              } else {
                returnObservable();
              }
            });
            return observable;
          }, undefined, undefined, 'TreeRadio', 'code');
}
