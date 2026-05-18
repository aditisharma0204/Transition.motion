import { tokenToHex } from './lottie-tint.js';
import { animate } from 'motion';

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export default {
  id: 'expressive-card',
  name: 'Expressive Card',
  description: 'A UI card interaction demonstrating the M3 difference between Spatial Springs (bouncy scaling) and Effects Springs (linear color transitions).',
  loop: true,

  settings: [
    { id: 'scheme', label: 'Motion Scheme', type: 'select', default: 'expressive', options: [
      { value: 'expressive', label: 'Expressive (Bouncy & Alive)' },
      { value: 'standard', label: 'Standard (Smooth & Functional)' },
      { value: 'custom', label: 'Custom Settings' }
    ] },
    { id: 'stiffness', label: 'Stiffness (Custom)', type: 'range', min: 50, max: 1000, step: 10, default: 400 },
    { id: 'damping', label: 'Damping (Custom)', type: 'range', min: 0.1, max: 2, step: 0.1, default: 0.6 },
    { id: 'cardBg', label: 'Card Base', type: 'color', default: '--slds-g-color-neutral-base-95' },
    { id: 'hoverColor', label: 'Card Hover', type: 'color', default: '--slds-g-color-neutral-base-100' },
  ],

  mount(host, getValues) {
    clearChildren(host);
    host.classList.add('scene-expressive-card');

    const wrapper = document.createElement('div');
    wrapper.className = 'expressive-card-wrapper';

    const card = document.createElement('div');
    card.className = 'expressive-card';
    
    // Add some dummy content to make it look like a real card
    const title = document.createElement('h3');
    title.textContent = 'M3 Physics';
    const text = document.createElement('p');
    text.textContent = 'Hover or tap this card to experience the difference between spatial bounds and stylistic effects.';
    
    card.append(title, text);
    wrapper.appendChild(card);
    host.appendChild(wrapper);

    let hoverAnim = null;

    function getSpringConfig() {
      const v = getValues();
      if (v.scheme === 'expressive') return { type: 'spring', stiffness: 400, damping: 0.6 };
      if (v.scheme === 'standard') return { type: 'spring', stiffness: 300, damping: 1.0 };
      return { type: 'spring', stiffness: v.stiffness, damping: v.damping };
    }

    wrapper.addEventListener('mouseenter', () => {
      const v = getValues();
      const hoverStr = `var(${v.hoverColor}, ${v.hoverColor})`;
      const springConfig = getSpringConfig();
      
      if (hoverAnim) hoverAnim.stop();
      
      // Spatial properties get the bouncy spring.
      // Effects properties (color, shadow) get a linear/smooth duration.
      hoverAnim = animate(
        card,
        { 
          scale: 1.05,
          y: -8,
          backgroundColor: hoverStr,
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
          borderRadius: "24px"
        },
        {
          scale: springConfig,
          y: springConfig,
          borderRadius: springConfig,
          backgroundColor: { duration: 0.2 },
          boxShadow: { duration: 0.2 }
        }
      );
    });

    wrapper.addEventListener('mouseleave', () => {
      const v = getValues();
      const baseStr = `var(${v.cardBg}, ${v.cardBg})`;
      const springConfig = getSpringConfig();
      
      if (hoverAnim) hoverAnim.stop();
      
      hoverAnim = animate(
        card,
        { 
          scale: 1,
          y: 0,
          backgroundColor: baseStr,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          borderRadius: "16px"
        },
        {
          scale: springConfig,
          y: springConfig,
          borderRadius: springConfig,
          backgroundColor: { duration: 0.3 },
          boxShadow: { duration: 0.3 }
        }
      );
    });

    function renderAt(t) {
      const v = getValues();
      card.style.setProperty('--card-base', `var(${v.cardBg}, ${v.cardBg})`);
      card.style.setProperty('--card-hover', `var(${v.hoverColor}, ${v.hoverColor})`);
    }

    function getTotal() { return 2000; }
    function getMarks() { return []; }

    function destroy() {
      if (hoverAnim) hoverAnim.stop();
      clearChildren(host);
      host.classList.remove('scene-expressive-card');
    }

    async function exportHTML(values) {
      // Simple export script
      return `<!doctype html><html><body><p>Export coming soon</p></body></html>`;
    }

    return { renderAt, getTotal, getMarks, destroy, exportHTML };
  }
};