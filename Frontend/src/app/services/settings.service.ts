import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light' | 'custom';
export type Language = 'en' | 'ta' | 'hi';

const TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Home': { en: 'Home', ta: 'முகப்பு', hi: 'होम' },
  'About': { en: 'About', ta: 'பற்றி', hi: 'हमारे बारे में' },
  'About Us': { en: 'About Us', ta: 'எங்களைப் பற்றி', hi: 'हमारे बारे में' },
  'Services': { en: 'Services', ta: 'சேவைகள்', hi: 'सेवाएं' },
  'Services & Products': { en: 'Services & Products', ta: 'சேவைகள் & தயாரிப்புகள்', hi: 'सेवाएं और उत्पाद' },
  'Team': { en: 'Team', ta: 'குழு', hi: 'टीम' },
  'Our Team': { en: 'Our Team', ta: 'எங்கள் குழு', hi: 'हमारी टीम' },
  'Contact': { en: 'Contact', ta: 'தொடர்பு', hi: 'संपर्क' },
  'Contact Us': { en: 'Contact Us', ta: 'எங்களை தொடர்பு கொள்ளுங்கள்', hi: 'हमसे संपर्क करें' },
  'Login': { en: 'Login', ta: 'உள்நுழைய', hi: 'लॉगिन' },
  'Logout': { en: 'Logout', ta: 'வெளியேறு', hi: 'लॉगआउट' },
  'Settings': { en: 'Settings', ta: 'அமைப்புகள்', hi: 'सेटिंग्स' },
  'Theme': { en: 'Theme', ta: 'தீம்', hi: 'थीम' },
  'Font Style': { en: 'Font Style', ta: 'எழுத்து நடை', hi: 'फ़ॉन्ट शैली' },
  'Font Size': { en: 'Font Size', ta: 'எழுத்து அளவு', hi: 'फ़ॉन्ट आकार' },
  'Color': { en: 'Color', ta: 'நிறம்', hi: 'रंग' },
  'Language': { en: 'Language', ta: 'மொழி', hi: 'भाषा' },
  'Light': { en: 'Light', ta: 'ஒளி', hi: 'लाइट' },
  'Dark': { en: 'Dark', ta: 'இருள்', hi: 'डार्क' },
  'Custom': { en: 'Custom', ta: 'தனிப்பயன்', hi: 'कस्टम' },
  'Shop Our Products': { en: 'Shop Our Products', ta: 'எங்கள் தயாரிப்புகளை வாங்குங்கள்', hi: 'हमारे उत्पाद खरीदें' },
  'Sign In': { en: 'Sign In', ta: 'உள்நுழைய', hi: 'साइन इन' },
  'Email Address': { en: 'Email Address', ta: 'மின்னஞ்சல் முகவரி', hi: 'ईमेल पता' },
  'Password': { en: 'Password', ta: 'கடவுச்சொல்', hi: 'पासवर्ड' },
  'Welcome Back': { en: 'Welcome Back', ta: 'மீண்டும் வரவேற்கிறோம்', hi: 'वापसी पर स्वागत है' },
  'Sign in to manage your website': { en: 'Sign in to manage your website', ta: 'உங்கள் இணையதளத்தை நிர்வகிக்க உள்நுழையவும்', hi: 'अपनी वेबसाइट प्रबंधित करने के लिए साइन इन करें' },
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  theme = signal<ThemeMode>('dark');
  fontFamily = signal('Outfit');
  fontSize = signal(16);
  primaryColor = signal('#6366f1');
  language = signal<Language>('en');

  private readonly STORAGE_KEY = 's3app_settings';

  constructor() {
    this.loadSettings();
    this.applyAllSettings();
  }

  translate(key: string): string {
    const lang = this.language();
    return TRANSLATIONS[key]?.[lang] ?? key;
  }

  setTheme(theme: ThemeMode) {
    this.theme.set(theme);
    this.applyTheme();
    this.saveSettings();
  }

  setFontFamily(font: string) {
    this.fontFamily.set(font);
    this.applyFont();
    this.saveSettings();
  }

  setFontSize(size: number) {
    this.fontSize.set(size);
    this.applyFont();
    this.saveSettings();
  }

  setPrimaryColor(color: string) {
    this.primaryColor.set(color);
    this.applyColor();
    this.saveSettings();
  }

  setLanguage(lang: Language) {
    this.language.set(lang);
    this.saveSettings();
  }

  private applyAllSettings() {
    this.applyTheme();
    this.applyFont();
    this.applyColor();
  }

  private applyTheme() {
    const body = document.body;
    body.classList.remove('theme-dark', 'theme-light', 'theme-custom');
    body.classList.add(`theme-${this.theme()}`);
  }

  private applyFont() {
    document.documentElement.style.setProperty('--app-font-family', `'${this.fontFamily()}', sans-serif`);
    document.documentElement.style.setProperty('--app-font-size', `${this.fontSize()}px`);
  }

  private applyColor() {
    document.documentElement.style.setProperty('--primary', this.primaryColor());
    // Generate a slightly darker hover variant
    document.documentElement.style.setProperty('--primary-hover', this.darkenColor(this.primaryColor(), 15));
  }

  private darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
    const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(2.55 * percent));
    const b = Math.max(0, (num & 0x0000ff) - Math.round(2.55 * percent));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  private saveSettings() {
    const settings = {
      theme: this.theme(),
      fontFamily: this.fontFamily(),
      fontSize: this.fontSize(),
      primaryColor: this.primaryColor(),
      language: this.language(),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }

  private loadSettings() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.theme) this.theme.set(s.theme);
        if (s.fontFamily) this.fontFamily.set(s.fontFamily);
        if (s.fontSize) this.fontSize.set(s.fontSize);
        if (s.primaryColor) this.primaryColor.set(s.primaryColor);
        if (s.language) this.language.set(s.language);
      }
    } catch (e) { }
  }
}
