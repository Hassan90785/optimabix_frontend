import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = false;

  constructor() {
    // Initialize theme based on user preference or system settings
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode = localStorage.getItem('theme') === 'dark' || prefersDark;
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    const rootElement = document.documentElement;
    if (this.isDarkMode) {
      rootElement.classList.add('app-dark');
    } else {
      rootElement.classList.remove('app-dark');
    }
  }

  isDarkModeEnabled(): boolean {
    return this.isDarkMode;
  }
}
