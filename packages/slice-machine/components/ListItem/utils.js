/** https://codesandbox.io/u/justsolarry */

const queryAttr = "data-rbd-drag-handle-draggable-id";

export const getDraggedDom = (draggableId) =>
  document.querySelector(`[${queryAttr}='${draggableId}']`);

export const getDraggedDomPosition = (event) => {
  const draggedDOM = getDraggedDom(event.draggableId);

  if (!draggedDOM) {
    return;
  }

  const sourceIndex = event.source.index;
  const { clientHeight, clientWidth } = draggedDOM;
  const clientY =
    parseFloat(window.getComputedStyle(draggedDOM.parentNode).paddingTop) +
    [...draggedDOM.parentNode.children]
      .slice(0, sourceIndex)
      .reduce((total, curr) => {
        const style = curr.currentStyle || window.getComputedStyle(curr);
        const marginBottom = parseFloat(style.marginBottom);
        return total + curr.clientHeight + marginBottom;
      }, 0);

  return {
    clientHeight,
    clientWidth,
    clientY,
    clientX: parseFloat(
      window.getComputedStyle(draggedDOM.parentNode).paddingLeft
    ),
  };
};
