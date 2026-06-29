import React from 'react';
import { User, Calendar, MapPin, Palette, Utensils, CreditCard, Eye, CheckCircle2 } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
}

const steps = [
  { id: 1, label: 'Client Info', icon: User },
  { id: 2, label: 'Event Details', icon: Calendar },
  { id: 3, label: 'Venue', icon: MapPin },
  { id: 4, label: 'Decor', icon: Palette },
  { id: 5, label: 'Services', icon: Utensils },
  { id: 6, label: 'Pricing', icon: CreditCard },
  { id: 7, label: 'Preview', icon: Eye },
];

const WizardProgress = ({ currentStep }: WizardProgressProps) => {
  return (
    <div className="w-full max-w-[900px] mx-auto py-7 px-4 overflow-x-auto">
      <div className="flex items-start justify-between min-w-[860px]">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isPastOrActive = currentStep >= step.id;
          
          return (
            <div key={step.id} className="flex flex-1 items-start last:flex-none">
              <div className="flex w-[104px] shrink-0 flex-col items-center text-center">
                <div 
                  className={`h-14 w-14 rounded-full border-4 border-white flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-[#B3262E] text-white shadow-[0_10px_24px_rgba(179,38,46,0.24)]' 
                      : isCompleted 
                        ? 'bg-emerald-500 text-white shadow-[0_8px_18px_rgba(16,185,129,0.18)]'
                        : 'bg-white text-gray-400 ring-1 ring-gray-200'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                
                <span className={`mt-3 text-[13px] font-bold leading-tight transition-colors ${
                  isActive 
                    ? 'text-[#B3262E]' 
                    : isCompleted 
                      ? 'text-emerald-600' 
                      : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
                {isActive && (
                  <span className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#B3262E]">
                    Current
                  </span>
                )}
              </div>

              {index < steps.length - 1 && (
                <div className="mt-7 h-[2px] min-w-8 flex-1 rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isPastOrActive && currentStep > step.id ? 'w-full bg-[#B3262E]' : 'w-0 bg-[#B3262E]'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WizardProgress;


