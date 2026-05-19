import { tokenToHex } from './lottie-tint.js';

export default {
  id: 'text-gradient',
  name: 'Gradient Text',
  description: 'Animated multi-color text gradient loop.',
  why: 'Draws the eye to a specific, short headline without changing the page layout.',
  howToUse: 'Hero banners or empty-state titles that need a splash of dynamic color.',
  settings: [
    { id: 'text', label: 'Text', type: 'text', default: 'Add a splash of color!' },
    { id: 'animationSpeed', label: 'Animation Speed (s)', type: 'range', min: 1, max: 20, step: 0.5, default: 3 },
    { id: 'direction', label: 'Direction', type: 'select', default: 'horizontal', options: [
      { value: 'horizontal', label: 'Horizontal' },
      { value: 'vertical', label: 'Vertical' },
      { value: 'diagonal', label: 'Diagonal' }
    ] },
    { id: 'yoyo', label: 'Yoyo', type: 'boolean', default: true },
    { id: 'showBorder', label: 'Show Border', type: 'boolean', default: false },
    { id: 'pauseOnHover', label: 'Pause on Hover', type: 'boolean', default: false },
    { id: 'color1', label: 'Color 1', type: 'color', default: '--slds-g-color-palette-indigo-50' },
    { id: 'color2', label: 'Color 2', type: 'color', default: '--slds-g-color-palette-pink-50' },
    { id: 'color3', label: 'Color 3', type: 'color', default: '--slds-g-color-palette-purple-50' },
  ],

  mount(host, getValues) {
    const wrapper = document.createElement('div');
    wrapper.className = 'text-gradient-wrapper';
    
    const animatedText = document.createElement('div');
    animatedText.className = 'animated-gradient-text';
    
    const overlay = document.createElement('div');
    overlay.className = 'gradient-overlay';
    
    const textContent = document.createElement('div');
    textContent.className = 'text-content';

    animatedText.appendChild(overlay);
    animatedText.appendChild(textContent);
    wrapper.appendChild(animatedText);
    host.appendChild(wrapper);

    let isHovering = false;
    animatedText.addEventListener('mouseenter', () => { isHovering = true; });
    animatedText.addEventListener('mouseleave', () => { isHovering = false; });

    let lastTime = 0;
    let elapsed = 0;

    function renderAt(t) {
      const v = getValues();
      
      const c1 = tokenToHex(v.color1);
      const c2 = tokenToHex(v.color2);
      const c3 = tokenToHex(v.color3);
      
      const colors = [c1, c2, c3];
      const gradientColors = [...colors, colors[0]].join(', ');
      
      const gradientAngle = v.direction === 'horizontal' ? 'to right' : v.direction === 'vertical' ? 'to bottom' : 'to bottom right';
      const backgroundSize = v.direction === 'horizontal' ? '300% 100%' : v.direction === 'vertical' ? '100% 300%' : '300% 300%';
      
      animatedText.classList.toggle('with-border', v.showBorder);
      overlay.style.display = v.showBorder ? 'block' : 'none';
      textContent.textContent = v.text;

      const gradientStyle = `linear-gradient(${gradientAngle}, ${gradientColors})`;
      overlay.style.backgroundImage = gradientStyle;
      overlay.style.backgroundSize = backgroundSize;
      
      textContent.style.backgroundImage = gradientStyle;
      textContent.style.backgroundSize = backgroundSize;

      // Handle pause on hover logic within timeline
      let deltaTime = t - lastTime;
      if (t === 0) {
        elapsed = 0; // Reset on timeline start
      } else if (t < lastTime) {
        // Scrubbing backwards or restarting
        elapsed = t;
      } else {
        if (!v.pauseOnHover || !isHovering) {
          elapsed += deltaTime;
        }
      }
      lastTime = t;

      const animationDuration = v.animationSpeed * 1000;
      let progress = 0;

      if (v.yoyo) {
        const fullCycle = animationDuration * 2;
        const cycleTime = elapsed % fullCycle;
        if (cycleTime < animationDuration) {
          progress = (cycleTime / animationDuration) * 100;
        } else {
          progress = 100 - ((cycleTime - animationDuration) / animationDuration) * 100;
        }
      } else {
        progress = (elapsed / animationDuration) * 100;
      }

      let backgroundPosition = '';
      if (v.direction === 'horizontal') {
        backgroundPosition = `${progress}% 50%`;
      } else if (v.direction === 'vertical') {
        backgroundPosition = `50% ${progress}%`;
      } else {
        backgroundPosition = `${progress}% 50%`; // As per React component
      }

      overlay.style.backgroundPosition = backgroundPosition;
      textContent.style.backgroundPosition = backgroundPosition;
    }

    function getTotal() {
      return 60000; // Plays for a long time
    }

    function getMarks() {
      return [];
    }

    function destroy() {
      wrapper.remove();
    }

    async function exportHTML(values) {
      const c1 = tokenToHex(values.color1);
      const c2 = tokenToHex(values.color2);
      const c3 = tokenToHex(values.color3);
      
      const colors = [c1, c2, c3];
      const gradientColors = [...colors, colors[0]].join(', ');
      
      const gradientAngle = values.direction === 'horizontal' ? 'to right' : values.direction === 'vertical' ? 'to bottom' : 'to bottom right';
      const backgroundSize = values.direction === 'horizontal' ? '300% 100%' : values.direction === 'vertical' ? '100% 300%' : '300% 300%';
      
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gradient Text Animation</title>
<style>
  body {
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #E5E5E5;
    font-family: system-ui, -apple-system, sans-serif;
  }
  
  .animated-gradient-text {
    position: relative;
    margin: 0 auto;
    display: flex;
    max-width: fit-content;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border-radius: 1.25rem;
    font-weight: 500;
    backdrop-filter: blur(10px);
    transition: box-shadow 0.5s ease-out;
    overflow: hidden;
    cursor: pointer;
    font-size: 2rem;
  }

  .animated-gradient-text.with-border {
    padding: 0.35rem 0.75rem;
  }

  .gradient-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    z-index: 0;
    pointer-events: none;
    background-image: linear-gradient(${gradientAngle}, ${gradientColors});
    background-size: ${backgroundSize};
  }

  .gradient-overlay::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    border-radius: inherit;
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: #E5E5E5; /* Match body bg */
    z-index: -1;
  }

  .text-content {
    display: inline-block;
    position: relative;
    z-index: 2;
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    background-image: linear-gradient(${gradientAngle}, ${gradientColors});
    background-size: ${backgroundSize};
  }
</style>
</head>
<body>
  <div class="animated-gradient-text ${values.showBorder ? 'with-border' : ''}" id="text-container">
    ${values.showBorder ? '<div class="gradient-overlay"></div>' : ''}
    <div class="text-content">
      ${values.text}
    </div>
  </div>
  
  <script type="importmap">
    { 
      "imports": { 
        "motion": "https://esm.sh/motion"
      } 
    }
  </script>
  <script type="module">
    import { animate } from "motion";
    
    const duration = ${values.animationSpeed};
    const isYoyo = ${values.yoyo};
    const pauseOnHover = ${values.pauseOnHover};
    
    const elements = document.querySelectorAll('.gradient-overlay, .text-content');
    let controls = [];
    
    elements.forEach(el => {
      const animation = animate(
        el,
        { backgroundPosition: ${values.direction === 'vertical' ? '["50% 0%", "50% 100%"]' : '["0% 50%", "100% 50%"]'} },
        { 
          duration: duration, 
          repeat: Infinity, 
          direction: isYoyo ? "alternate" : "normal",
          ease: "linear"
        }
      );
      controls.push(animation);
    });

    if (pauseOnHover) {
      const container = document.getElementById('text-container');
      container.addEventListener('mouseenter', () => {
        controls.forEach(c => c.pause());
      });
      container.addEventListener('mouseleave', () => {
        controls.forEach(c => c.play());
      });
    }
  </script>
</body>
</html>`;
    }

    return { renderAt, getTotal, getMarks, destroy, exportHTML };
  }
};
