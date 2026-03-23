import { defineConfig, presetWind, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetWind(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
  ],
  theme: {
    breakpoints: {
      sm: '320px',
      md: '768px',
      lg: '1024px',
    },
  },
})
