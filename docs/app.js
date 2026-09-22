/* Public portfolio interactions only. No tracking, storage, network calls or product runtime. */
(() => {
  'use strict';
  const ns = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motion = document.querySelector('#motion');
  let paused = reduced.matches;
  function applyMotion() {
    document.body.classList.toggle('paused', paused);
    document.documentElement.classList.toggle('paused', paused);
    motion.setAttribute('aria-pressed', String(paused));
    motion.textContent = paused ? 'Motion paused' : 'Pause motion';
    motion.setAttribute('aria-label', paused ? 'Resume decorative motion' : 'Pause decorative motion');
  }
  motion.hidden = false;
  applyMotion();
  motion.addEventListener('click', () => { paused = !paused; applyMotion(); });
  reduced.addEventListener('change', event => { paused = event.matches; applyMotion(); });

  // A deterministic family of Lissajous curves; an illustration, not measured data.
  const trails = document.querySelector('.ribbon-trails');
  for (let layer = 0; layer < 28; layer += 1) {
    const curve = document.createElementNS(ns, 'polyline');
    const points = [];
    for (let step = 0; step <= 200; step += 1) {
      const t = (step / 200) * Math.PI * 2;
      const x = 300 + (212 - layer * .4) * Math.sin(t + layer * .017);
      const y = 300 + (170 - layer * .4) * Math.sin(2 * t + layer * .053);
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    curve.setAttribute('points', points.join(' '));
    curve.setAttribute('fill', 'none');
    curve.setAttribute('stroke', 'url(#ribbon-ink)');
    curve.setAttribute('stroke-width', '.7');
    curve.setAttribute('opacity', String(.2 + layer * .013));
    trails.append(curve);
  }

  const observations = [2, 3, 4, 4, 5, 5, 5, 6, 6, 7, 8, 17];
  const mean = observations.reduce((sum, value) => sum + value, 0) / observations.length;
  document.querySelector('#mean-value').textContent = String(mean);
  const counts = new Map();
  const pointGroup = document.querySelector('#sample-points');
  const points = observations.map((value, index) => {
    const stack = counts.get(value) || 0;
    counts.set(value, stack + 1);
    const x = 50 + value * 45;
    const y = 220 - stack * 43;
    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('class', `observation${value === 17 ? ' outlier' : ''}`);
    circle.setAttribute('r', '10');
    circle.setAttribute('cx', String(x));
    circle.setAttribute('cy', String(y));
    const label = document.createElementNS(ns, 'text');
    label.setAttribute('class', 'value-label');
    label.setAttribute('x', String(x));
    label.setAttribute('y', String(y - 18));
    label.textContent = String(value);
    pointGroup.append(circle, label);
    return {circle, label, x, y, index};
  });
  const views = {
    distribution: ['One average. Uneven observations.', 'Most values sit between 2 and 8; one reaches 17. Both facts matter, even though the mean is 6.'],
    mean: ['A correct number. An incomplete picture.', 'All twelve marks now sit at the mean, 6. The original values have not changed; this view simply hides their differences.'],
    context: ['And what are we actually measuring?', 'These invented points have no population, units or collection history. In real work, I would want that context before deciding what any of them mean.']
  };
  const buttons = [...document.querySelectorAll('[data-view]')];
  buttons.forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      points.forEach(({circle, label, x, y, index}) => {
        circle.setAttribute('cx', String(view === 'mean' ? 50 + mean * 45 : x));
        circle.setAttribute('cy', String(view === 'mean' ? 205 - index * 12 : y));
        label.style.opacity = view === 'mean' ? '0' : '1';
      });
      document.querySelector('#reading-title').textContent = views[view][0];
      document.querySelector('#reading-copy').textContent = views[view][1];
      document.querySelector('#chart-desc').textContent = view === 'mean'
        ? 'Twelve marks stacked at their shared mean of 6. Individual values are hidden in this summary view.'
        : 'Values 2, 3, 4, 4, 5, 5, 5, 6, 6, 7, 8 and 17. Mean 6. Invented data without real-world units.';
    });
  });
})();
