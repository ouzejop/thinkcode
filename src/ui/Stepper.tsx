import React from 'react';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  totalSteps,
  labels,
  className = '',
}) => {
  return (
    <nav aria-label="Onboarding Progress" className={`grid gap-2 ${className}`}>
      <div className="flex items-center justify-between text-sm font-bold">
        <span className="t-label">
          Step {currentStep} of {totalSteps}
          {labels && labels[currentStep - 1] && (
            <span className="text-ink"> · {labels[currentStep - 1]}</span>
          )}
        </span>
        <span className="text-xs text-soft">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuetext={`Step ${currentStep} of ${totalSteps}`}
        className="flex h-2 w-full gap-1 overflow-hidden rounded bg-sunken p-0.5"
      >
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isDone = stepNum <= currentStep;
          return (
            <div
              key={stepNum}
              className={`h-full flex-1 rounded-sm transition-all duration-200 ${
                isDone ? 'bg-primary' : 'bg-transparent'
              }`}
            />
          );
        })}
      </div>
    </nav>
  );
};
