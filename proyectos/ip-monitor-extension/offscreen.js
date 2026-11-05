const play = async ({ soundFile }) => {
  const file = (soundFile || '').toString() || 'sonidos/magiaz-harpa-402234.mp3'
  const url = chrome.runtime.getURL(file)
  const a = new Audio(url)
  a.volume = 1
  try {
    await a.play()
  } catch (_) {}
}

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || typeof msg !== 'object') return
  if (msg.type === 'play') play(msg)
})

