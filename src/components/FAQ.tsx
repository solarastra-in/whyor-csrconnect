import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export interface FAQProps {
  items: FAQItem[];
  title?: string;
  description?: string;
}

export function FAQ({ items, title = "Frequently Asked Questions", description }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="text-lg text-slate-600">{description}</p>}
      </div>
      
      <div className="space-y-4">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className="border border-slate-200 rounded-lg bg-white overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                className="w-full flex items-center justify-between px-6 py-4 text-left focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-50"
                onClick={() => toggleItem(index)}
                aria-expanded={isOpen}
              >
                <span className="font-medium text-slate-900">{item.question}</span>
                <ChevronDown 
                  className={cn(
                    "h-5 w-5 text-slate-500 transition-transform duration-200", 
                    isOpen ? "rotate-180" : ""
                  )} 
                />
              </button>
              
              <div 
                className={cn(
                  "px-6 overflow-hidden transition-all duration-300 ease-in-out",
                  isOpen ? "max-h-96 pb-4 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="text-slate-600 leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
