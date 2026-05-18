export default {
  id: 'word-reveal',
  name: 'Word reveal',
  category: 'text',
  description: 'Blur, lift, and fade — for words emerging into focus.',
  className: 'm-word-reveal',
  loop: false,
  preview: { type: 'text', content: 'Setting the stage' },
  params: [
    { id: 'duration', label: 'Duration', type: 'range',  min: 200, max: 2000, step: 50, default: 700, unit: 'ms', cssVar: '--m-duration' },
    { id: 'delay',    label: 'Delay',    type: 'range',  min: 0,   max: 2000, step: 50, default: 0,   unit: 'ms', cssVar: '--m-delay' },
    { id: 'easing',   label: 'Easing',   type: 'select', default: 'cubic-bezier(0.22, 1, 0.36, 1)',         cssVar: '--m-easing' },
    { id: 'distance', label: 'Distance', type: 'range',  min: 0,   max: 60,   step: 1,  default: 12,  unit: 'px', cssVar: '--m-distance' },
    { id: 'blur',     label: 'Blur',     type: 'range',  min: 0,   max: 24,   step: 1,  default: 8,   unit: 'px', cssVar: '--m-blur' },
    { id: 'color',    label: 'Color',    type: 'color',  default: '--slds-color-neutral-20',                cssVar: '--m-color' },
  ],
};
