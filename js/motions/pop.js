export default {
  id: 'pop',
  name: 'Pop',
  category: 'entrance',
  description: 'Scale up with overshoot — for celebratory or attention-grabbing entrances.',
  className: 'm-pop',
  loop: false,
  preview: { type: 'box' },
  params: [
    { id: 'duration',   label: 'Duration',   type: 'range',  min: 100, max: 2000, step: 50,   default: 600,  unit: 'ms', cssVar: '--m-duration' },
    { id: 'delay',      label: 'Delay',      type: 'range',  min: 0,   max: 2000, step: 50,   default: 0,    unit: 'ms', cssVar: '--m-delay' },
    { id: 'easing',     label: 'Easing',     type: 'select', default: 'cubic-bezier(0.22, 1.4, 0.36, 1)',                   cssVar: '--m-easing' },
    { id: 'scale-from', label: 'Start scale', type: 'range', min: 0,   max: 1,    step: 0.05, default: 0.7,                  cssVar: '--m-scale-from' },
    { id: 'color',      label: 'Color',      type: 'color',  default: '--slds-color-brand-base-50',                         cssVar: '--m-color' },
  ],
};
