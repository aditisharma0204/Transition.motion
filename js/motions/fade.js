export default {
  id: 'fade',
  name: 'Fade',
  category: 'entrance',
  description: 'Plain opacity fade — the most quiet entrance.',
  className: 'm-fade',
  loop: false,
  preview: { type: 'box' },
  params: [
    { id: 'duration', label: 'Duration', type: 'range',  min: 100, max: 2000, step: 50, default: 480, unit: 'ms', cssVar: '--m-duration' },
    { id: 'delay',    label: 'Delay',    type: 'range',  min: 0,   max: 2000, step: 50, default: 0,   unit: 'ms', cssVar: '--m-delay' },
    { id: 'easing',   label: 'Easing',   type: 'select', default: 'ease-out',                                cssVar: '--m-easing' },
    { id: 'color',    label: 'Color',    type: 'color',  default: '--slds-color-brand-base-50',              cssVar: '--m-color' },
  ],
};
