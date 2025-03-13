# @poohou/drag-element

#### 介绍
拖拽元素位置

![Kapture 2025-03-11 at 22.31.19](https://txt-01.oss-cn-chengdu.aliyuncs.com/typora/lyra/Kapture%202025-03-11%20at%2022.31.19.gif)


## 使用方法
```html
<div
  id="draggable1"
  style="width: 100px; height: 100px; border: 1px solid #ccc;"
/>

<script>
import { dragElement } from 'poohou-drag-element'
  
const uninstall = dragElement('#draggable1', {})
// 销毁方法
// uninstall()
</script>
```
## 参数
```typescript
dragElement<HTMLElement | string, Options>
```

## Options

|  参数 | 默认值                                | 可选项/类型                                                                                        | 描述       |
|---|------------------------------------|-----------------------------------------------------------------------------------------------|----------|
| reference  | `window` | `window \| parent`                           | 拖拽参考点，window：浏览器窗口，parent：父级 |
| useVirtual | `false`  | 'true'                                       | 是否开启移动时虚拟效果。                                     |
| handle     | -        | `string \|Element \|Array<string \|Element>` | 拖拽点配置，支持多个拖拽节点数组。配置后则主节点不可拖动     |


## Methods

| 方法名 | 参数 | 描述   |
|-----|----|------|
|   uninstall  | -  | 销毁 |
