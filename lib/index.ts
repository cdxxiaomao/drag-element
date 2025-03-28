interface DragConfig {
  /**
   * 拖拽点
   */
  handle?: string | Element | Array<string | Element>
  /**
   * 参考点
   */
  reference?: 'parent' | 'window'
  /**
   * 是否展示虚拟位置,拖动结束才实际移动位置
   */
  useVirtual?: boolean
  /**
   * 拖拽开始前的回调
   */
  onDragStart?: () => void
  /**
   * 拖拽中的回调
   */
  onDrag?: () => void
  /**
   * 拖拽结束后的回调
   */
  onDragEnd?: () => void
}

/**
 * 拖拽元素位置
 * @param element 拖拽移动位置的元素
 * @param config 可选项
 */
export function dragElement (element: string | Element, config: DragConfig = {}): () => void {
  const el = getElement(element)
  if (!el) return

  const {
    handle = el,
    reference = 'window',
    useVirtual = false,
    onDragStart,
    onDrag,
    onDragEnd
  } = config

  // 获取所有 handle 元素
  const dragHandles = getHandleElements(handle)
  if (dragHandles.length === 0) return // 如果没有有效的 handle，直接返回

  let isDragging = false
  let startX = 0
  let startY = 0
  let initialX = 0
  let initialY = 0
  let virtualEl: HTMLElement | null = null

  // 根据 reference 设置定位方式
  const setPositionStyle = () => {
    if (reference === 'parent') {
      const parent = el.parentElement
      if (parent && window.getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative' // 如果父级没有配置 position，则自动加上 relative
      }
      el.style.position = 'absolute'
    } else {
      el.style.position = 'fixed'
    }
  }

  // 初始化定位方式
  setPositionStyle()

  // 获取滚动条宽度
  const getScrollbarWidth = () => {
    return window.innerWidth - document.documentElement.clientWidth
  }

  // 获取边界限制
  const getBoundaries = () => {
    if (reference === 'parent') {
      const parent = el.offsetParent as HTMLElement
      return {
        minX: 0,
        minY: 0,
        maxX: (parent?.clientWidth || 0) - el.offsetWidth, // 包含边框
        maxY: (parent?.clientHeight || 0) - el.offsetHeight // 包含边框
      }
    } else {
      const scrollbarWidth = getScrollbarWidth()
      return {
        minX: 0,
        minY: 0,
        maxX: window.innerWidth - el.offsetWidth - scrollbarWidth, // 减去滚动条宽度
        maxY: window.innerHeight - el.offsetHeight // 包含边框
      }
    }
  }

  // 获取元素的实际偏移量，考虑 transform 属性
  const getActualOffset = (element: HTMLElement) => {
    const style = window.getComputedStyle(element)
    const matrix = new DOMMatrixReadOnly(style.transform)
    const rect = element.getBoundingClientRect()
    return {
      left: rect.left - matrix.m41,
      top: rect.top - matrix.m42
    }
  }

  // 创建虚拟元素
  // 创建虚拟元素
  const createVirtualElement = () => {
    const clone = document.createElement('div') // 创建一个新的 div 作为虚拟元素

    // 获取目标元素的样式
    const computedStyle = window.getComputedStyle(el)

    // 设置虚拟元素的基本样式
    clone.style.position = reference === 'parent' ? 'absolute' : 'fixed'
    clone.style.left = `${el.offsetLeft}px`
    clone.style.top = `${el.offsetTop}px`
    clone.style.width = `${el.offsetWidth}px`
    clone.style.height = `${el.offsetHeight}px`
    clone.style.border = '2px dotted rgba(0, 0, 0, 0.5)' // 修改边框样式
    clone.style.borderRadius = computedStyle.borderRadius // 保留圆角
    clone.style.opacity = '0.7'
    clone.style.pointerEvents = 'none'
    clone.style.zIndex = '9999'
    clone.style.boxSizing = 'border-box' // 确保边框不影响尺寸
    clone.style.backgroundColor = computedStyle.backgroundColor // 复制背景色

    // 将虚拟元素添加到原元素的 offsetParent 或 body 中
    if (reference === 'parent') {
      el.offsetParent?.appendChild(clone)
    } else {
      document.body.appendChild(clone)
    }
    return clone
  }

  // 鼠标按下事件
  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    isDragging = true

    // 触发拖拽开始事件
    if (onDragStart) {
      onDragStart()
    }

    const rect = el.getBoundingClientRect()

    // 计算初始位置，考虑 transform 属性
    startX = e.clientX
    startY = e.clientY

    if (reference === 'parent') {
      // 父级模式下，计算相对于父级的偏移量
      const parentRect = el.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 }
      const actualOffset = getActualOffset(el)
      initialX = actualOffset.left - parentRect.left
      initialY = actualOffset.top - parentRect.top
    } else {
      // 视窗模式下，直接使用 clientX/clientY
      const actualOffset = getActualOffset(el)
      initialX = actualOffset.left
      initialY = actualOffset.top
    }

    if (useVirtual) {
      virtualEl = createVirtualElement()
      virtualEl.style.cursor = 'grabbing'
    } else {
      el.style.cursor = 'grabbing'
    }
  }

  // 鼠标移动事件
  const onMouseMove = (e: MouseEvent): void => {
    if (!isDragging) return

    // 触发拖拽中事件
    if (onDrag) {
      onDrag()
    }

    const boundaries = getBoundaries()
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY

    // 计算新位置
    let newX = initialX + deltaX
    let newY = initialY + deltaY

    // 边界约束
    newX = Math.max(boundaries.minX, Math.min(newX, boundaries.maxX))
    newY = Math.max(boundaries.minY, Math.min(newY, boundaries.maxY))

    // 同步到目标元素
    const target = useVirtual ? virtualEl : el
    if (target) {
      target.style.left = `${newX}px`
      target.style.top = `${newY}px`
    }
  }

  // 鼠标释放事件
  const onMouseUp = (): void => {
    if (!isDragging) return
    isDragging = false

    // 触发拖拽结束事件
    if (onDragEnd) {
      onDragEnd()
    }

    // 同步到真实元素
    if (useVirtual && virtualEl) {
      // 获取虚拟元素的位置
      const left = virtualEl.style.left
      const top = virtualEl.style.top

      // 直接应用位置到目标元素
      el.style.left = left
      el.style.top = top

      // 移除虚拟元素
      virtualEl.remove()
    }

    // 恢复样式
    if (useVirtual) {
      virtualEl?.style.removeProperty('cursor')
    } else {
      el.style.removeProperty('cursor')
    }
  }

  // 工具函数：获取元素
  function getElement (target: string | Element): HTMLElement | null {
    return typeof target === 'string'
      ? document.querySelector(target)
      : target as HTMLElement
  }

  // 工具函数：获取所有 handle 元素
  function getHandleElements (handle: string | Element | Array<string | Element>): HTMLElement[] {
    if (Array.isArray(handle)) {
      return handle.map(h => getElement(h)).filter(Boolean)
    } else {
      const element = getElement(handle)
      return element ? [element] : []
    }
  }

  // 为所有 handle 添加事件监听器
  dragHandles.forEach(handle => {
    handle.addEventListener('mousedown', onMouseDown)
  })
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)

  // 返回清理函数
  return () => {
    dragHandles.forEach(handle => {
      handle.removeEventListener('mousedown', onMouseDown)
    })
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    el.style.position = '' // 恢复原始定位
  }
}
