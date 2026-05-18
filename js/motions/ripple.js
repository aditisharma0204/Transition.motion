export default {
  id: 'ripple',
  name: 'Ripple',
  category: 'attention',
  description: 'Outward expanding ring — for highlighting an interactive target.',
  className: 'm-ripple',
  loop: true,
  preview: { type: 'box' },
  params: [
    { id: 'duration', label: 'Duration', type: 'range',  min: 500, max: 4000, step: 100,  default: 1500, unit: 'ms', cssVar: '--m-duration' },
    { id: 'easing',   label: 'Easing',   type: 'select', default: 'ease-out',                                        cssVar: '--m-easing' },
    { id: 'scale-to', label: 'Scale to', type: 'range',  min: 1.2, max: 3,    step: 0.05, default: 1.8,              cssVar: '--m-scale-to' },
    { id: 'color',    label: 'Color',    type: 'color',  default: '--slds-color-brand-base-50',                      cssVar: '--m-color' },
  ],
};
