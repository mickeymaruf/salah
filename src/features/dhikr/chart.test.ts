import { chartScale, dayX, formatThousands, niceStep, smoothPath, sparklinePoints, valueY } from './chart';

describe('smoothPath', () => {
  it('is empty for no points and a move for one', () => {
    expect(smoothPath([])).toBe('');
    expect(smoothPath([{ x: 1, y: 2 }])).toBe('M 1 2');
  });

  it('starts at the first point, ends at the last, with one curve per gap', () => {
    const path = smoothPath([{ x: 0, y: 10 }, { x: 10, y: 20 }, { x: 20, y: 5 }]);
    expect(path.startsWith('M 0 10')).toBe(true);
    expect(path.endsWith('20 5')).toBe(true);
    expect(path.match(/C/g)).toHaveLength(2);
  });

  it('never overshoots a spike or a drop', () => {
    const points = [0, 0, 200, 0, 0, 150, 0].map((value, i) => ({ x: i * 11, y: 120 - value * 0.5 }));
    const numbers = smoothPath(points).replace(/[MC]/g, '').trim().split(/\s+/).map(Number);
    const ys = numbers.filter((_, i) => i % 2 === 1);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(Math.min(...points.map((p) => p.y)));
    expect(Math.max(...ys)).toBeLessThanOrEqual(Math.max(...points.map((p) => p.y)));
  });
});

describe('scale', () => {
  it('rounds the step up to 1, 2 or 5 times a power of ten', () => {
    expect([niceStep(0), niceStep(0.3), niceStep(1), niceStep(1.1), niceStep(3), niceStep(60), niceStep(100), niceStep(101)]).toEqual([1, 0.5, 1, 2, 5, 100, 100, 200]);
  });

  it('puts the top at the highest day plus 20% and the lines on round numbers', () => {
    const scale = chartScale([120, 200, null, 60]);
    expect(scale.max).toBeCloseTo(240);
    expect(scale.ticks).toEqual([0, 100, 200]);
  });

  it('uses a default scale when nothing was counted', () => {
    expect(chartScale([0, 0, null])).toEqual({ max: 100, ticks: [0, 50, 100] });
    expect(chartScale([])).toEqual({ max: 100, ticks: [0, 50, 100] });
  });

  it('maps a value to a height from the bottom of the plot', () => {
    expect(valueY(0, 240, 408, 120)).toBe(528);
    expect(valueY(240, 240, 408, 120)).toBe(408);
    expect(valueY(120, 240, 408, 120)).toBe(468);
    expect(valueY(999, 240, 408, 120)).toBe(408);
  });

  it('spaces days evenly across the width, so 31 days are about 11 px apart in 330 px', () => {
    expect(dayX(0, 31, 30, 330)).toBe(30);
    expect(dayX(30, 31, 30, 330)).toBe(360);
    expect(dayX(1, 31, 30, 330) - dayX(0, 31, 30, 330)).toBeCloseTo(11);
    expect(dayX(0, 1, 30, 330)).toBe(195);
  });
});

describe('formatThousands', () => {
  it('groups by thousands', () => {
    expect([0, 999, 1000, 12480, 1234567].map(formatThousands)).toEqual(['0', '999', '1,000', '12,480', '1,234,567']);
  });
});

describe('sparklinePoints', () => {
  it('runs left to right with the highest day on top and today on the right', () => {
    const points = sparklinePoints([0, 100, 50], 4, 120, 4, 36);
    expect(points[0]).toEqual({ x: 4, y: 40 });
    expect(points[1]).toEqual({ x: 64, y: 4 });
    expect(points[2].x).toBe(124);
  });

  it('draws a flat run at mid height', () => {
    expect(sparklinePoints([5, 5, 5], 0, 120, 4, 36).map((p) => p.y)).toEqual([22, 22, 22]);
  });
});
