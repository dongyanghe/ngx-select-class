import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { SelectClassComponent } from './select-class.component';

import { CommonModule } from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
/**
 * 层级选择模块（地址选择、组织结构选择等树形数据）
 */
@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule
  ],
  declarations: [
    SelectClassComponent
  ],
  exports: [
    SelectClassComponent,
  ],
  providers: [],
  // schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class SelectClassModule {
}
