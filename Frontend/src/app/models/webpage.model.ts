export interface TextOverlay {
  text: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  fontStyle: string;
}

export interface SectionData {
  id?: string;
  title: string;
  background: {
    url: string;
    filter: string;
    animation: string;
  };
  overlays: TextOverlay[];
}

export const FONT_FAMILIES = [
  'Inter', 'Roboto', 'Outfit', 'Playfair Display', 'Montserrat', 'Open Sans'
];

export const BG_FILTERS = [
  { label: 'None', value: 'none' },
  { label: 'Blur', value: 'blur(5px)' },
  { label: 'Grayscale', value: 'grayscale(100%)' },
  { label: 'Sepia', value: 'sepia(100%)' },
  { label: 'Brightness', value: 'brightness(0.7)' },
  { label: 'Darken', value: 'brightness(0.5)' }
];

export const BG_ANIMATIONS = [
  { label: 'None', value: 'none' },
  { label: 'Fade In', value: 'fade-in' },
  { label: 'Zoom In', value: 'zoom-in' },
  { label: 'Parallax Scroll', value: 'parallax' },
  { label: 'Slide Up', value: 'slide-up' }
];
