export default {
  id: 'slide',
  name: 'Slide',
  category: 'entrance',
  description: 'Slide in from any direction with a fade.',
  className: 'm-slide',
  loop: false,
  preview: { type: 'box' },
  params: [
    { id: 'duration',  label: 'Duration',  type: 'range',  min: 100, max: 2000, step: 50, default: 600, unit: 'ms', cssVar: '--m-duration' },
    { id: 'delay',     label: 'Delay',     type: 'range',  min: 0,   max: 2000, step: 50, default: 0,   unit: 'ms', cssVar: '--m-delay' },
    { id: 'easing',    label: 'Easing',    type: 'select', default: 'cubic-bezier(0.22, 1, 0.36, 1)',          cssVar: '--m-easing' },
    { id: 'distance',  label: 'Distance',  type: 'range',  min: 0,   max: 200,  step: 1,  default: 24,  unit: 'px' },
    {
      id: 'direction',
      label: 'Direction',
      type: 'select',
      default: 'up',
      options: [
        { value: 'up',    label: 'Up' },
        { value: 'down',  label: 'Down' },
        { value: 'left',  label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
    },
    { id: 'color', label: 'Color', type: 'color', default: '--slds-color-brand-base-50', cssVar: '--m-color' },
  ],
  // distance + direction combine into --m-tx / --m-ty
  compute(values) {
    const d = values.distance;
    const map = {
      up:    { '--m-tx': '0px',     '--m-ty': `${d}px`  },
      down:  { '--m-tx': '0px',     '--m-ty': `-${d}px` },
      left:  { '--m-tx': `${d}px`,  '--m-ty': '0px'     },
      right: { '--m-tx': `-${d}px`, '--m-ty': '0px'     },
    };
    return map[values.direction] || map.up;
  },
};
