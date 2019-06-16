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
  levelRadio: SelectClass = new SelectClass('同级单选', 'levelSelectList');
  treeMulti: SelectClass = new SelectClass('树形多选', 'treeSelectList');
    hostUrl = 'https://easy-mock.com/mock/5ceb854a1851d623fe0bcb4d';

  constructor(private httpClient: HttpClient) {
    this.initData();
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
    this.treeMulti.required = true;
    this.treeMulti.title = '树形多选';
    this.treeMulti.mode = 'TreeMulti';
  }

  /**
   * 在第一轮 ngOnChanges 完成之后调用。
   * ( 译注：也就是说当每个输入属性的值都被触发了一次 ngOnChanges 之后才会调用 ngOnInit ，
   * 此时所有输入属性都已经有了正确的初始绑定值 )
   */
  ngOnInit() {
    console.log('ngOnInit');
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
      this.treeList = res.data || [];
      this.treeMulti.treeDataList = res.data || [];
    })
    .catch(res => this.handleError(res));
  }
}
