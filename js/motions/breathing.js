export default {
  id: 'breathing',
  name: 'Breathing',
  category: 'latency',
  description: 'Gentle scale + opacity loop — ambient "still working" indicator.',
  className: 'm-breathing',
  loop: true,
  preview: { type: 'box' },
  params: [
    { id: 'duration',    label: 'Duration',  type: 'range',  min: 1000, max: 6000, step: 100,  default: 3000, unit: 'ms', cssVar: '--m-duration' },
    { id: 'easing',      label: 'Easing',    type: 'select', default: 'ease-in-out',                                       cssVar: '--m-easing' },
    { id: 'scale-max',   label: 'Max scale', type: 'range',  min: 1,    max: 1.3,  step: 0.01, default: 1.08,              cssVar: '--m-scale-max' },
    { id: 'opacity-min', label: 'Min opacity', type: 'range', min: 0,   max: 1,    step: 0.05, default: 0.7,               cssVar: '--m-opacity-min' },
    { id: 'color',       label: 'Color',     type: 'color',  default: '--slds-color-brand-base-50',                        cssVar: '--m-color' },
  ],
};
