import {FormControlBase, FieldBaseOptions} from './FormControlBase';
import {
  Observable, Observer
} from 'rxjs';
/**
 * 选择模式
 */
export enum SelectClassMode {
  TreeRadio = 'TreeRadio',
    TreeMulti = 'TreeMulti',
    LevelRadio = 'LevelRadio',
    LevelMulti = 'LevelMulti'
}
/**
 * 层级
 */
export class Class {
  name: string;
  dataList: Array <any> ;
}
export class SelectClass extends FormControlBase<Array<any>> {
  observable: Observable<any>;
  private observer: Observer<any>;
  /**
   * 每一层级的信息
   */
  classList: Array<Class>;
  /**
   * 待选数据列表
   */
  treeDataList: Array<any>;
  /**
   * 总的选择数据
   */
  requestDataList: (data: any, index: number) => Observable<any>;
  idKey: string;
  nameKey: string;
  asyncGrade: boolean;
  isAllIn: boolean;
  /**
   * 选择模式
   * treeRadio:树形结构最后一级单选
   * treeMulti:树形结构最后一级多选
   * levelRadio:平级结构单选
   * levelMulti:平级结构多选
   */
  mode: string;
  constructor(label: string, placeholder: string = '--请选择--', key: string, value: Array<any>, required: boolean = false,
              readonly: boolean = false, disabled: boolean = false, validation: string = '', title?: string, order?: number,
              classList: Array<any> = [],
              treeDataList: Array<any> = null,
              requestDataList: (data: any, index: number) => Observable<any> = null,
              asyncGrade: boolean = false,
              isAllIn: boolean = false,
              mode: string = 'TreeRadio',
              idKey: string = 'id',
              nameKey: string = 'name') {
    super('select-class', label, placeholder, key, value,
          undefined, required, readonly, disabled, validation, undefined, undefined, title, order);
    const self = this;
    this.mode = mode;
    this.idKey = idKey;
    this.nameKey = nameKey;
    this.asyncGrade = asyncGrade;
    this.classList = classList;
    this.treeDataList = treeDataList;
    this.requestDataList = requestDataList;
   /* this.observable = Observable.create(observer => {
      this.observer = observer;
    });*/
  }
  modalOnOpen(result) {
    window.console.info('SelectClass onOpen', result);
    /*self.observer.next({
      type: 'onOpen',
      key: self.key,
      value: self.value
    });*/
  }
  modalOnClosed(result) {
    window.console.info('SelectClass onClosed', result);
    /*self.observer.next({
      type: 'onClosed',
      key: self.key,
      value: self.value
    });*/
  }
  valueOnChange(value) {
    window.console.info('SelectClass onValueChange', value);
  }

}
