import { tokenToHex } from './lottie-tint.js';

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export default {
  id: 'agent-thinking',
  name: 'Agent Thinking',
  description: 'A 2x2 pulsing dot grid with a status label.',
  why: 'A compact, inline loading state that pairs well with text.',
  howToUse: 'Use inside a chat bubble or button to indicate the agent is processing.',
  loop: true,

  settings: [
    { id: 'text', label: 'Status Text', type: 'text', default: 'Agent working...' },
    { id: 'dotColor', label: 'Dot Color', type: 'color', default: '--slds-g-color-neutral-base-60' },
    { id: 'textColor', label: 'Text Color', type: 'color', default: '--slds-g-color-neutral-base-40' },
    { id: 'bgColor', label: 'Background', type: 'color', default: '--slds-g-color-surface-1' },
    { id: 'duration', label: 'Pulse Duration (ms)', type: 'range', min: 500, max: 3000, step: 100, default: 1200 },
    { id: 'stagger', label: 'Dot Stagger (ms)', type: 'range', min: 0, max: 500, step: 50, default: 200 }
  ],

  mount(host, getValues) {
    clearChildren(host);
    host.classList.add('scene-agent-thinking');

    const wrapper = document.createElement('div');
    wrapper.className = 'agent-thinking-wrapper';

    const grid = document.createElement('div');
    grid.className = 'agent-thinking-grid';
    // Create 4 dots
    for (let i = 0; i < 4; i++) {
      grid.appendChild(document.createElement('div'));
    }

    const textEl = document.createElement('span');
    textEl.className = 'agent-thinking-text';

    wrapper.appendChild(grid);
    wrapper.appendChild(textEl);
    host.appendChild(wrapper);

    function renderAt(t) {
      const v = getValues();
      
      wrapper.style.backgroundColor = `var(${v.bgColor}, ${v.bgColor})`;
      grid.style.setProperty('--dot-color', `var(${v.dotColor}, ${v.dotColor})`);
      textEl.style.color = `var(${v.textColor}, ${v.textColor})`;
      textEl.textContent = v.text;
      
      grid.style.setProperty('--anim-duration', `${v.duration}ms`);
      grid.style.setProperty('--anim-stagger', `${v.stagger}ms`);
    }

    function getTotal() {
      const v = getValues();
      return Number(v.duration) || 1200; 
    }

    function getMarks() { return [0]; }

    function destroy() {
      clearChildren(host);
      host.classList.remove('scene-agent-thinking');
    }

    return { renderAt, getTotal, getMarks, destroy };
  },

  async exportHTML(values) {
    const dotHex = tokenToHex(values.dotColor, '#d4d4d8');
    const textHex = tokenToHex(values.textColor, '#a1a1aa');
    const bgHex = tokenToHex(values.bgColor, '#18181b');
    const duration = Number(values.duration) || 1200;
    const stagger = Number(values.stagger) || 200;

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Agent Thinking — exported</title>
<style>
  :root { color-scheme: dark; }
  html, body { height: 100%; margin: 0; }
  body {
    background: #E5E5E5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  
  .agent-thinking-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: ${bgHex};
    padding: 12px 24px;
    border-radius: 8px;
    width: fit-content;
  }

  .agent-thinking-grid {
    display: grid;
    grid-template-columns: repeat(2, 4px);
    gap: 4px;
  }

  .agent-thinking-grid > div {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: ${dotHex};
    opacity: 0.2;
    transform: scale(0.8);
    animation: agent-thinking-pulse ${duration}ms infinite ease-in-out;
  }

  /* Circular stagger: 1, 2, 4, 3 (top-left, top-right, bottom-right, bottom-left) */
  .agent-thinking-grid > div:nth-child(1) { animation-delay: 0ms; }
  .agent-thinking-grid > div:nth-child(2) { animation-delay: ${stagger}ms; }
  .agent-thinking-grid > div:nth-child(4) { animation-delay: ${stagger * 2}ms; }
  .agent-thinking-grid > div:nth-child(3) { animation-delay: ${stagger * 3}ms; }

  @keyframes agent-thinking-pulse {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1); }
  }

  .agent-thinking-text {
    font-size: 14px;
    font-weight: 500;
    color: ${textHex};
  }
</style>
</head>
<body>
  <div class="agent-thinking-wrapper">
    <div class="agent-thinking-grid">
      <div></div><div></div><div></div><div></div>
    </div>
    <span class="agent-thinking-text">${values.text}</span>
  </div>
</body>
</html>`;
  }
};
