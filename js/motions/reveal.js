export default {
  id: 'reveal',
  name: 'Reveal',
  category: 'entrance',
  description: 'Fade and slide up — for content entering the page.',
  className: 'm-reveal',
  loop: false,
  preview: { type: 'box' },
  params: [
    { id: 'duration', label: 'Duration', type: 'range',  min: 100, max: 2000, step: 50, default: 600, unit: 'ms', cssVar: '--m-duration' },
    { id: 'delay',    label: 'Delay',    type: 'range',  min: 0,   max: 2000, step: 50, default: 0,   unit: 'ms', cssVar: '--m-delay' },
    { id: 'easing',   label: 'Easing',   type: 'select', default: 'cubic-bezier(0.22, 1, 0.36, 1)',         cssVar: '--m-easing' },
    { id: 'distance', label: 'Distance', type: 'range',  min: 0,   max: 100,  step: 1,  default: 16,  unit: 'px', cssVar: '--m-distance' },
    { id: 'color',    label: 'Color',    type: 'color',  default: '--slds-color-brand-base-50',              cssVar: '--m-color' },
  ],
};
