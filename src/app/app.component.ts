import {
  Component
} from '@angular/core';
import {
  SelectClass,
  SelectClassMode,
  Class
} from './ngx-select-class/entity';

import {
  Observable,
  Observer
} from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ngx-select-class';
  levelList = [{
    city: '石家庄',
    cityCode: '0311',
    code: '冀A',
    province: '河北'
  }, {
    city: '唐山',
    cityCode: '0315',
    code: '冀B',
    province: '河北'
  }, {
    city: '秦皇岛',
    cityCode: '0335',
    code: '冀C',
    province: '河北'
  }, {
    city: '邯郸',
    cityCode: '0310',
    code: '冀D',
    province: '河北'
  }, {
    city: '邢台',
    cityCode: '0319',
    code: '冀E',
    province: '河北'
  }, {
    city: '保定',
    cityCode: '0312',
    code: '冀F',
    province: '河北'
  }, {
    city: '张家口',
    cityCode: '0313',
    code: '冀G',
    province: '河北'
  }, {
    city: '承德',
    cityCode: '0314',
    code: '冀H',
    province: '河北'
  }, {
    city: '沧州',
    cityCode: '0317',
    code: '冀J',
    province: '河北'
  }, {
    city: '廊坊',
    cityCode: '0316',
    code: '冀R',
    province: '河北'
  }, {
    city: '沧州',
    cityCode: '0317',
    code: '冀S',
    province: '河北'
  }];
  treeList = [
    {
      id: 1,
      name: '11111111',
      children: [
        {
          id: 21,
          name: '211111111',
          children: [
            {
              id: 31,
              name: '31111111111',
            },
            {
              id: 32,
              name: '32222222222',
            }
          ]
        }
      ]
    },
    {
      id: 22,
      name: '222222222',
      children: [
        {
          id: 211111111,
          name: '2111111111',
          children: [
            {
              id: 3111111111,
              name: '311111111111111',
            },
            {
              id: 32,
              name: '32222222222222',
            }
          ]
        }
      ]
    }
  ];
  levelSelectList: [];
  treeSelectList: [];
  cityData: [];
  levelRadio: SelectClass = new SelectClass('同级单选', undefined, 'levelSelectList', null, true, false,
    undefined, undefined, '河北城市车牌匹配', undefined, [{
        name: '河北车牌',
        nameKey: 'code',
        dataList: this.levelList
      },
      {
        name: '河北城市',
        nameKey: 'city',
        dataList: this.levelList
      },
      {
        name: '河北编码',
        nameKey: 'cityCode',
        dataList: null
      }
    ],
    [],
    (data: any, index: number): Observable < any > => {
      if (!data || !data.id) {
        data = {
          id: 0
        };
      }
      const observable: Observable < any > = Observable.create(observer => {
        const returnObservable = () => {
          observer.next(
            this.levelList
          );
        };
        if (!this.cityData || !this.cityData.length) {
          returnObservable();
        } else {
          returnObservable();
        }
      });
      return observable;
    },
     undefined, undefined, 'LevelRadio', 'cityCode', 'city');
     treeMulti: SelectClass = new SelectClass('树形多选', undefined, 'treeSelectList', null, true, false,
    undefined, undefined, '河北城市车牌匹配', undefined, [{
        name: '一级',
        nameKey: 'id',
        dataList: this.levelList
      },
      {
        name: '二级',
        nameKey: 'id',
        dataList: this.levelList
      },
      {
        name: '三级',
        nameKey: 'id',
        dataList: null
      }
    ],
    this.treeList,
    (data: any, index: number): Observable < any > => {
      if (!data || !data.id) {
        data = {
          id: 0
        };
      }
      const observable: Observable < any > = Observable.create(observer => {
        const returnObservable = () => {
          observer.next(
            this.treeList
          );
        };
        if (!this.treeSelectList || !this.treeSelectList.length) {
          returnObservable();
        } else {
          returnObservable();
        }
      });
      return observable;
    }, false, undefined, 'TreeMulti');
}
