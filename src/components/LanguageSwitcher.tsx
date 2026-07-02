import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' }
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-9 w-9 border border-gray-200" />}>
        <Globe className="h-4 w-4 text-gray-700" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lng) => (
          <DropdownMenuItem
            key={lng.code}
            onClick={() => i18n.changeLanguage(lng.code)}
            className={i18n.language === lng.code ? 'font-bold bg-slate-100' : ''}
          >
            {lng.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
