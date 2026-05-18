export default {
  id: 'glow',
  name: 'Glow pulse',
  category: 'attention',
  description: 'Outward shadow pulse — for drawing focus to an element.',
  className: 'm-glow',
  loop: true,
  preview: { type: 'box' },
  params: [
    { id: 'duration', label: 'Duration', type: 'range',  min: 600, max: 5000, step: 100, default: 2400, unit: 'ms', cssVar: '--m-duration' },
    { id: 'easing',   label: 'Easing',   type: 'select', default: 'ease-out',                                       cssVar: '--m-easing' },
    { id: 'spread',   label: 'Spread',   type: 'range',  min: 4,   max: 40,   step: 1,   default: 16,   unit: 'px', cssVar: '--m-spread' },
    { id: 'color',    label: 'Color',    type: 'color',  default: '--slds-color-brand-base-50',                     cssVar: '--m-color' },
  ],
};
