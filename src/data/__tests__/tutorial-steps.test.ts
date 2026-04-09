import { describe, it, expect } from 'vitest';
import { tutorialSteps } from '../tutorial-steps';

describe('tutorialSteps', () => {
  it('has exactly 12 steps', () => {
    expect(tutorialSteps).toHaveLength(12);
  });

  it('every step has required fields', () => {
    for (const step of tutorialSteps) {
      expect(step.title.zh).toBeTruthy();
      expect(step.title.en).toBeTruthy();
      expect(step.description.zh).toBeTruthy();
      expect(step.description.en).toBeTruthy();
      expect(['top', 'bottom', 'left', 'right', 'center']).toContain(step.placement);
    }
  });

  it('uses data-tutorial selectors for targeted steps', () => {
    const targetedSteps = tutorialSteps.filter((s) => s.targetSelector);
    for (const step of targetedSteps) {
      expect(step.targetSelector).toMatch(/\[data-tutorial=/);
    }
  });

  it('first step is a center-mode greeting', () => {
    const greeting = tutorialSteps[0];
    expect(greeting.targetSelector).toBe('');
    expect(greeting.placement).toBe('center');
  });
});
