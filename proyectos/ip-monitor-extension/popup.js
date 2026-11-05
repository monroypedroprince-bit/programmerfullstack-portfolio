const sounds = [
  { label: 'Harpa', file: 'sonidos/magiaz-harpa-402234.mp3' },
  { label: 'Level up 02', file: 'sonidos/universfield-level-up-02-199574.mp3' },
  { label: 'Level up 07', file: 'sonidos/universfield-level-up-07-383747.mp3' },
  { label: 'Notificación 026', file: 'sonidos/universfield-new-notification-026-380249.mp3' },
  { label: 'Notificación 033', file: 'sonidos/universfield-new-notification-033-480571.mp3' },
  { label: 'Notificación 09', file: 'sonidos/universfield-new-notification-09-352705.mp3' },
]

const el = (id) => document.getElementById(id)

const dot = el('dot')
const state = el('state')
const ip = el('ip')
const changes = el('changes')
const last = el('last')
const btnToggle = el('btnToggle')
const btnSound = el('btnSound')
const btnCheck = el('btnCheck')
const soundMenuWrap = el('soundMenuWrap')
const soundMenuBtn = el('soundMenuBtn')
const soundMenuBtnText = el('soundMenuBtnText')
const soundMenu = el('soundMenu')

const setDot = (on) => {
  dot.style.background = on ? 'var(--good)' : 'var(--warn)'
  dot.style.boxShadow = on
    ? '0 0 0 3px rgba(34,197,94,.18)'
    : '0 0 0 3px rgba(245,158,11,.18)'
}

const hydrateSounds = async () => {
  const cfg = await chrome.storage.local.get(['soundFile'])
  const cur = sounds.some((s) => s.file === cfg.soundFile) ? cfg.soundFile : sounds[0].file

  soundMenu.innerHTML = ''
  const top = document.createElement('div')
  top.className = 'soundMenuTop'
  top.innerHTML =
    '<div class="soundMenuTitle">Sounds</div><div class="soundMenuHint">Preview when selected</div>'
  soundMenu.appendChild(top)

  sounds.forEach((s) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = `soundOption ${s.file === cur ? 'isActive' : ''}`.trim()
    btn.dataset.file = s.file
    btn.textContent = s.label
    btn.addEventListener('click', async (e) => {
      e.preventDefault()
      await chrome.storage.local.set({ soundFile: s.file })
      await chrome.runtime.sendMessage({ type: 'setSoundFile', soundFile: s.file })
      Array.from(soundMenu.querySelectorAll('.soundOption')).forEach((x) => x.classList.remove('isActive'))
      btn.classList.add('isActive')
      soundMenuBtnText.textContent = `Sound: ${s.label}`
      await chrome.runtime.sendMessage({ type: 'testSound' })
    })
    soundMenu.appendChild(btn)
  })

  const currentLabel = sounds.find((s) => s.file === cur)?.label || 'Sound'
  soundMenuBtnText.textContent = `Sound: ${currentLabel}`
}

const refresh = async () => {
  const st = await chrome.storage.local.get([
    'monitorOn',
    'soundEnabled',
    'soundFile',
    'lastIp',
    'changes',
    'lastChangeAt',
  ])

  const mon = st.monitorOn === true
  const snd = st.soundEnabled === true

  setDot(mon)
  state.textContent = mon ? 'Monitoring' : 'Paused'
  btnToggle.textContent = mon ? 'Pause' : 'Start'

  btnSound.textContent = snd ? 'Sound: on' : 'Sound: off'
  btnSound.className = snd ? 'good' : ''

  ip.textContent = st.lastIp ? String(st.lastIp) : '—'
  changes.textContent = String(Number(st.changes || 0))
  last.textContent = st.lastChangeAt ? new Date(Number(st.lastChangeAt)).toLocaleString() : '—'

  const cur = sounds.some((s) => s.file === st.soundFile) ? st.soundFile : sounds[0].file
  const currentLabel = sounds.find((s) => s.file === cur)?.label || 'Sound'
  if (soundMenuBtnText.textContent !== `Sound: ${currentLabel}`) soundMenuBtnText.textContent = `Sound: ${currentLabel}`
}

const setSoundMenuOpen = (open) => {
  if (!soundMenu || !soundMenuBtn) return
  if (open) {
    soundMenu.classList.remove('isHidden')
    soundMenuBtn.setAttribute('aria-expanded', 'true')
  } else {
    soundMenu.classList.add('isHidden')
    soundMenuBtn.setAttribute('aria-expanded', 'false')
  }
}
soundMenuBtn.addEventListener('click', (e) => {
  e.preventDefault()
  e.stopPropagation()
  const open = soundMenu.classList.contains('isHidden')
  setSoundMenuOpen(open)
})
soundMenu.addEventListener('click', (e) => e.stopPropagation())
document.addEventListener('mousedown', (e) => {
  if (!soundMenuWrap || !soundMenu) return
  if (soundMenu.classList.contains('isHidden')) return
  if (e && e.target && soundMenuWrap.contains(e.target)) return
  setSoundMenuOpen(false)
})
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setSoundMenuOpen(false)
})

btnToggle.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'toggleMonitor' })
  await refresh()
})

btnSound.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'toggleSound' })
  await refresh()
})

btnCheck.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'checkNow' })
  await refresh()
})

hydrateSounds().then(refresh)
