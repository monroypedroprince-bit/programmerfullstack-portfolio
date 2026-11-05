const sounds = [
  'sonidos/magiaz-harpa-402234.mp3',
  'sonidos/universfield-level-up-02-199574.mp3',
  'sonidos/universfield-level-up-07-383747.mp3',
  'sonidos/universfield-new-notification-026-380249.mp3',
  'sonidos/universfield-new-notification-033-480571.mp3',
  'sonidos/universfield-new-notification-09-352705.mp3',
]

const CHECK_ALARM = 'check-ip'

const safeSoundFile = (raw) => {
  const f = (raw || '').toString()
  return sounds.includes(f) ? f : sounds[0]
}

const fetchJson = async (url, timeoutMs = 6000) => {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { cache: 'no-store', signal: ctl.signal })
    if (!res.ok) return null
    return await res.json().catch(() => null)
  } catch (_) {
    return null
  } finally {
    clearTimeout(t)
  }
}

const getIp = async () => {
  const ts = Date.now()
  const a = await fetchJson(`https://api.ipify.org?format=json&ts=${ts}`)
  if (a && a.ip) return String(a.ip)
  const b = await fetchJson(`https://ifconfig.me/all.json?ts=${ts}`)
  if (b && b.ip_addr) return String(b.ip_addr)
  return ''
}

const ensureOffscreen = async () => {
  if (chrome.offscreen && typeof chrome.offscreen.hasDocument === 'function') {
    try {
      const has = await chrome.offscreen.hasDocument()
      if (has) return
    } catch (_) {}
  }
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Play the IP change alert sound',
    })
  } catch (_) {}
}

const playSound = async (soundFile) => {
  await ensureOffscreen()
  try {
    await chrome.runtime.sendMessage({ type: 'play', soundFile })
  } catch (_) {}
}

const notifyChange = async ({ ip, prevIp, soundEnabled, soundFile }) => {
  const title = 'IP Monitor'
  const message = prevIp ? `Your IP changed: ${prevIp} → ${ip}` : `Your IP is now: ${ip}`
  try {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'ip-monitor-icon.png',
      title,
      message,
      priority: 2,
    })
  } catch (_) {}
  if (soundEnabled) await playSound(soundFile)
}

const checkNow = async () => {
  const st = await chrome.storage.local.get([
    'monitorOn',
    'soundEnabled',
    'soundFile',
    'lastIp',
    'changes',
    'lastChangeAt',
    'history',
  ])

  if (st.monitorOn !== true) return

  const ip = await getIp()
  if (!ip) return

  const prev = st.lastIp ? String(st.lastIp) : ''
  if (prev && ip === prev) return

  const changes = Number(st.changes || 0) + (prev ? 1 : 0)
  const at = Date.now()
  const history = Array.isArray(st.history) ? st.history.slice(0, 80) : []
  history.unshift({ ip, at })

  const soundFile = safeSoundFile(st.soundFile)
  const soundEnabled = st.soundEnabled === true

  await chrome.storage.local.set({
    lastIp: ip,
    changes,
    lastChangeAt: prev ? at : st.lastChangeAt || at,
    history,
    soundFile,
  })

  if (prev) await notifyChange({ ip, prevIp: prev, soundEnabled, soundFile })
}

chrome.runtime.onInstalled.addListener(async () => {
  const cur = await chrome.storage.local.get(['monitorOn', 'soundEnabled', 'soundFile'])
  const monitorOn = cur.monitorOn === true
  const soundEnabled = cur.soundEnabled === true
  const soundFile = safeSoundFile(cur.soundFile)

  await chrome.storage.local.set({ monitorOn, soundEnabled, soundFile })
  await chrome.alarms.create(CHECK_ALARM, { periodInMinutes: 1 })
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm && alarm.name === CHECK_ALARM) await checkNow()
})

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  ;(async () => {
    if (!msg || typeof msg !== 'object') return
    if (msg.type === 'toggleMonitor') {
      const st = await chrome.storage.local.get(['monitorOn'])
      const next = st.monitorOn !== true
      await chrome.storage.local.set({ monitorOn: next })
      if (next) await checkNow()
      sendResponse({ ok: true })
      return
    }
    if (msg.type === 'toggleSound') {
      const st = await chrome.storage.local.get(['soundEnabled', 'soundFile'])
      const next = st.soundEnabled !== true
      const soundFile = safeSoundFile(st.soundFile)
      await chrome.storage.local.set({ soundEnabled: next, soundFile })
      if (next) await playSound(soundFile)
      sendResponse({ ok: true })
      return
    }
    if (msg.type === 'testSound') {
      const st = await chrome.storage.local.get(['soundFile'])
      const soundFile = safeSoundFile(st.soundFile)
      await playSound(soundFile)
      sendResponse({ ok: true })
      return
    }
    if (msg.type === 'setSoundFile') {
      const soundFile = safeSoundFile(msg.soundFile)
      await chrome.storage.local.set({ soundFile })
      sendResponse({ ok: true })
      return
    }
    if (msg.type === 'checkNow') {
      await checkNow()
      sendResponse({ ok: true })
      return
    }
  })()
  return true
})

