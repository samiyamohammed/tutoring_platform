interface Theme {
  "color-scheme": string
  "--color-base-100": string
  "--color-base-200": string
  "--color-base-300": string
  "--color-base-content": string
  "--color-primary": string
  "--color-primary-content": string
  "--color-secondary": string
  "--color-secondary-content": string
  "--color-accent": string
  "--color-accent-content": string
  "--color-neutral": string
  "--color-neutral-content": string
  "--color-info": string
  "--color-info-content": string
  "--color-success": string
  "--color-success-content": string
  "--color-warning": string
  "--color-warning-content": string
  "--color-error": string
  "--color-error-content": string
  "--radius-selector": string
  "--radius-field": string
  "--radius-box": string
  "--size-selector": string
  "--size-field": string
  "--border": string
  "--depth": string
  "--noise": string
}


interface Themes {
  caramellatte: Theme
  halloween: Theme
  forest: Theme
  corporate: Theme
  sunset: Theme
  pastel: Theme
  winter: Theme
  nord: Theme
  retro: Theme
  silk: Theme
  lofi: Theme
  coffee: Theme
  aqua: Theme
  wireframe: Theme
  acid: Theme
  lemonade: Theme
  business: Theme
  abyss: Theme
  fantasy: Theme
  dark: Theme
  cmyk: Theme
  emerald: Theme
  dracula: Theme
  black: Theme
  night: Theme
  autumn: Theme
  cyberpunk: Theme
  bumblebee: Theme
  valentine: Theme
  cupcake: Theme
  dim: Theme
  garden: Theme
  light: Theme
  luxury: Theme
  synthwave: Theme
  [key: string]: Theme
}

declare const themes: Themes
export default themes