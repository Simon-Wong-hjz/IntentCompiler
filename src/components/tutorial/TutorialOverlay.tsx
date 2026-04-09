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

  // Find and track the target element for the current step
  useEffect(() => {
    if (!active) return;

    const updateRect = () => {
      const selector = tutorialSteps[step]?.targetSelector;
      if (!selector) return;
      const el = document.querySelector(selector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [active, step]);

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

  if (!active) return null;

  const currentStep = tutorialSteps[step];
  if (!currentStep || !targetRect) return null;

  return (
    <>
      <SpotlightOverlay targetRect={targetRect} />
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
