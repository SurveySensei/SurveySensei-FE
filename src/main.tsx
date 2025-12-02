import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

const removeInjectedBadge = () => {
  const candidates = Array.from(document.querySelectorAll('*')) as HTMLElement[];
  for (const el of candidates) {
    const text = (el.textContent || '').trim();
    if (text.includes('TRAE') && text.includes('SOLO')) {
      el.remove();
    }
  }
};

removeInjectedBadge();

const observer = new MutationObserver(() => removeInjectedBadge());
observer.observe(document.body, { subtree: true, childList: true });
