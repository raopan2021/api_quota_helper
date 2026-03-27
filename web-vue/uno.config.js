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
    colors: {
      primary:   '#1976D2',
      success:   '#4CAF50',
      warning:   '#FFC107',
      danger:    '#F44336',
      muted:     '#9E9E9E',
      accent:    '#AA3BFF',
    },
  },

  // shortcuts 不能包含 variant 前缀（如 dark:），variant 不会被处理
  // 正确做法：在组件中显式使用 dark: 前缀类，或依赖 CSS 变量
  shortcuts: {
    'btn': 'px-3 py-1 text-sm rounded-md border transition-colors cursor-pointer',
  },

  // CSS 变量方案：定义在 :root，dark mode 时覆盖
  preflights: [
    {
      getCSS: () => `
        :root {
          --color-primary: #1976D2;
          --color-success: #4CAF50;
          --color-warning: #FFC107;
          --color-danger: #F44336;
          --color-muted: #9E9E9E;
          --color-bg: #F5F5F5;
          --color-bg-card: #FFFFFF;
          --color-bg-card-dark: #2A2A2A;
          --color-border: #E5E4E7;
          --color-text: #333333;
          --color-text-muted: #888888;
          --color-progress-track: #EEEEEE;
          --color-gray-100: #F3F4F6;
          --color-gray-50: #FAFAFA;
          --color-gray-200: #E5E7EB;
          --color-gray-300: #D1D5DB;
          --color-gray-400: #9CA3AF;
          --color-gray-500: #6B7280;
          --color-gray-600: #4B5563;
          --color-gray-700: #374151;
          --color-gray-800: #1F2937;
          --color-gray-900: #111827;
          --color-btn-bg: var(--color-bg-card);
          --color-btn-hover-bg: var(--color-gray-200);
          --scrollbar-thumb: rgba(0,0,0,0.15);
          --scrollbar-thumb-hover: rgba(0,0,0,0.25);
        }

        .dark {
          --color-bg: #1A1A1A;
          --color-bg-card: #2A2A2A;
          --color-border: #444455;
          --color-text: #E0E0E0;
          --color-text-muted: #999999;
          --color-progress-track: #333333;
          --color-gray-50: #1a1a1a;
          --color-gray-100: #252535;
          --color-gray-200: #303045;
          --color-gray-300: #404060;
          --color-gray-400: #8888AA;
          --color-gray-500: #9999BB;
          --color-gray-600: #AAAACC;
          --color-gray-700: #555577;
          --color-gray-800: #1F2937;
          --color-gray-900: #111827;
          --color-btn-bg: var(--color-bg-card);
          --color-btn-hover-bg: #3a3a50;
          --scrollbar-thumb: rgba(255,255,255,0.15);
          --scrollbar-thumb-hover: rgba(255,255,255,0.25);
        }

        /* 全局样式 */
        body {
          background: var(--color-bg);
          color: var(--color-text);
          transition: background-color 0.2s, color 0.2s;
        }

        /* 通用按钮 */
        .btn {
          border-color: var(--color-border);
          background: var(--color-btn-bg);
          color: var(--color-text);
        }
        .btn:hover {
          filter: brightness(0.88);
        }
        .dark .btn:hover {
          filter: brightness(1.35);
        }
      `,
    },
  ],
})
