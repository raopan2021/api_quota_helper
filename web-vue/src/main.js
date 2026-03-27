import { createApp } from 'vue'
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'
import App from './App.vue'
import { useSettings } from './stores/settings.js'

// 确保 dark class 在 Vue app 挂载前就同步到 html 标签
const { settings } = useSettings()
if (settings.value.darkMode) {
  document.documentElement.classList.add('dark')
}

createApp(App).mount('#app')
