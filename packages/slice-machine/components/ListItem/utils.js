/** https://codesandbox.io/u/justsolarry */

const queryAttr = "data-rbd-drag-handle-draggable-id";

export const getDraggedDom = (draggableId) =>
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  document.querySelector(`[${queryAttr}='${draggableId}']`);

export const getDraggedDomPosition = (event) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const draggedDOM = getDraggedDom(event.draggableId);

  if (!draggedDOM) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const sourceIndex = event.source.index;
  const { clientHeight, clientWidth } = draggedDOM;
  const clientY =
    parseFloat(window.getComputedStyle(draggedDOM.parentNode).paddingTop) +
    [...draggedDOM.parentNode.children]
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .slice(0, sourceIndex)
      .reduce((total, curr) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/strict-boolean-expressions
        const style = curr.currentStyle || window.getComputedStyle(curr);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
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
