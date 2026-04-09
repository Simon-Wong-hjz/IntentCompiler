import { useState, useEffect, useCallback } from 'react';
import { tutorialSteps } from '@/data/tutorial-steps';
import { SpotlightOverlay } from './SpotlightOverlay';
import { TutorialTooltip } from './TutorialTooltip';

interface TutorialOverlayProps {
  active: boolean;
  onComplete: () => void;
}

export function TutorialOverlay({ active, onComplete }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Reset step when tutorial starts
  const [prevActive, setPrevActive] = useState(false);
  if (active && !prevActive) {
    setStep(0);
  }
  if (prevActive !== active) {
    setPrevActive(active);
  }

  // Find and track the target element for the current step.
  // Auto-skip steps whose target is not in the DOM (e.g., intent-field
  // before a task type is selected).
  useEffect(() => {
    if (!active) return;

    const selector = tutorialSteps[step]?.targetSelector;
    if (!selector) return;

    const el = document.querySelector(selector);
    if (!el) {
      // Target missing — skip forward (or complete if at the end)
      if (step >= tutorialSteps.length - 1) {
        onComplete();
      } else {
        setStep((s) => s + 1);
      }
      return;
    }

    const updateRect = () => {
      setTargetRect(el.getBoundingClientRect());
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [active, step, onComplete]);

  const handleNext = useCallback(() => {
    if (step >= tutorialSteps.length - 1) {
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  }, [step, onComplete]);

  const handlePrev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  // Escape key dismisses tutorial (consistent with modal pattern)
  useEffect(() => {
    if (!active) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onComplete();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [active, onComplete]);

  if (!active) return null;

  const currentStep = tutorialSteps[step];
  if (!currentStep || !targetRect) return null;

  // Compute visible step index/total so the counter skips missing steps
  const visibleSteps = tutorialSteps.filter((s) =>
    document.querySelector(s.targetSelector),
  );
  const visibleIndex = visibleSteps.indexOf(currentStep);

  return (
    <>
      <SpotlightOverlay targetRect={targetRect} />
      {/* Clickable backdrop to block interaction outside the tooltip */}
      <div className="fixed inset-0 z-[60]" />
      <TutorialTooltip
        title={currentStep.title}
        description={currentStep.description}
        current={visibleIndex >= 0 ? visibleIndex : step}
        total={visibleSteps.length || tutorialSteps.length}
        placement={currentStep.placement}
        targetRect={targetRect}
        onPrev={handlePrev}
        onNext={handleNext}
        onSkip={onComplete}
      />
    </>
  );
}
