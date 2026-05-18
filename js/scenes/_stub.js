// Placeholder used until the real scene module is wired up.
// Renders a "coming next" panel inside the host so the picker chip
// still works end-to-end.

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function buildStub({ id, name, description }) {
  return {
    id,
    name,
    description,
    isStub: true,
    settings: [
      { id: 'total', label: 'Total duration', type: 'range', min: 1000, max: 8000, step: 100, default: 4000, unit: 'ms' },
    ],
    copy: [],
    mount(host /* , getValues */) {
      clearChildren(host);
      host.classList.add('scene-stub');

      const wrap = document.createElement('div');
      wrap.className = 'scene-stub-card';

      const title = document.createElement('div');
      title.className = 'scene-stub-title';
      title.textContent = `${name} — coming next`;

      const body = document.createElement('p');
      body.className = 'scene-stub-body';
      body.textContent = description;

      wrap.append(title, body);
      host.append(wrap);

      function renderAt(/* t */) { /* nothing animated yet */ }
      function getTotal() { return 4000; }
      function getMarks() { return []; }
      function destroy() {
        clearChildren(host);
        host.classList.remove('scene-stub');
      }
      return { renderAt, getTotal, getMarks, destroy };
    },
  };
}
