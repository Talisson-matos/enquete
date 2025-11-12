// utils/copy.ts
export const copiar = (texto: string, label: string) => {
  navigator.clipboard.writeText(texto);
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = `${label} copiado!`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 2000);
};