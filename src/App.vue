<template>
  <div class="container">
    <div
      id="draggable"
      style="width: 100px; height: 100px; border: 1px solid #ccc; box-sizing: border-box; border-radius: 20px; overflow:hidden;"
    >
      <div
        id="handle"
        class="dragEl"
      >
        拖拽点
      </div>
      <div
        id="handle1"
        class="dragEl"
      >
        拖拽点1
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { dragElement } from '../lib'
import { onMounted } from 'vue'

onMounted(() => {
  dragElement('#draggable', {
    reference: 'window',
    // reference: 'parent',
    handle: ['#handle', '#handle1'],
    onDragStart () {
      console.log('onDragStart')
    },
    onDrag () {
      console.log('onDrag')
    },
    onDragEnd () {
      console.log('onDragEnd')
    }
    // useVirtual: true
  })
})

</script>

<style scoped lang="less">
.container {
  font-size: 12px;
  width: 200px;
  height: 200px;
  border: 1px solid #c4c4c4;
  position:relative;
  margin: 30px;
  overflow: auto;
  border-radius: 20px;
}

.dragEl {
  width: 60px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 50px;
  margin-top: 20px;
  cursor: pointer;
  &:hover {
    background: #d9d9d9;
  }
}
</style>
