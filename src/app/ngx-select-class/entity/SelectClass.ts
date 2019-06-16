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
  key: string;
  classList: Array<Class> = [];
  /**
   * 待选数据列表
   */
  treeDataList: Array<any> = [];
  /**
   * 总的选择数据
   */
  requestDataList: (data: any, index: number) => Observable<any>;
  
  /**
   * 模版表单的key
   */

  idKey = 'id';
  /**
   * 名称变量名
   * 在set函数里@Input
   */
  nameKey = 'name';
  /**
   * 是否是异步分层获取数据(大数据量时使用，已查询数据会缓存在treeDataList)
   * 在set函数里@Input
   */
  asyncGrade = false;
  /**
   * 全选时是否返回子孙级所有数据
   * 默认否，将不返回,只在对应层级添加变量allIn = true
   */
  isAllIn = false;
  placeholder = '--请选择--';
  /**
   * 选择模式
   * treeRadio:树形结构最后一级单选
   * treeMulti:树形结构最后一级多选
   * levelRadio:平级结构单选
   * levelMulti:平级结构多选
   */
  mode = 'TreeMulti';
  constructor(label: string, key: string, value: Array<any> = []) {
    super('select-class', label, key, value);
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
