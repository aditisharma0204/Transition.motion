import reveal from './reveal.js';
import pop from './pop.js';
import fade from './fade.js';
import slide from './slide.js';
import shimmer from './shimmer.js';
import breathing from './breathing.js';
import glow from './glow.js';
import ripple from './ripple.js';
import blurReveal from './blur-reveal.js';
import wordReveal from './word-reveal.js';

export const motions = [
  reveal,
  pop,
  fade,
  slide,
  shimmer,
  breathing,
  glow,
  ripple,
  blurReveal,
  wordReveal,
];

export const categories = [
  { id: 'all',       label: 'All' },
  { id: 'entrance',  label: 'Entrances' },
  { id: 'latency',   label: 'Latency' },
  { id: 'attention', label: 'Attention' },
  { id: 'text',      label: 'Text' },
];
