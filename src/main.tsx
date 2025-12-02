import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

function scrubTraeBadge() {
  function scan(root: Document | ShadowRoot) {
    const nodes = Array.from(root.querySelectorAll('*')) as HTMLElement[];
    for (const el of nodes) {
      const text = (el.textContent || '').toLowerCase();
      const html = (el.innerHTML || '').toLowerCase();
      const aria = (el.getAttribute('aria-label') || '').toLowerCase();
      const title = (el.getAttribute('title') || '').toLowerCase();
      const href = (el.getAttribute('href') || '').toLowerCase();
      const src = (el.getAttribute('src') || '').toLowerCase();
      const style = window.getComputedStyle(el);
      const fixedBR = style.position === 'fixed' && style.bottom !== 'auto' && style.right !== 'auto';
      const isTrae = text.includes('trae') || html.includes('trae') || aria.includes('trae') || title.includes('trae') || href.includes('trae') || src.includes('trae');
      if (isTrae || (fixedBR && (text.includes('solo') || html.includes('solo')))) {
        el.remove();
        continue;
      }
      const anyEl = el as any;
      if (anyEl.shadowRoot) scan(anyEl.shadowRoot);
    }
  }
  scan(document);
}

scrubTraeBadge();
const observer = new MutationObserver(() => scrubTraeBadge());
observer.observe(document.documentElement, { subtree: true, childList: true });
