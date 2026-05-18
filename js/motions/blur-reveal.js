export default {
  id: 'blur-reveal',
  name: 'Blur reveal',
  category: 'text',
  description: 'Unblur and fade in — for text emerging into focus.',
  className: 'm-blur-reveal',
  loop: false,
  preview: { type: 'text', content: 'Hello' },
  params: [
    { id: 'duration', label: 'Duration', type: 'range',  min: 200, max: 2000, step: 50, default: 700, unit: 'ms', cssVar: '--m-duration' },
    { id: 'delay',    label: 'Delay',    type: 'range',  min: 0,   max: 2000, step: 50, default: 0,   unit: 'ms', cssVar: '--m-delay' },
    { id: 'easing',   label: 'Easing',   type: 'select', default: 'cubic-bezier(0.22, 1, 0.36, 1)',         cssVar: '--m-easing' },
    { id: 'blur',     label: 'Blur',     type: 'range',  min: 0,   max: 40,   step: 1,  default: 12,  unit: 'px', cssVar: '--m-blur' },
    { id: 'color',    label: 'Color',    type: 'color',  default: '--slds-color-neutral-20',                cssVar: '--m-color' },
  ],
};
