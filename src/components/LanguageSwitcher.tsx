import React from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, LanguageOption } from '@/src/lib/i18n';
import { Globe, Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'outline' | 'ghost' | 'default';
  showLabel?: boolean;
}

export function LanguageSwitcher({ className, variant = 'ghost', showLabel = true }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const currentLangCode = i18n.language ? i18n.language.split('-')[0] : 'en';
  const currentLang = LANGUAGES.find(l => l.code === currentLangCode) || LANGUAGES[0];

  const handleLanguageChange = (lang: LanguageOption) => {
    i18n.changeLanguage(lang.code);
    localStorage.setItem('i18nextLng', lang.code);
    toast.success(`Language switched to ${lang.name} (${lang.nativeName})`, {
      description: 'Interface labels updated for international team support.'
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button
          variant={variant}
          size="sm"
          className={`h-9 px-2.5 text-xs font-semibold gap-1.5 transition-colors border-0 hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`}
          title="Switch Language / 选择语言 / Mode langue"
        >
          <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-emoji mr-0.5">{currentLang.flag}</span>
          {showLabel && (
            <span className="hidden sm:inline-block font-medium text-slate-700 dark:text-slate-200">
              {currentLang.code.toUpperCase()}
            </span>
          )}
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 z-50">
        <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
          Select Language / 语言
        </div>
        {LANGUAGES.map(lang => {
          const isSelected = currentLangCode === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang)}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base font-emoji">{lang.flag}</span>
                <div className="flex flex-col">
                  <span>{lang.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{lang.nativeName}</span>
                </div>
              </div>
              {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
