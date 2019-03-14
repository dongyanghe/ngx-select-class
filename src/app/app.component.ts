import { Component } from '@angular/core';
import {
  SelectClass, SelectClassMode, Class
} from './ngx-select-class/entity';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ngx-select-class';
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
          ], [], undefined, undefined, 'TreeRadio', 'code');
}
