import { defineClientConfig } from 'vuepress/client'
import { onMounted } from 'vue'
import './theme/styles/custom.css'

function mountEgg() {
  if (typeof document === 'undefined') return
  if (document.querySelector('.site-egg')) return

  const el = document.createElement('div')
  el.className = 'site-egg'
  el.setAttribute('role', 'status')
  el.textContent = 'dev mode · build for clarity'
  document.body.appendChild(el)

  const show = () => {
    el.classList.add('is-on')
    window.setTimeout(() => el.classList.remove('is-on'), 3200)
  }

  // Konami: ↑↑↓↓←→←→BA
  const seq = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a',
  ]
  let i = 0
  window.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
    if (key === seq[i]) {
      i += 1
      if (i === seq.length) {
        i = 0
        show()
      }
    } else {
      i = key === seq[0] ? 1 : 0
    }
  })

  // Quiet console signature for engineers
  // eslint-disable-next-line no-console
  console.info(
    '%c橦栖云%c engineering notes — type the Konami code for a nod.',
    'font-family:serif;font-size:14px;font-weight:700;color:#0F4C5C',
    'font-family:sans-serif;font-size:12px;color:#4a5d68',
  )

  ;(window as unknown as { __siteEgg?: () => void }).__siteEgg = show
}

export default defineClientConfig({
  enhance({ app }) {
    // no demo Hello World component
  },
  setup() {
    onMounted(() => {
      mountEgg()
    })
  },
})
