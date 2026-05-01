'use client';

export default function FormStepper({ steps = [], currentStep = 1, className = '' }) {
  return (
    <div className={`flex items-center gap-1 mb-10 ${className}`.trim()}>
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;

        return (
          <div key={label} className="flex-1 flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isActive
                    ? 'bg-[var(--primary-color)] text-white'
                    : 'bg-stone-200 text-stone-500'
              }`}
            >
              {isCompleted ? (
                <span className="material-symbols-outlined text-sm">check</span>
              ) : (
                stepNumber
              )}
            </div>
            <span
              className={`text-xs ${isActive ? 'text-[var(--primary-color)] font-bold' : 'text-stone-500'}`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
