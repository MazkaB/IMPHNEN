/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

declare module 'next-themes' {
  export interface ThemeProviderProps {
    children?: React.ReactNode;
    attribute?: string | string[];
    defaultTheme?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
    storageKey?: string;
    themes?: string[];
    forcedTheme?: string;
    enableColorScheme?: boolean;
    nonce?: string;
  }

  export const ThemeProvider: React.FC<ThemeProviderProps>;
  export function useTheme(): {
    theme: string | undefined;
    setTheme: (theme: string) => void;
    resolvedTheme: string | undefined;
    themes: string[];
    systemTheme: string | undefined;
  };
}
