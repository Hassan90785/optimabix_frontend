import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = false;

  constructor() {
    // Initialize theme based on user preference or system settings
    let selectedTheme = localStorage.getItem('theme');
    if(!selectedTheme)
      selectedTheme = 'dark'
    this.isDarkMode = selectedTheme === 'dark' ;
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
