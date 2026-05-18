export default {
  id: 'shimmer',
  name: 'Shimmer',
  category: 'latency',
  description: 'Skeleton sweep — for loading placeholders.',
  className: 'm-shimmer',
  loop: true,
  preview: { type: 'bar' },
  params: [
    { id: 'duration',        label: 'Duration',  type: 'range', min: 500, max: 5000, step: 100, default: 2000, unit: 'ms', cssVar: '--m-duration' },
    { id: 'color-base',      label: 'Base',      type: 'color', default: '--slds-color-neutral-90',                         cssVar: '--m-color-base' },
    { id: 'color-highlight', label: 'Highlight', type: 'color', default: '--slds-color-neutral-100',                        cssVar: '--m-color-highlight' },
  ],
};
