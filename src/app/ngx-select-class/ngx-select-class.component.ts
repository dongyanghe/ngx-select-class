import {
  FormGroup,
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import {
  Component,
  OnInit,
  OnChanges,
  SimpleChange,
  Renderer2,
  ViewContainerRef,
  OnDestroy,
  TemplateRef,
  DoCheck,
  ViewChild,
  SimpleChanges,
  Input,
  EventEmitter,
  Output,
  forwardRef,
  ElementRef,
  Inject,
  ViewEncapsulation,
  HostListener
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  ActivatedRouteSnapshot,
  RouterState,
  RouterStateSnapshot,
  NavigationStart
} from '@angular/router';
import {
  Observable
} from 'rxjs';
import {
  HttpClient
} from '@angular/common/http';

import {
  SelectClass, SelectClassMode, Class
} from './entity';
@Component({
  selector: 'app-ngx-select-class',
  templateUrl: './ngx-select-class.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NgxSelectClassComponent),
    multi: true
  }],
  styleUrls: ['./ngx-select-class.component.scss']
})
/**
 * 层级选择器
 * 单选可不选择到最后一级
 * 多选必须选择到最后一级
 */
export class NgxSelectClassComponent
implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
  private SelectClassMode = SelectClassMode;
  private onTouchedCallback: (value) => void = () => {};
  private onChangeCallback: (value) => void = () => {};
  /**
   * 已选列表展示样式
   * true为展示详情
   */
  private selectMsgType = true;
  //  弹窗选择模版内容
  @ViewChild('selectClassModalTemplate') selectClassModalTemplate: TemplateRef < any > ;

  @Output()
  valueOnChange: EventEmitter < any > = new EventEmitter();

  /**: Observable<{ index: number, value: any }>
   * 关闭回调
   * @type {EventEmitter<any>}
   */
  @Output()
  modalOnClosed: EventEmitter < any > = new EventEmitter < any > ();
  /**
   * 打开回调
   * @type {EventEmitter<any>}
   */
  @Output()
  modalOnOpen: EventEmitter < any > = new EventEmitter < any > ();
  /**
   * 已选列表
   * _selectList的取值优先级大于formGropu的值
   */
  private _selectList: Array < any > = [];
  /**
   * 当前选择的数据，选择完后放入selectList
   */
  private _nowSelect: any = {
    path: []
  };

  private _selectClass: SelectClass = new SelectClass('树形多选', 'treeSelectList');
  /**
   * 模版表单
   * 在set函数里@Input
   */
  private _formGroup: FormGroup;

  /**
   * 层级列表
   */
  private _classList: Array < Class > = [];
  /**
   * 待选数据列表，requestOption和treeDataList必须配置其中一个，treeDataList优先级最高
   */
  private _treeDataList ? : Array < any > = [];

  private globalClickCallbackFn: () => void;
  /**
   * 已选列表的语义化显示
   */
  private _selectName: string;
  /**
   * 当前展示层级
   */
  private _showClassIndex = 0;


  /**
   * 是否正在执行requestTreeDataListForSelectList
   */
  private isRequestTreeDataListForSelectList: boolean = false;

  /**
   * 异步获取数据
   * 当数据量过大，asyncGrade设为true让数据分层获取
   * Observable订阅调用者返回的对应index层待选数据
   * 异步获取待选数据列表，requestDataList和treeDataList必须配置其中一个，treeDataList优先级最高
   * 每次使用requestDataList之前都会先去treeDataList查询看有没有，requestDataList查询后会缓存在treeDataList里面
   * @memberof SelectClassComponent
   * @type {data: 父级数据, index: 第index层数据}
   */
  @Input()
  private requestDataList: (data: any, index: number) => Observable < any > ;

  constructor(private httpClient: HttpClient,
    private _viewContainerRef: ViewContainerRef,
    private elementRef: ElementRef,
    private renderer2: Renderer2,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    // let self = this;
  }


  public get selectClass(): SelectClass {
    return this._selectClass;
  }

  @Input()
  public set selectClass(value: SelectClass) {
    this._selectClass = value;
  }

  get showClassIndex(): number {
    return this._showClassIndex;
  }

  set showClassIndex(value: number) {
    this._showClassIndex = value;
  }

  get nowSelect(): any {
    return this._nowSelect;
  }

  set nowSelect(value: any) {
    this._nowSelect = value;
  }

  /**
   * 在指定层级中根据id获取的元素
   * @param {string} treeDataId
   * @param {Array<any>} treeDataList
   * @returns {any}
   */
  getTreeClassData(treeDataId: string, treeDataList: Array < any > = []): any {
    if (!treeDataList) {
      return null;
    }
    for (let i = treeDataList.length - 1; i >= 0; i--) {
      const treeData = treeDataList[i];
      if (treeDataId == treeData[this.selectClass.idKey]) {
        return treeData;
      }
    }
    return {};
  }

  /**
   *
   * 在整颗树中根据id获取的元素
   * @memberof NgxSelectClassComponent
   */
  getTreeClassDataForAll(id: string | number, treeDataList: Array < any > ): any {
    if (!treeDataList) {
      return null;
    }
    for (let i = treeDataList.length - 1; i >= 0; i--) {
      if (id == treeDataList[i][this.selectClass.idKey]) {
        return treeDataList[i];
        // newSelectData.path.push(treeDataList[i]);
        // newSelectData = Object.assign(newSelectData, treeDataList[i]);
        // return newSelectData;
      }
    }
    for (let i = treeDataList.length - 1; i >= 0; i--) {
      const treeData = this.getTreeClassDataForAll(
        id,
        treeDataList[i].children
      );
      if (treeData && id == treeData[this.selectClass.idKey]) {
        return treeData;
      }
    }
    return null;
  }

  /**
   * 为没有名称的已选数据设置名称——作废
   * @param {string} id
   * @param {Array<any>} treeDataList
   * @returns {string}
   */
  idToName(idList: Array < string > ): string {
    let targetTreeData: any = null;
    for (const treeDataId of idList) {
      // const treeDataId = idList.shift();
      if (targetTreeData) {
        targetTreeData = Object.assign({},
          this.getTreeClassData(treeDataId, targetTreeData.children)
        );
      } else {
        targetTreeData = Object.assign({},
          this.getTreeClassData(treeDataId, this.selectClass.treeDataList)
        );
      }
    }
    return targetTreeData[this.selectClass.nameKey] || '  ——  ';
  }

  /**
   *
   * 设置，并初始化selectList的数据
   * @memberof NgxSelectClassComponent
   */
  @Input()
  set treeDataList(treeDataList: Array < any > ) {
    this._treeDataList = treeDataList;
    //  如果nameKey没值则自动赋值
    for (const selectData of this._selectList || []) {
      const idList: Array < string > = [];
      let id: any = null;
      //  当前treeDataList遍历的层级数据
      let targetTreeData: any = null;
      //  path存储了父级信息
      if (selectData.path && selectData.path.length) {
        for (const data of selectData.path) {
          // idList.push(data[this.selectClass.idKey]);
          id = data[this.selectClass.idKey];
          //  空为第一级
          if (targetTreeData && targetTreeData.children) {
            targetTreeData = Object.assign({},
              this.getTreeClassData(id, targetTreeData.children)
            );
          } else {
            targetTreeData = Object.assign({},
              this.getTreeClassData(id, this.selectClass.treeDataList)
            );
          }
          //  @bug:这里不当为空
          if (targetTreeData) {
            // if (!targetTreeData[this.selectClass.nameKey]){
            //   debugger;
            // }
            data[this.selectClass.nameKey] = targetTreeData[this.selectClass.nameKey] || data[this.selectClass.nameKey] || '  ——  ';
          } else {
            data[this.selectClass.nameKey] = data[this.selectClass.nameKey] || '  ——  ';
          }
        }
        if (!selectData[this.selectClass.nameKey]) {
          selectData[this.selectClass.nameKey] =
            selectData.path[selectData.path.length - 1][this.selectClass.nameKey];
        }
      } else {
        selectData.path = [];
        //  @todo:没有父级信息则逐级遍历把父级信息也取出
        // selectData = this.getTreeClassDataForAll(Object.assign({}, selectData), this.selectClass.treeDataList);
      }
    } //  -end for (let selectData of this._selectList || [])
    this.synchroSelectList(this.selectList);
  }

  get treeDataList(): Array < any > {
    return this._treeDataList;
  }

  @Input()
  set classList(classList: Array < any > ) {
    this._classList = this.isEmptyProperty(classList) ? [{
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
        }
      ] :
      classList;
  }

  /**
   * 如果是异步请求requestTreeDataList则调用：
   * 1.根据传入的已选数据selectList获取treeDataList
   * 2.设置全选状态
   *
   * @memberof NgxSelectClassComponent
   */
  requestTreeDataListForSelectList() {
    // window.console.trace();
    if (!this.selectClass.requestDataList) {
      return;
    }
    const self = this;
    //  如果是分级加载需传层级
    if (this.selectClass.asyncGrade) {
      this.isRequestTreeDataListForSelectList = true;
      let treeDataList = [];
      // const test = self.selectClass.requestDataList({}, index);
      //  查询第一级待选数据
      self.selectClass.requestDataList({}, 0).subscribe(option => {
        treeDataList = option;
        // 如果有已选数据则把已选数据所对应层级都异步查询出来
        if (!self.isEmptyProperty(self.selectList)) {
          for (
            let selectListKey = 0; selectListKey < self.selectList.length; selectListKey++
          ) {
            let index = 0;
            //  给显示在input上的selectName赋值
            switch (this.selectClass.mode) {
              case SelectClassMode.TreeRadio:
              case SelectClassMode.TreeMulti:
                if (
                  self.isEmptyProperty(self.selectList[selectListKey].path) ||
                  self.isEmptyProperty(self.selectList[selectListKey].path[index])
                ) {
                  break;
                }
                let eachId = null;
                //  当前遍历到的层级
                let eachTreeData = null;
                // 递归异步获取下级
                const requestPathDataList = () => {
                  eachId =
                    self.selectList[selectListKey].path[index][this.selectClass.idKey];
                  const selectStatus =
                    self.selectList[selectListKey].path[index].selectStatus;
                  // 获取对应的层级
                  let nowTreeData = null;
                  if (eachTreeData) {
                    nowTreeData = self.getTreeClassData(
                      eachId,
                      eachTreeData.children
                    );
                  } else {
                    nowTreeData = self.getTreeClassData(eachId, treeDataList);
                  }
                  //  获取传入进来的全选状态
                  nowTreeData.selectStatus = selectStatus;
                  eachTreeData = Object.assign({}, nowTreeData);
                  self
                    .selectClass.requestDataList(eachTreeData, ++index)
                    .subscribe(childOption => {
                      nowTreeData.children = Object.assign([], childOption);
                      eachTreeData.children = childOption;
                      if (self.selectList[selectListKey].path.length == index) {
                        this.selectClass.treeDataList = treeDataList;
                        self.classList[0].dataList = this.selectClass.treeDataList;
                        if (selectListKey == self.selectList.length - 1) {
                          this.isRequestTreeDataListForSelectList = false;
                        }
                      } else {
                        requestPathDataList();
                      }
                    });
                };
                requestPathDataList();
                break;
              case SelectClassMode.LevelRadio:
              case SelectClassMode.LevelMulti:
                break;
            }
          }
        } else {
          this.isRequestTreeDataListForSelectList = false;
        }
        this.selectClass.treeDataList = treeDataList;
        self.classList[0].dataList = this.selectClass.treeDataList;
      });
    } else {
      this.selectClass.requestDataList({}, 1).subscribe(option => {
        this.selectClass.treeDataList = option;
        self.classList[0].dataList = this.selectClass.treeDataList;
      });
    }
  }

  /**
   * 当被绑定的输入属性的值发生变化时调用，首次调用一定会发生在 ngOnInit之前。
   * 1.用treeDataList为第一层数据赋值
   */
  ngOnChanges(changes: {
    [propKey: string]: SimpleChange
  }) {
    const self = this;
    window.console.info('SelectClassComponent ngOnChanges：', changes);
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        const changedProp = changes[propName];
        switch (propName) {
          case 'treeDataList':
            //  如果没有requestDataList则代表是treeDataList传入待选数据
            if (!this.selectClass.requestDataList) {
              //  为第一层数据赋值
              self.classList[0].dataList = this.selectClass.treeDataList;
            }
            break;
          case 'selectList':
            if (changedProp.currentValue) {
              this.synchroSelectList(changedProp.currentValue);
            }
            break;
          case 'formGroup':
            if (this.formGroup) {
              const formControl: FormControl = this.formGroup.get(
                this.selectClass.key
              ) as FormControl;
              this.synchroSelectList(formControl.value, true);
              formControl.valueChanges.subscribe(value => {
                console.log(this.selectClass.key + ' valueChanges:', value);
                this.synchroSelectList(value, true);
              });
            }
            break;
          case 'requestDataList':
            if (!this.selectClass.requestDataList) {
              return;
            }
            this.requestTreeDataListForSelectList();
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
  ngOnInit() {
    const self = this;
    // if (!this.selectClass.treeDataList && !this.selectClass.requestDataList) throw new Error('数据源 `treeDataList` 或 `requestDataList` 至少必须有一个');
    try {
      // if (self.formGroup) {
      //   let formControl: FormControl = this.formGroup.get(this.selectClass.key) as FormControl;
      //   如果formControl有值则优先使用它的值并同步到_selectList
      //   if (formControl.value && formControl.value.length) {
      //     self.synchroSelectList (formControl.value, true);
      //   } else {
      //     this.synchroSelectList (self.selectList);
      //   }
      // }
      if (self._selectList && self._selectList.length) {
        this.synchroSelectList(self.selectList);
      } else {
        if (self.formGroup) {
          const formControl: FormControl = this.formGroup.get(
            this.selectClass.key
          ) as FormControl;
          if (formControl.value && formControl.value.length) {
            self.synchroSelectList(formControl.value, true);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    this.globalClickCallbackFn = this.renderer2.listen(
      this.elementRef.nativeElement,
      'click',
      (event: any) => {
        if (this.selectClass.idKey || this.selectClass.disabled) {
          return;
        }
        window.console.log('SelectClassComponent：' + event);
        self._viewContainerRef.createEmbeddedView(
          self.selectClassModalTemplate
        );
        const nativeElement =
          self.selectClassModalTemplate.elementRef.nativeElement;
        self.open();
      }
    );
  }

  /**
   * 每次销毁指令 / 组件之前调用
   * 1.关闭单击事件监听
   */
  ngOnDestroy() {
    this.closed('onChance', null);
    if (this.globalClickCallbackFn) {
      this.globalClickCallbackFn();
    }
  }

  private dataListTrackByFn(index: number, data: any): number {
    return data ? null : data[this.selectClass.idKey];
  }

  /**getTreeClassDataForAll
   * formGroup或selectList值改变调用
   * 1.将selectList最后修改出的值同步数据到formGroup和_selectList,并用SelectName来显示
   * 2.将treeDataList的选中状态更新到_selectList
   *    SelectName只依据selectStatus显示全选，具体看changeSelectStatus()
   */
  private synchroSelectList(value: Array < any > , isFormGroup: boolean = false) {
    if (this.isRequestTreeDataListForSelectList) {
      setTimeout(() => {
        this.synchroSelectList(value, isFormGroup);
      }, 500);
      return;
    }
    const self = this;
    self._selectList = value || [];
    if (!isFormGroup && this.formGroup) {
      // window.console.trace();
      const formControl: FormControl = this.formGroup.get(
        this.selectClass.key
      ) as FormControl;
      formControl.setValue(value);
    }
    //  给显示在input上的selectName赋值
    switch (this.selectClass.mode) {
      case SelectClassMode.TreeRadio:
      case SelectClassMode.TreeMulti:
      // debugger
        self._selectName = '';
        if (self.selectList.length === 1) {
          const selectData = self.selectList[0];
          //  从treeClassDataList向selectList同步全选状态
          const treeData = this.getTreeClassDataForAll(
            selectData[this.selectClass.idKey],
            this.selectClass.treeDataList
          );
          //  @wait: treeData为空表示没这数据，那selectData也应该不存在，说明外部数据有误，需处理
          selectData.selectStatus = treeData ?
            treeData.selectStatus :
            selectData.selectStatus;
          for (const pathData of selectData.path) {
            const pathTreeData = this.getTreeClassDataForAll(
              pathData[this.selectClass.idKey],
              this.selectClass.treeDataList
            );
            pathData.selectStatus = pathTreeData ?
              pathTreeData.selectStatus :
              pathData.selectStatus;
            if (pathData.selectStatus) {
              self._selectName += (pathData[this.selectClass.nameKey] || '——') + '全部  ';
              break;
            }
            self._selectName += (pathData[this.selectClass.nameKey] || '——') + '  ';
          }
        } else {
          const classIdList = [];
          for (let key = 0; key < self.selectList.length; key++) {
            if (self.selectList.hasOwnProperty(key)) {
              const selectData = self.selectList[key];
              const treeData = this.getTreeClassDataForAll(
                selectData[this.selectClass.idKey],
                this.selectClass.treeDataList
              );
              selectData.selectStatus = treeData ?
                treeData.selectStatus :
                selectData.selectStatus;
              for (
                let pathKey = 0; pathKey < selectData.path.length; pathKey++
              ) {
                if (selectData.path.hasOwnProperty(pathKey)) {
                  const pathData = selectData.path[pathKey];
                  const pathTreeData = this.getTreeClassDataForAll(
                    pathData[this.selectClass.idKey],
                    this.selectClass.treeDataList
                  );
                  pathData.selectStatus = pathTreeData ?
                    pathTreeData.selectStatus :
                    pathData.selectStatus;
                  //  显示为全选
                  if (
                    pathData.selectStatus &&
                    pathKey != selectData.path.length - 1
                  ) {
                    if (!classIdList[pathKey]) {
                      classIdList[pathKey] = [];
                    }
                    //  是否已包涵在_selectName里面显示过的全选
                    const isShow = classIdList[pathKey].find(id => {
                      return id == pathData.id;
                    });
                    if (!isShow) {
                      if (key != 0 && pathKey == 0) {
                        self._selectName += '，';
                      }
                      classIdList[pathKey].push(pathData.id);
                      self._selectName +=
                        (pathData[this.selectClass.nameKey] || '——') + '全部  ';
                    }
                    break;
                  } else {
                    if (key != 0 && pathKey == 0) {
                      self._selectName += '，';
                    }
                    //  如果到了最后一级，说明父级没有一个是全选的，那么只显示最后一级
                    if (pathKey == selectData.path.length - 1) {
                      let end = self._selectName.lastIndexOf('，');
                      if (end == -1) {
                        self._selectName = '';
                      } else {
                        end = end + 1;
                        self._selectName = self._selectName.slice(0, end);
                      }
                      self._selectName += pathData[this.selectClass.nameKey] || '——';
                    } else {
                      self._selectName += pathData[this.selectClass.nameKey] || '——';
                    }
                  }
                }
              } //  -end for (const pathKey in selectData.path)
              // self._selectName += selectData[this.selectClass.nameKey] || '——';
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
    //  @wait：改成分级触发，这样触发太浪费
    this.changeSelectStatus();
    this.valueOnChange.emit(this.selectList);
  }

  /**
   * 获取选中状态样式类
   * @param data
   * @param classIndex
   */
  private getChildenSelectStatusClass(data: any, classIndex: number): Object {
    const status = this.getChildenSelectStatus(data, classIndex);
    switch (status) {
      case 0:
        return {
          'select-empty': true
        };
      case 1:
        return {
          'select-all': true
        };
      case 2:
        return {
          'select-part': true
        };
      default:
        console.error('getChildenSelectStatusClass switch 匹配不到：', status);
    }
  }

  /**
   * 当前元素子孙级选择状态
   */
  private getChildenSelectStatus(data: any, classIndex: number): number {
    const self = this;
    for (const selectData of this.selectList || []) {
      if (
        selectData.path[classIndex] &&
        !this.isEmpty(selectData.path[classIndex][this.selectClass.idKey]) &&
        selectData.path[classIndex][this.selectClass.idKey] == data[this.selectClass.idKey]
      ) {
        return 1;
      }
    }
    return 0;
  }

  /**
   *  data元素的子孙级是否全选
   * 当数据是异步请求时，默认外部已设置好selectStatus，不在递归子孙级：
   *      如果是requestDataList异步获取数据，当selectStatus设为true时子孙级数据可能未缓存入treeDataList，
   *      因此无法通过判断子孙级是否都选中来确定selectStatus，selectStatus只能外部维护
   */
  private changeSelectStatus(data ? : any, classIndex ? : number): boolean {
    const change = (changeData: any, changeClassIndex: number): boolean => {
      if (
        changeData.selectStatus &&
        (
          !changeData.children ||
          !changeData.children.length
        )
      ) {
        return (changeData.selectStatus = true);
      }
      if (changeClassIndex === this.classList.length - 1) {
        return (changeData.selectStatus = false);
      }
      // 一般是根据子集selectStatus判断，但最后一级没selectStatus，则倒数第二级需逐个判断
      if (
        changeClassIndex === this.classList.length - 2 &&
        changeData.children &&
        changeData.children.length
      ) {
        let number = 0;
        for (let k = this.selectList.length - 1; k >= 0; k--) {
          const select = this.selectList[k];
          for (let i = changeData.children.length - 1; i >= 0; i--) {
            const value = changeData.children[i];
            if (value[this.selectClass.idKey] === select[this.selectClass.idKey]) {
              ++number;
              break;
            }
          }
          if (number === changeData.children.length) {
            return (changeData.selectStatus = true);
          }
        }
        if (number !== changeData.children.length) {
          return (changeData.selectStatus = false);
        }
      }

      // 根据子集selectStatus判断
      if (changeData.children && changeData.children.length) {
        for (let i = changeData.children.length - 1; i >= 0; i--) {
          const value = changeData.children[i];
          if (!value.selectStatus) {
            value.selectStatus = this.changeSelectStatus(
              value,
              changeClassIndex + 1
            );
            if (!value.selectStatus) {
              return (changeData.selectStatus = false);
            }
          }
        }
      }
      return (changeData.selectStatus = false);
    };
    if (data) {
      return change(data, classIndex);
    } else if (
      this.classList[0] &&
      this.classList[0].dataList &&
      this.classList[0].dataList.length
    ) {
      for (let i = this.classList[0].dataList.length - 1; i >= 0; i--) {
        const value = this.classList[0].dataList[i];
        change(value, 0);
      }
    }
  }

  /**
   * 是否是当前正在选中的选项
   */
  private isNowSelect(data: any, classIndex: number): boolean {
    const self = this;
    if (!self.nowSelect.path[classIndex]) {
      return false;
    }
    const nowSelectId = self.nowSelect.path[classIndex][this.selectClass.idKey];
    if (!nowSelectId) {
      return false;
    }
    return nowSelectId == data[this.selectClass.idKey];
  }

  /**
   * 是否是已选列表里面的选项
   */
  private isSelect(data: any, classIndex: number): boolean {
    const self = this;
    for (const selectData of self.selectList || []) {
      if (
        selectData.path[classIndex] &&
        !self.isEmpty(selectData.path[classIndex][this.selectClass.idKey]) &&
        selectData.path[classIndex][this.selectClass.idKey] == data[this.selectClass.idKey]
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   // @bug:selectList和classList没有同步
   * 单击清空或删除按钮触发
   * 清空选中的数据
   * @param index 为selectList的下标，传入为删除单个，不传为删除所有已选
   */
  private clear(index ? : number) {
    if (this.isEmpty(index)) {
      this.onParentSelectAll(0, true);
    } else {
      // if (this.selectList[index].selectStatus !== undefined) {
      //   this.selectList[index].selectStatus = false;
      // }
      // for (const selectData of this.selectList[index].path){
      //   selectData.selectStatus = false;
      // }
      let classIndex = -1;
      const deleteData = this.selectList[index];
      //  找出父级设为不全选
      while (++classIndex < this.classList.length) {
        const parentData = deleteData.path[classIndex];
        const treeClassData = this.getTreeClassDataForAll(
          parentData[this.selectClass.idKey],
          this.selectClass.treeDataList
        );
        if (treeClassData) {
          treeClassData.selectStatus = false;
        }
      }
      this.selectList.splice(index, 1);
      this.synchroSelectList(this.selectList);
    }
  }

  /**
   *
   * @param dataList
   * @param classIndex
   * @param selectStatus 全选为false,清空为true
   */
  private onParentSelectAll(classIndex: number, selectStatus: boolean) {
    if (classIndex == 0) {
      for (const classData of this.classList[classIndex].dataList) {
        classData.selectStatus = selectStatus;
        this.onChildenSelectAll(classData, classIndex);
      }
    } else {
      for (const classData of this.classList[classIndex - 1].dataList) {
        if (
          this.nowSelect.path[classIndex - 1][this.selectClass.idKey] ==
          classData[this.selectClass.idKey]
        ) {
          classData.selectStatus = selectStatus;
          this.onChildenSelectAll(classData, classIndex - 1);
          break;
        }
      }
    }
  }

  msg: string = '';

  /**
   *  单击待选元素全选框触发、onParentSelectAll清空/全选触发、自身递归触发
   *  给nowSelect参数赋值并最终放入selectList
   * @wait:改成值改变后触发会不会更合适?
   * @defect：selectStatus可以随意修改，当他为true时selectList未必就真全选了
   * @param data 点击全选的数据，递归时是当前需要设置子级全选的那个元素
   * @param classIndex 当前层级
   * @param nowSelect 选择的数据
   * @param protopyteData 触发全选/取消全选的那个元素禁用状态，当最后一个子孙也设设置完时设为false
   * @param isLockSelectAll 默认是根据data.selectStatus是已全选则去除所有选择，否则反之，
   *  lockSelectAll则是递归时锁定子集全选，防止子集有全选状态时被改为清除全选
   * @param isParentLast 是否是父级最后一个，当到达最后一个子孙级时恢复isChildenSelectAllIng
   */
  private onChildenSelectAll(data: any,
    classIndex: number,
    nowSelect = {
      selectStatus: true,
      children: [],
      path: []
    },
    protopyteData ? : any,
    isLockSelectAll: boolean = false,
    isParentLast: boolean = false) {
    //  禁用全选按钮,未传protopyteData代表不是递归进来的
    if (protopyteData == undefined) {
      data.isChildenSelectAllIng = true;
    }
    const self = this;
    //  当前是已全选则去除所有选择
    if (data.selectStatus && !isLockSelectAll) {
      for (let i = self.selectList.length - 1; i >= 0; i--) {
        //  path下标是按照classIndex的顺序父级——>子集排列的
        //  如果已选元素path对classIndex应层级id相等就删除
        const value = self.selectList[i];
        if (value.path[classIndex][this.selectClass.idKey] == data[this.selectClass.idKey]) {
          self.selectList.splice(i, 1);
        }
      }
      data.selectStatus = false;
      data.isChildenSelectAllIng = false;
      //  模型表单和响应式表单值同步
      self.synchroSelectList(self.selectList);
    } else {
      data.selectStatus = true;
      //  未全选则执行全选
      switch (this.selectClass.mode) {
        case SelectClassMode.TreeMulti:
          //  @wait：是否可以通过标记父级下标来减少循环？
          const checkTreeData = (treeData: any, treeDataClassIndex: number) => {
            //  最后一级没有全选按钮也不需要设置状态为全选
            if (treeDataClassIndex == self.classList.length - 1) {
              nowSelect.selectStatus = false;
            }
            //  设置树形结构路径
            nowSelect.path[treeDataClassIndex] = Object.assign({}, treeData);
            //  这里不需要保存子孙级数据
            delete nowSelect.path[treeDataClassIndex].children;
            Object.assign(nowSelect, treeData);
            delete nowSelect.children;
            //  如果当前点击全选的元素不是已选择列表selectList内的数据则放入selectList
            if (!self.isSelect(treeData, treeDataClassIndex)) {
              if (self.isEmptyProperty(self.selectList)) {
                self.selectList = [JSON.parse(JSON.stringify(nowSelect))];
              } else {
                //  如果是最顶级未被选则直接插入
                if (treeDataClassIndex === 0) {
                  self.selectList.push(JSON.parse(JSON.stringify(nowSelect)));
                } else {
                  //  如果这个元素是某个已选元素的子集得找到它
                  //  标记本次选中元素是否是已选列表selectList某一元素的子集
                  let isSelectIng = false;
                  for (let i = self.selectList.length - 1; i >= 0; i--) {
                    // if (!nowSelect.path[treeDataClassIndex - 1]) debugger;
                    if (
                      self.selectList[i][this.selectClass.idKey] ==
                      nowSelect.path[treeDataClassIndex - 1][this.selectClass.idKey]
                    ) {
                      self.selectList[i] = JSON.parse(
                        JSON.stringify(nowSelect)
                      );
                      isSelectIng = true;
                      break;
                    }
                  }
                  //  是某个父级新选择的子集元素
                  if (!isSelectIng) {
                    self.selectList.push(JSON.parse(JSON.stringify(nowSelect)));
                  }
                }
              }
            } else {
              //  已选择则更新数据——selectStatus
              for (const selectData of self.selectList || []) {
                if (
                  selectData.path[treeDataClassIndex][this.selectClass.idKey] ==
                  nowSelect[this.selectClass.idKey]
                ) {
                  selectData.path[treeDataClassIndex] = JSON.parse(
                    JSON.stringify(nowSelect)
                  );
                }
              }
            }
            //  如果有子集就递归选则
            if (treeData.children && treeData.children.length) {
              for (let k = treeData.children.length - 1; k >= 0; k--) {
                let value = treeData.children[k];
                this.onChildenSelectAll(
                  value,
                  treeDataClassIndex + 1,
                  nowSelect,
                  treeData,
                  true,
                  k == 0
                );
              }
            } else if (isParentLast) {
              protopyteData.isChildenSelectAllIng = false;
              //  模型表单和响应式表单值同步
              self.synchroSelectList(self.selectList);
            }
          };
          //  如果要返回所有子孙级数据则进入遍历查找赋值（@careful:数据量太大或者是异步请求的会导致性能问题）
          if (this.selectClass.isAllIn) {
            //  是异步获取且还有子级且未缓存
            if (
              this.selectClass.asyncGrade &&
              self.classList[classIndex + 1] &&
              !data.children
            ) {
              this.selectClass.requestDataList(data, classIndex + 1).subscribe(option => {
                data.children = option;
                checkTreeData(data, classIndex);
              });
            } else {
              //  没有子集且为异步获取层级数据或者是1已缓存的直接读取
              checkTreeData(data, classIndex);
            }
          }
          break;
        default:
          console.error('选择类型参数mode不存在。');
      }
    }
  }

  /**
   *  单击待选元素后触发
   *  给nowSelect赋值并最终放入selectList
   */
  private onSelectClass(data: any, classIndex: number) {
    if (data.isChildenSelectAllIng) {
      return;
    }
    const self = this;
    //  如果有下一级则显示下一级
    if (self.classList[classIndex + 1]) {
      self.showClassIndex = classIndex + 1;
    }
    //  是当前已选中的则不再处理
    if (self.isNowSelect(data, classIndex)) {
      return;
    }
    //  获取下一级待选数据列表
    switch (this.selectClass.mode) {
      case SelectClassMode.TreeRadio:
      case SelectClassMode.TreeMulti:
        const checkTreeData = () => {
          if (self.isEmptyProperty(self.nowSelect)) {
            self.nowSelect = {
              path: []
            };
          }
          //  如果有下一级则获取下一级选择列表
          if (self.classList[classIndex + 1]) {
            self.classList[classIndex + 1].dataList = data.children;
            //  滞空之后层级的待选数据
            for (
              let index = classIndex + 2; index < self.classList.length; index++
            ) {
              self.classList[index].dataList = [];
            }
            //  删除当前选中之后的已选数据
            self.nowSelect.path.splice(
              classIndex,
              self.nowSelect.path.length - 1 - classIndex
            );
          }

          //  设置树形结构路径
          self.nowSelect.path[classIndex] = Object.assign({}, data);
          //  这里不需要保存子孙级数据
          delete self.nowSelect.path[classIndex].children;
          //  如果是最后一层且不是当前选择过则放入selectList
          //  (classIndex == (self.classList.length - 1)
          // || !self.classList[classIndex + 1].dataList
          // || self.classList[classIndex + 1].dataList.length == 0)
          //  && !self.isSelect(data, classIndex))
          //  如果当前点击的元素不是已选择列表selectList内的数据则放入selectList
          if (!self.isSelect(data, classIndex)) {
            //  设置最后一级为选中数据
            Object.assign(self.nowSelect, data);
            delete self.nowSelect.children;
            // self.selectList.push(JSON.parse(JSON.stringify(self.nowSelect)));
            //  selectList是空或者单选模式下一次只能选择一个，可以直接赋值覆盖
            if (
              self.isEmptyProperty(self.selectList) ||
              this.selectClass.mode == SelectClassMode.TreeRadio
            ) {
              self.selectList = [JSON.parse(JSON.stringify(self.nowSelect))];
            } else {
              //  如果是最顶级未被选则直接插入
              if (classIndex == 0) {
                self.selectList.push(
                  JSON.parse(JSON.stringify(self.nowSelect))
                );
              } else {
                //  如果这个元素是某个已选元素的子集得找到它
                //  判断本次选中nowSelect是否是已选列表selectList某一元素的子集
                let isSelectIng = false;
                for (let i = self.selectList.length - 1; i >= 0; i--) {
                  if (
                    self.selectList[i][this.selectClass.idKey] ==
                    self.nowSelect.path[classIndex - 1][this.selectClass.idKey]
                  ) {
                    self.selectList[i] = JSON.parse(
                      JSON.stringify(self.nowSelect)
                    );
                    isSelectIng = true;
                    break;
                  }
                }
                if (!isSelectIng) {
                  self.selectList.push(
                    JSON.parse(JSON.stringify(self.nowSelect))
                  );
                }
              }
            }
            self.synchroSelectList(self.selectList);
          }
        };
        //  是异步获取且还有子级且未缓存
        if (
          this.selectClass.asyncGrade &&
          self.classList[classIndex + 1] &&
          !data.children
        ) {
          this.selectClass.requestDataList(data, classIndex + 1).subscribe(option => {
            data.children = option;
            checkTreeData();
          });
        } else {
          //  没有子集且为异步获取层级数据的
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
  private closed(type: string = 'onCancel', $event) {
    const self = this;
    self._viewContainerRef.clear();
    // if (self.formGroup) {
    //   let formControl: FormControl = this.formGroup.get(this.selectClass.key) as FormControl;
    //   if (formControl.value && formControl.value.length) {
    //     self.synchroSelectList(formControl.value, true);
    //   }
    // }
    //  空数组就是没有选择值
    if (self.selectList && !self.selectList.length) {
      self.synchroSelectList([]);
    }
    self.modalOnClosed.emit({
      type: type,
      selectList: self.selectList
    });
  }

  /**
   * 每次打开组件触发并回调onOpen函数
   */
  private open() {
    this.modalOnOpen.emit({});
  }

  /**
   * @Title 判断空
   * @Description 判断空
   * @author hedongyang
   * @param val
   * @returns {boolean} 空返回true
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
  }

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
        return 0; //  不为空返回false
      }
    }
    return 1; //  空返回true
  }

  get classList(): Array < any > {
    return this._classList;
  }

  @Input()
  set formGroup(formGroup: FormGroup) {
    this._formGroup = formGroup;
  }

  get formGroup(): FormGroup {
    return this._formGroup;
  }

  @Input()
  set selectList(value: Array < any > ) {
    if (value !== this._selectList) {
      this._selectList = value;
      this.onChangeCallback(value);
      console.log('_selectList:', this._selectList);
      // this.synchroSelectList (this._selectList);
    }
  }

  get selectList(): Array < any > {
    return this._selectList;
  }

  /**
   * 执行的顺序是 ngOnInit-> writeValue-> registerOnChange -> registerOnTouched -> ngAfterContentInit -> ngAfterViewInit
   * @param value
   */
  writeValue(value: any): void {
    if (value !== this._selectList) {
      this._selectList = value;
      this.requestTreeDataListForSelectList();
      this.synchroSelectList(this._selectList);
    }
  }

  /**
   * 当 inside value updated then need call it : fn(newValue)
   * 把这个 fn 注册到内部方法上, 当内部值更新时调用它 this.publishValue(newValue);
   * @param fn
   */
  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }
}