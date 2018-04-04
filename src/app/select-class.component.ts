import {FormGroup, NgModel, FormControl, AbstractControl} from '@angular/forms';
import { Component, OnInit, OnChanges, SimpleChange, Renderer2, ViewContainerRef, OnDestroy, TemplateRef,
  DoCheck, ViewChild, SimpleChanges, Input, EventEmitter, Output, forwardRef, ElementRef, Inject,
  ViewEncapsulation, HostListener } from '@angular/core';
import {ActivatedRoute, Router, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot, NavigationStart} from '@angular/router';
import {Observable} from '../../node_modules/rxjs';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {filter} from 'rxjs/operators/filter';
export enum SelectClassMode {
  TreeRadio = 'TreeRadio',
  TreeMulti = 'TreeMulti',
  LevelRadio = 'LevelRadio',
  LevelMulti = 'LevelMulti'
}
@Component({
  selector: 'ngx-select-class',
  templateUrl: './select-class.component.html',
  providers: [],
  styleUrls: ['./select-class.component.scss']
})
export class SelectClassComponent implements OnInit, OnChanges, OnDestroy  {
  get asyncGrade(): boolean {
    return this._asyncGrade;
  }

  @Input()
  set asyncGrade(value: boolean) {
    this._asyncGrade = value;
  }

  get selectName(): string {
    return this._selectName;
  }

  @Input()
  set selectName(value: string) {
    this._selectName = value;
  }

  get showClassIndex(): number {
    return this._showClassIndex;
  }

  @Input()
  set showClassIndex(value: number) {
    this._showClassIndex = value;
  }
  get readonly(): boolean {
    return this._readonly;
  }

  @Input()
  set readonly(value: boolean) {
    this._readonly = value;
  }

  get disabled(): boolean {
    return this._disabled;
  }

  @Input()
  set disabled(value: boolean) {
    this._disabled = value;
  }

  get class(): string {
    return this._class;
  }

  @Input()
  set class(value: string) {
    this._class = value;
  }

  get formControlKey(): string | Array<string | number> {
    return this._formControlKey;
  }

  @Input()
  set formControlKey(value: string | Array<string | number>) {
    this._formControlKey = value;
  }

  get nowSelect(): any {
    return this._nowSelect;
  }

  @Input()
  set nowSelect(value: any) {
    this._nowSelect = value;
  }

  get idKey(): string {
    return this._idKey;
  }

  @Input()
  set idKey(value: string) {
    this._idKey = value;
  }

  get nameKey(): string {
    return this._nameKey;
  }

  @Input()
  set nameKey(value: string) {
    this._nameKey = value;
  }

  get mode(): string {
    return this._mode;
  }

  @Input()
  set mode(value: string) {
    this._mode = value;
  }

  /**
   * 根据id获取指定层级对应id的元素
   * @param {string} treeDataId
   * @param {Array<any>} treeDataList
   * @returns {any}
   */
  getTreeClassData (treeDataId: string, treeDataList: Array<any> = []): any {
    for (let treeData of treeDataList) {
      if (treeDataId == treeData[this.idKey]) {
        return treeData;
      }
    }
    return {};
  };
  /**
   *   为没有名称的选择数据设置名称
   * @param {string} id
   * @param {Array<any>} treeDataList
   * @returns {string}
   */
  idToName(idList: Array<string>): string {
    let targetTreeData: any = null;
    for (const treeDataId of idList) {
      // const treeDataId = idList.shift();
      if (targetTreeData) {
        targetTreeData = Object.assign({}, this.getTreeClassData(treeDataId, targetTreeData.children));
      } else {
        targetTreeData = Object.assign({}, this.getTreeClassData(treeDataId, this.treeDataList));
      }
    }
    return targetTreeData[this.nameKey] || '  ——  ';
  }
  @Input()
  set treeDataList(treeDataList: Array<any>){
    this._treeDataList = treeDataList;
    //  如果nameKey没值则自动赋值
    for (let treeData of this._selectList || []) {
      let idList: Array<string> = [];
      for (let data of treeData.path) {
        idList.push(data[this.idKey]);
        data[this.nameKey] = this.idToName(idList);
      }
      if (!treeData[this.nameKey]) {
        treeData[this.nameKey] = treeData.path[treeData.path.length - 1][this.nameKey];
      }
    }
    this.synchroSelectList (this.selectList);
  }
  get treeDataList(): Array<any> {
    return this._treeDataList;
  }
  @Input()
  set classList(classList: Array<any>){
    let self = this;
    self._classList = self.isEmptyProperty(classList)
      ? [
        {
          name: '省份',
          dataList: null
        },
        {
          name: '城市',
          dataList: null
        },
        {
          name: '区县',
          dataList: null
        },
      ] : classList;
  }
  get classList(): Array<any> {
    return this._classList;
  }

  @Input()
  set formGroup(formGroup: FormGroup){
    let self = this;
    self._formGroup = formGroup;
  }
  get formGroup(): FormGroup {
    return this._formGroup;
  }

  @Input() @Output()
  set selectList(value: Array<any>) {
    this._selectList = value;
    console.log('_selectList:', this._selectList);
    // this.synchroSelectList (this._selectList);
  }
  get selectList(): Array<any> {
    return this._selectList;
  }
  //  弹窗选择模版内容
  @ViewChild('selectClassModalTemplate') selectClassModalTemplate: TemplateRef<any>;
  @Output()
  onValueChange: EventEmitter<any>  = new EventEmitter();


/**: Observable<{ index: number, value: any }>
   * 关闭回调
   * @type {EventEmitter<any>}
   */
  @Output()
  onClosed: EventEmitter<any>  = new EventEmitter<any>();
  /**
   * 打开回调
   * @type {EventEmitter<any>}
   */
  @Output()
  onOpen: EventEmitter<any>  = new EventEmitter<any>();
  /**
   * 已选列表
   * _selectList的取值优先级大于formGropu的值
   */
  private _selectList: Array<any> = [];
  /**
   * 当前选择的数据，选择完后放入selectList
   */
  private _nowSelect: any = {path: []};

  /**
   * 模版表单
   * 在set函数里@Input
   */
  private _formGroup: FormGroup;
  /**
   * 选择模式
   * 在set函数里@Input
   */
  private _mode: string = SelectClassMode.TreeRadio;
  /**
   * 表单是否只读
   * 在set函数里@Input
   */
  private _readonly: boolean = false;
  /**
   * 表单是否禁用
   * 在set函数里@Input
   */
  private _disabled: boolean = false;
  /**
   * 样式类字符串
   * 在set函数里@Input
   */
  private _class: string = '';
  /**
   * 主键变量名
   * 在set函数里@Input
   */
  private _idKey: string = 'id';
  /**
   * 名称变量名
   * 在set函数里@Input
   */
  private _nameKey: string = 'name';
  /**
   * 层级列表
   */
  private _classList: Array<Class> = [];
  /**
   * 待选数据列表，requestOption和treeDataList必须配置其中一个，treeDataList优先级最高
   */
  private _treeDataList?: Array<any> = [];

  private globalClickCallbackFn: Function;
  /**
   * 模版表单的key
   */
  private _formControlKey: string | Array<string | number>;
  /**
   * 已选列表的语义化显示
   */
  private _selectName: string = '';
  private _showClassIndex: number = 0;

  /**
   * 是否是异步分层获取数据(大数据量时使用，已查询数据会缓存)
   * 在set函数里@Input
   */
  private _asyncGrade: boolean = false;
  /**
   * 异步获取待选数据列表，requestOption和treeDataList必须配置其中一个，treeDataList优先级最高
   * @type {{url: string; method: string; requestDataList: (url: string, method: string, mode: string, data: any, index: number) => Observable<{index: number; dataList: any}>}}
   */

  @Input()
  private requestDataList: (data: any, index: number) => Observable<any>;

  constructor(
              private httpClient: HttpClient,
              private _viewContainerRef: ViewContainerRef,
              private elementRef: ElementRef,
              private renderer2: Renderer2,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
    // let self = this;
  }
  /**
   * 当被绑定的输入属性的值发生变化时调用，首次调用一定会发生在 ngOnInit之前。
   * 1.用treeDataList为第一层数据赋值
   */
   ngOnChanges (changes: {[propKey: string]: SimpleChange}) {
     let self = this;
    window.console.info('SelectClassComponent ngOnChanges：', changes);
    for (let propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        let changedProp = changes[propName];
        switch (propName) {
          case 'treeDataList':
            //  如果没有requestDataList则代表是外部传入待选数据
            if (!self.requestDataList) {
              self.classList[0].dataList = self.treeDataList;
            }
            break;
          case 'selectList':
            this.synchroSelectList (changedProp.currentValue);
            break;
          case 'formGroup':
            if (this.formGroup) {
              let formControl: FormControl = this.formGroup.get(this.formControlKey) as FormControl;
              this.synchroSelectList (formControl.value, true);
              formControl.valueChanges.subscribe(value => {
                console.log(this.formControlKey + ' valueChanges:', value);
                this.synchroSelectList (value, true);
              });
            }
            break;
          case 'requestDataList':
            if (!self.requestDataList) {
              return;
            }
              //  如果是分级加载需传层级
               if (this.asyncGrade) {
                let treeDataList = [];
                let index = 0;
                //  查询第一级待选数据
                 self.requestDataList({}, index).subscribe(option => {
                   treeDataList = option;
                   // 如果有已选数据则把已选数据所对应层级都异步查询出来
                   if (!self.isEmptyProperty(self.selectList)) {
                     for (let selectListKey = 0; selectListKey < self.selectList.length; selectListKey++) {
                       //  给显示在input上的selectName赋值
                       switch (self.mode) {
                         case SelectClassMode.TreeRadio: case  SelectClassMode.TreeMulti:
                           let eachTreeData: any = treeDataList[index];  //  当前遍历到的层级
                           let eachIdList = [];
                           for (let key = 0; key < self.selectList[selectListKey].path.length; key++) {
                             if (self.isEmptyProperty(self.selectList[selectListKey].path)
                                  && self.isEmptyProperty(self.selectList[selectListKey].path[key])) {
                               break;
                             }
                             eachIdList.push(self.selectList[selectListKey].path[key][self.idKey]);
                             // 获取对应的层级
                             for (const treeDataId of eachIdList) {
                               if (eachTreeData) {
                                 eachTreeData = Object.assign({}, self.getTreeClassData(treeDataId, eachTreeData.children));
                               } else {
                                 eachTreeData = Object.assign({}, self.getTreeClassData(treeDataId, treeDataList));
                               }
                             }
                             self.requestDataList(eachTreeData, key + 1).subscribe(childOption => {
                               eachTreeData.children = childOption;
                               if (self.selectList[selectListKey].path.length - 1 == key) {
                                 self.treeDataList = treeDataList;
                                 self.classList[0].dataList = self.treeDataList;
                               }
                             });
                           }
                           break;
                         case SelectClassMode.LevelRadio: case  SelectClassMode.LevelMulti:

                           break;
                       }
                     }
                   } else {
                     self.treeDataList = treeDataList;
                     self.classList[0].dataList = self.treeDataList;
                   }
                 });
               } else {
                 this.requestDataList({}, 1).subscribe(option => {
                   self.treeDataList = option;
                   self.classList[0].dataList = self.treeDataList;
                 });
               }
            break;
        }
      }
    }
  }

  /**
   * 在第一轮 ngOnChanges 完成之后调用。
   * 1.当_selectList有值时优先取_selectList
   * 2.请求待选数据
   * 3.监听单击事件以打开弹窗
   * 4.设置默认请求函数
   * ( 译注：也就是说当每个输入属性的值都被触发了一次 ngOnChanges 之后才会调用 ngOnInit ，
   * 此时所有输入属性都已经有了正确的初始绑定值 )
   */
   ngOnInit () {
     let self = this;
    // if (!this.treeDataList && !this.requestDataList) throw new Error('数据源 `treeDataList` 或 `requestDataList` 至少必须有一个');
    try {
      // if (self.formGroup) {
      //   let formControl: FormControl = this.formGroup.get(this.formControlKey) as FormControl;
      //   如果formControl有值则优先使用它的值并同步到_selectList
      //   if (formControl.value && formControl.value.length) {
      //     self.synchroSelectList (formControl.value, true);
      //   } else {
      //     this.synchroSelectList (self.selectList);
      //   }
      // }
      if (self._selectList && self._selectList.length) {
        this.synchroSelectList (self.selectList);
      } else {
        if (self.formGroup) {
          let formControl: FormControl = this.formGroup.get(this.formControlKey) as FormControl;
          if (formControl.value && formControl.value.length) {
            self.synchroSelectList(formControl.value, true);
          }
        }
      }
    }catch (e) {
      console.error(e);
    }
    this.globalClickCallbackFn = this.renderer2.listen(this.elementRef.nativeElement, 'click', (event: any) => {
      if (self.readonly || self.disabled) {
      return;
    }
      window.console.log('SelectClassComponent：' + event);
      self._viewContainerRef.createEmbeddedView(self.selectClassModalTemplate);
      let nativeElement = self.selectClassModalTemplate.elementRef.nativeElement;
      self.open();
    });
  }

  /**
   * 每次销毁指令 / 组件之前调用
   * 1.关闭单击事件监听
   */
   ngOnDestroy () {
     this.closed('onChance', null);
    if (this.globalClickCallbackFn) {
      this.globalClickCallbackFn();
    }
  }

  private dataListTrackByFn(index: number, data: any): number {
     return data ? null : data[this.idKey];
   }
  /**
   * formGroup或selectList值改变调用
   * 1.将selectList最后修改出的值同步数据到formGroup和_selectList,并用SelectName来显示
   */
  private synchroSelectList (value: Array<any>, isFormGroup: boolean = false) {
    let self = this;
    self._selectList = value || [];
    if (!isFormGroup && this.formGroup) {
      // window.console.trace();
      let formControl: FormControl = this.formGroup.get(this.formControlKey) as FormControl;
      formControl.setValue(value);
    }
    //  给显示在input上的selectName赋值
    switch (self.mode) {
      case SelectClassMode.TreeRadio: case SelectClassMode.TreeMulti:
        self._selectName = '';
        if (self.selectList.length == 1) {
          for (const selectData of self.selectList || []) {
            for (const pathData of selectData.path) {
              self._selectName += (pathData[self.nameKey] + '  ' ||  '——  ');
            }
          }
        } else {
          for (let key in self.selectList || []) {
            if (self.selectList.hasOwnProperty(key)) {
              if (key != '0') {
                self._selectName += '，';
              }
              self._selectName += self.selectList[key][self.nameKey] ||  '——';
            }
          }
        }
        break;
      case SelectClassMode.LevelRadio:

        break;
      case SelectClassMode.LevelMulti:

        break;
      default:
        console.error('选择类型参数mode不存在。');
    }
    this.onValueChange.emit(this.selectList);
  }
  /**
   * 是否是当前正在选中的选项
   */
  private isNowSelect (data: any, classIndex: number): boolean {
    let self = this;
    if (!self.nowSelect.path[classIndex]) {
      return false;
    }
    const nowSelectId = self.nowSelect.path[classIndex][self.idKey];
    if (!nowSelectId) {
      return false;
    }
    return nowSelectId == data[self.idKey];
  }
  /**
   * 是否是已选列表里面的选项
   */
  private isSelect (data: any, classIndex: number): boolean {
    let self = this;
    for (const selectData of self.selectList || []) {
      if (selectData.path[classIndex]
        && !self.isEmpty(selectData.path[classIndex][self.idKey])
        && selectData.path[classIndex][self.idKey] == data[self.idKey]) {
        return true;
      }
    }
    return false;
  }
  /**
   *  单击待选元素后触发
   *  给nowSelect赋值并最终放入selectList
   */
  private onSelectClass (data: any, classIndex: number) {
    let self = this;
    //  如果有下一级则显示下一级
    if (self.classList[classIndex + 1]) {
      self.showClassIndex = classIndex + 1;
    }
    //  是当前已选中的则不再处理
    if (self.isNowSelect(data, classIndex)) {
      return;
    }
    switch (self.mode) {
      case SelectClassMode.TreeRadio: case SelectClassMode.TreeMulti:
        let checkTreeData = ()  => {
          //  如果有下一级则获取下一级选择列表
          if (self.classList[classIndex + 1]) {
            self.classList[classIndex + 1].dataList = data.children;
            //  滞空之后层级的待选数据
            for (let index = classIndex + 2; index < self.classList.length; index++) {
              self.classList[index].dataList = [];
            }
            //  删除当前选中之后的已选数据
            self.nowSelect.path.splice(classIndex, (self.nowSelect.path.length - 1 - classIndex));
          }

            if (self.isEmptyProperty(self.nowSelect)) {
            self.nowSelect = {path: []};
          }
          //  设置树形结构路径
          self.nowSelect.path[classIndex] = Object.assign({}, data);
          delete self.nowSelect.path[classIndex].children;
          //  如果是最后一层且不是当前选择过则放入selectList
          //  (classIndex == (self.classList.length - 1) || !self.classList[classIndex + 1].dataList || self.classList[classIndex + 1].dataList.length == 0)
          //  && !self.isSelect(data, classIndex))
          //  如果不是已选择列表selectList内的数据则放入selectList
          if (!self.isSelect(data, classIndex)) {
            //  设置最后一级为选中数据
            Object.assign(self.nowSelect, data);
            delete self.nowSelect.children;
            // self.selectList.push(JSON.parse(JSON.stringify(self.nowSelect)));
            if (self.isEmptyProperty(self.selectList) || self.mode == SelectClassMode.TreeRadio) {
              self.selectList = [JSON.parse(JSON.stringify(self.nowSelect))];
            } else {
              if (classIndex == 0) {
                self.selectList.push(JSON.parse(JSON.stringify(self.nowSelect)));
              } else {
                //  判断本次选中nowSelect是否是已选列表selectList某一元素的子集
                let isSelectIng = false;
                for (let i = self.selectList.length - 1; i >= 0; i--) {
                  if (self.selectList[i][self.idKey] == self.nowSelect.path[classIndex - 1][self.idKey]) {
                    self.selectList[i] = JSON.parse(JSON.stringify(self.nowSelect));
                    isSelectIng = true;
                    break;
                  }
                }
                if (!isSelectIng) {
                  self.selectList.push(JSON.parse(JSON.stringify(self.nowSelect)));
                }
              }
            }
            self.synchroSelectList (self.selectList);
          }
        }
        if (self.asyncGrade && self.classList[classIndex + 1]) {
          this.requestDataList(data, classIndex + 1).subscribe(option => {
            data.children = option;
            checkTreeData();
          });
        } else { //  没有子集且为异步获取层级数据的
          checkTreeData();
        }
        break;
      case SelectClassMode.LevelRadio:

        break;
      case SelectClassMode.LevelMulti:

        break;
      default:
        console.error('选择类型参数mode不存在。');
    }
  }
  /**
   * 每次销毁组件触发
   * 1.返回关闭类型和选择数据
   * type：onCancel（取消并不传数据）、onOk（确认并传回数据）
   */
  private closed (type: string = 'onCancel', $event ) {
    let self = this;
    self._viewContainerRef.clear();
    // if (self.formGroup) {
    //   let formControl: FormControl = this.formGroup.get(this.formControlKey) as FormControl;
    //   if (formControl.value && formControl.value.length) {
    //     self.synchroSelectList(formControl.value, true);
    //   }
    // }
    //  空数组就是没有选择值
    if (self.selectList && !self.selectList.length) {
      self.synchroSelectList([]);
    }
    self.onClosed.emit({
      type: type,
      selectList: self.selectList
    });
  }
  /**
   * 单击清空按钮触发
   * 清空选中的数据
   */
  private clear (index?: number) {
    let self = this;
    if (self.isEmpty(index)) {
      this.synchroSelectList ([]);
    } else {
      self.selectList.splice(index, 1);
      this.synchroSelectList (self.selectList);
    }
  }
  /**
   * 每次打开组件触发并回调onOpen函数
   */
  private open () {
    let self = this;
    self.onOpen.emit({});
  }
  /**
   * @Title 判断空
   * @Description 判断空
   * @author hedongyang
   * @param val
   * @returns {Boolean} 空返回true
   */
  private isEmpty(val) {
    if (typeof val === 'string' || val instanceof String) {
      val = val.replace(/\s/g, '');
    }
    if (val === null) {
      return 1;
    }
    if (val === undefined || val === 'undefined') {
      return 1;
    }
    if (val === '') {
      return 1;
    }
    if (val.length === 0) {
      return 1;
    }
    if (!/[^(^\s*)|(\s*$)]/.test(val)) {
      return 1;
    }
    return 0;
  };

  /**
   * 判断obj对象是否没有属性
   * 空返回true
   * @param obj 只接收obj
   * @returns {boolean}
   */
  private isEmptyProperty(obj) {
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        return 0;  //  不为空返回false
      }
    }
    return 1;  //  空返回true
  }
}
export class Class {
  name: string;
  dataList: Array<any>;
}

