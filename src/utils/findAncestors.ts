export function findAncestorWithClass(
  element: any,
  className: string
): HTMLElement | null {
  while (element && element !== document.body) {
    if (element.classList.contains(className)) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}
