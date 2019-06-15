import {
  Component, OnInit
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
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ngx-select-class';
  levelList = [];
  treeList = [];
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
    undefined, undefined, '河北城市车牌匹配', undefined, [],
    this.treeList,
    null, false, undefined, 'TreeMulti');
    hostUrl = 'https://easy-mock.com/mock/5ceb854a1851d623fe0bcb4d';
  /**
   * 在第一轮 ngOnChanges 完成之后调用。
   * ( 译注：也就是说当每个输入属性的值都被触发了一次 ngOnChanges 之后才会调用 ngOnInit ，
   * 此时所有输入属性都已经有了正确的初始绑定值 )
   */
  ngOnInit() {
    console.log('ngOnInit');
  }

  constructor(private httpClient: HttpClient) {
    this.initData();
  }

  /**
   * 请求返回异常处理
   */
  handleError(res) {
    console.log(res);
  }

  /**
   * 初始化数据
   */
  initData() {
    this.httpClient.get(`${this.hostUrl}/eikesi/levelList`)
    .toPromise()
    .then((res: any) => {
      console.log(res);
      this.levelList = res.data || [];
      this.levelRadio.treeDataList = res.data || [];
     })
    .catch(res => this.handleError(res));
    this.httpClient.get(`${this.hostUrl}/eikesi/treeList`)
    .toPromise()
    .then((res: any) => {
      console.log(res);
      debugger
      this.treeList = res.data || [];
      this.treeMulti.classList = [{
          name: '一级',
          dataList: null
        },
        {
          name: '二级',
          dataList: null
        },
        {
          name: '三级',
          dataList: null
        }
      ];
      this.treeMulti.treeDataList = res.data || [];
    })
    .catch(res => this.handleError(res));
  }
}
