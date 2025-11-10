export function injectStyles(cssText) {
  if (typeof document === "undefined") return; // safe for SSR
  if (document.getElementById("ynotsoft-dynamic-form-styles")) return; // avoid duplicates

  const style = document.createElement("style");
  style.id = "ynotsoft-dynamic-form-styles";
  style.textContent = cssText;
  document.head.appendChild(style);
}
