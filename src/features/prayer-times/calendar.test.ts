import { compareMonths, monthGrid, monthOf, shiftMonth, weekdayLetters } from './calendar';

describe('calendar', () => {
  it('lays October 2026 out in weeks starting on Sunday', () => {
    const grid = monthGrid(2026, 9, 0);
    // 1 October 2026 is a Thursday.
    expect(grid[0]).toEqual([null, null, null, null, '2026-10-01', '2026-10-02', '2026-10-03']);
    expect(grid[grid.length - 1].filter(Boolean).pop()).toBe('2026-10-31');
    expect(grid.every((week) => week.length === 7)).toBe(true);
  });

  it('starts the week on Monday when asked', () => {
    const grid = monthGrid(2026, 9, 1);
    expect(grid[0]).toEqual([null, null, null, '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']);
  });

  it('holds every day of the month exactly once', () => {
    const days = monthGrid(2028, 1, 6).flat().filter(Boolean);
    expect(days).toHaveLength(29);
    expect(new Set(days).size).toBe(29);
  });

  it('rotates the weekday letters', () => {
    expect(weekdayLetters(0)).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
    expect(weekdayLetters(1)).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
    expect(weekdayLetters(6)).toEqual(['S', 'S', 'M', 'T', 'W', 'T', 'F']);
  });

  it('moves between months across year ends', () => {
    expect(shiftMonth({ year: 2026, monthIndex: 11 }, 1)).toEqual({ year: 2027, monthIndex: 0 });
    expect(shiftMonth({ year: 2026, monthIndex: 0 }, -1)).toEqual({ year: 2025, monthIndex: 11 });
    expect(monthOf('2026-10-26')).toEqual({ year: 2026, monthIndex: 9 });
    expect(compareMonths({ year: 2026, monthIndex: 9 }, { year: 2026, monthIndex: 10 })).toBeLessThan(0);
  });
});
