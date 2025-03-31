export const debugCanvasPosition = (canvas: HTMLCanvasElement) => {
  const rect = canvas.getBoundingClientRect();
  console.log('Canvas position:', {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    style: {
      position: window.getComputedStyle(canvas).position,
      zIndex: window.getComputedStyle(canvas).zIndex,
      pointerEvents: window.getComputedStyle(canvas).pointerEvents
    }
  });
};