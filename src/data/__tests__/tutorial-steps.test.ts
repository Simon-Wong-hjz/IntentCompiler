import { describe, it, expect } from 'vitest';
import { tutorialSteps } from '../tutorial-steps';

describe('tutorialSteps', () => {
  it('has exactly 10 steps', () => {
    expect(tutorialSteps).toHaveLength(10);
  });

  it('every step has required fields', () => {
    for (const step of tutorialSteps) {
      expect(step.targetSelector).toBeTruthy();
      expect(step.title.zh).toBeTruthy();
      expect(step.title.en).toBeTruthy();
      expect(step.description.zh).toBeTruthy();
      expect(step.description.en).toBeTruthy();
      expect(['top', 'bottom', 'left', 'right']).toContain(step.placement);
    }
  });

  it('uses data-tutorial selectors', () => {
    for (const step of tutorialSteps) {
      expect(step.targetSelector).toMatch(/\[data-tutorial=/);
    }
  });
});
