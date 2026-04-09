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

  // Find, scroll to, and track the target element for the current step.
  useEffect(() => {
    if (!active) return;

    const currentStepDef = tutorialSteps[step];
    if (!currentStepDef) return;

    // Center mode (greeting): no target element needed — targetRect unused
    if (!currentStepDef.targetSelector) return;

    const el = document.querySelector(currentStepDef.targetSelector);
    if (!el) {
      // Safety: skip if target somehow missing
      if (step < tutorialSteps.length - 1) setStep((s) => s + 1);
      else onComplete();
      return;
    }

    // Scroll target into view so it's visible under the spotlight
    el.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });

    const updateRect = () => {
      setTargetRect(el.getBoundingClientRect());
    };

    // Measure immediately, then re-measure after scroll animation settles
    updateRect();
    const scrollTimer = setTimeout(updateRect, 350);

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      clearTimeout(scrollTimer);
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
  if (!currentStep) return null;

  const isCenterMode = !currentStep.targetSelector;

  return (
    <>
      {isCenterMode || !targetRect ? (
        <div className="fixed inset-0 z-[60] bg-black/45" />
      ) : (
        <SpotlightOverlay targetRect={targetRect} />
      )}
      {/* Clickable backdrop to block interaction outside the tooltip */}
      <div className="fixed inset-0 z-[60]" />
      <TutorialTooltip
        title={currentStep.title}
        description={currentStep.description}
        current={step}
        total={tutorialSteps.length}
        placement={currentStep.placement}
        targetRect={targetRect}
        onPrev={handlePrev}
        onNext={handleNext}
        onSkip={onComplete}
      />
    </>
  );
}
