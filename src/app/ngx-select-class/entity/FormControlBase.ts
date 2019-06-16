
import {AbstractControl, FormArray, FormControl, FormGroup} from '@angular/forms';
export class FieldBaseOptions {
  type?: string;
  dataList?: Array<any>;
  callback?: any;
}
/**
 * 表单控件基础类
 */
export class FormControlBase<T> {
  value: Array<any> | any;
  private keys: string | Array<string> = '';
  key: string;
  keyList: Array<string>;
  label?: string;
  controlType: string;
  controlTypes?: string;
  placeholder: string;
  required = false;
  readonly = false;
  disabled = false;
  title ?: string;
  minlength ? = 0;
  maxlength?: number;
  order ?: number;
  validation?: string;
  constructor(controlType: string, label: string, keys: string | Array<string>,
              value: Array<any> | any) {
    this.label = label;
    this.value = value;
    this.controlType = controlType;
    //  设置本组件formGroup的key和父级的key
    if (typeof keys === 'string') {
      this.keyList = keys.split('.');
    }
    if (keys instanceof Array) {
      this.keyList = keys;
    }
    this.key = this.keyList[this.keyList.length - 1];
    //  提示
    if (this.required && (this.readonly || this.disabled)) {
      console.warn('required为true时readonly和disabled建议为false，可避免初始数据为空时无法赋值');
    }
  }

}
