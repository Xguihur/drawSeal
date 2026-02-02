/**
 * Fabric.js 事件绑定辅助（当前 MVP 暂不需要交互，预留接口）
 */
export function bindFabricEvents(canvas, options = {}) {
  // 禁用所有对象的选中和交互
  canvas.selection = false
  canvas.forEachObject((obj) => {
    obj.selectable = false
    obj.evented = false
  })
}
