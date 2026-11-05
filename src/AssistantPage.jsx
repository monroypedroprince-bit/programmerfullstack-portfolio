import { useEffect, useRef, useState } from "react";
import {
  ArrowDown, ArrowUp, Bot, Check, ChevronDown, CircleHelp, Copy,
  Cpu, History, KeyRound, LogOut, Menu, MessageSquare, MoreHorizontal,
  Plus, RotateCcw, Send, Settings2, ShieldCheck, Sparkles, ThumbsDown,
  ThumbsUp, UserRound, X, Zap
} from "lucide-react";
import "./assistant-page.css";

const suggestions = [
  { title: "Programación", text: "Explícame una idea para empezar un proyecto con React." },
  { title: "Diseño", text: "¿Cómo puedo mejorar la jerarquía visual de una página web?" },
  { title: "Tecnología", text: "¿Qué debo revisar al elegir componentes para una PC?" }
];

const sampleChat = [
  { id: "sample-1", role: "user", content: "¿Qué necesito para crear una página sencilla con React?" },
  { id: "sample-2", role: "assistant", content: "Empieza con un componente que muestre una sección clara, como una tarjeta o un encabezado. Después añade estilos y prueba cómo se adapta a pantallas pequeñas. Si me cuentas qué quieres construir, te propongo una estructura.", demo: true }
];

function AssistantPage() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [modelStatus, setModelStatus] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panel, setPanel] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [feedback, setFeedback] = useState({});
  const endRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const oldTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const oldDescription = description?.content;
    document.title = "Terciolpelo AI | Programmer Full Stack";
    if (description) description.content = "Terciolpelo AI: asistente gratuito para programación, diseño, tecnología, historia y cultura.";
    fetch("/api/ollama/chat", { headers: { Accept: "application/json" } })
      .then((response) => response.json())
      .then((data) => setModelStatus(Boolean(data.ready)))
      .catch(() => setModelStatus(false));
    return () => {
      document.title = oldTitle;
      if (description && oldDescription) description.content = oldDescription;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  function newChat() {
    setMessages([]);
    setFeedback({});
    setDraft("");
    setPanel("");
    setMobileOpen(false);
    textRef.current?.focus();
  }

  function openSettings() {
    setPanel("settings");
    setMobileOpen(false);
  }

  async function sendMessage(value = draft) {
    const content = value.trim();
    if (!content || busy) return;
    const userMessage = { id: "user-" + Date.now(), role: "user", content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft("");
    setBusy(true);
    setMobileOpen(false);
    try {
      const response = await fetch("/api/ollama/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ messages: nextMessages.map(({ role, content: text }) => ({ role, content: text })) })
      });
      const data = await response.json();
      if (response.ok && data.reply) {
        setModelStatus(true);
        setMessages((current) => [...current, { id: "assistant-" + Date.now(), role: "assistant", content: data.reply, sources: Array.isArray(data.sources) ? data.sources : [], sitePages: Array.isArray(data.sitePages) ? data.sitePages : [] }]);
      } else { throw new Error(data.error || "Terciolpelo AI no pudo completar la respuesta."); }
    } catch (error) {
      setModelStatus(false);
      setMessages((current) => [...current, { id: "error-" + Date.now(), role: "assistant", content: "No pude conectar con Terciolpelo AI en este momento. Inténtalo de nuevo en un momento." }]);
      notify(error.message || "No se pudo conectar con el asistente.");
    } finally {
      setBusy(false);
    }
  }

  function copyMessage(text) {
    if (!navigator.clipboard?.writeText) {
      notify("La copia no está disponible en este navegador.");
      return;
    }
    navigator.clipboard.writeText(text).then(() => notify("Respuesta copiada."));
  }

  function regenerate() {
    const lastQuestion = [...messages].reverse().find((message) => message.role === "user");
    if (lastQuestion) {
      setMessages((current) => current.filter((message) => message.role === "user" || message.id !== current[current.length - 1]?.id));
      sendMessage(lastQuestion.content);
    }
  }

  const connected = modelStatus === true;
  const statusLabel = modelStatus === null ? "Comprobando conexión" : connected ? "Terciolpelo AI disponible" : "Terciolpelo AI desconectado";

  return <div className="ai-app">
    {mobileOpen && <button className="ai-mobile-scrim" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} />}
    <aside className={"ai-sidebar" + (mobileOpen ? " is-open" : "")}>
      <a href="/asistenteconIA" className="ai-brand" aria-label="Asistente IA, inicio"><span className="ai-brand-mark"><Sparkles /></span><span>Terciolpelo<span className="ai-brand-light"> AI</span></span></a>
      <button type="button" className="ai-new-chat" onClick={newChat}><Plus /><span>Nuevo chat</span><kbd>⌘ K</kbd></button>
      <div className="ai-side-label">ESPACIO DE TRABAJO</div>
      <button className="ai-side-link is-active" type="button" onClick={newChat}><MessageSquare /><span>Asistente</span></button>
      <button className="ai-side-link" type="button" onClick={() => setPanel("history")}><History /><span>Conversaciones</span></button>
      <button className="ai-side-link" type="button" onClick={openSettings}><Settings2 /><span>Configuración</span></button>
      <div className="ai-history">
        <div className="ai-side-label">RECIENTES</div>
        <button type="button" className="ai-history-item" onClick={() => { setMessages(sampleChat); setMobileOpen(false); }}><span className="ai-history-dot" />Organizar mi semana de estudio</button>
        <button type="button" className="ai-history-item" onClick={() => { setMessages([{ id: "recent-u", role: "user", content: "Dame ideas para un proyecto creativo." }, { id: "recent-a", role: "assistant", content: "Puedes empezar con una idea pequeña: una guía visual, una página para un evento o una lista interactiva. Define a quién ayudará y construye primero una versión sencilla.", demo: true }]); setMobileOpen(false); }}><span className="ai-history-dot" />Ideas para un proyecto creativo</button>
      </div>
      <div className="ai-sidebar-bottom">
        <div className="ai-local-card"><span className="ai-local-icon"><Cpu /></span><div><strong>Terciolpelo AI</strong><small>Asistente gratuito en el servidor</small></div><Cpu /></div>
        <button className="ai-profile" type="button" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}><span className="ai-avatar">U</span><span><strong>User</strong><small>Cuenta de demostración</small></span><MoreHorizontal /></button>
        {profileOpen && <div className="ai-profile-menu"><button type="button" onClick={openSettings}><KeyRound />Conexión del modelo</button><button type="button" onClick={() => { setProfileOpen(false); notify("Sesión de demostración activa."); }}><LogOut />Cerrar menú</button></div>}
      </div>
    </aside>

    <main className="ai-main">
      <header className="ai-topbar">
        <button className="ai-mobile-trigger" type="button" onClick={() => setMobileOpen(true)} aria-label="Abrir menú"><Menu /></button>
        <div className="ai-breadcrumb"><span>Espacio de trabajo</span><span>/</span><strong>Asistente</strong></div>
        <div className="ai-top-actions">
          <span className={"ai-status" + (connected ? " is-connected" : modelStatus === false ? " is-demo" : "")}><i />{statusLabel}</span>
          <button type="button" className="ai-settings-button" onClick={openSettings} aria-label="Ajustes del asistente"><Settings2 /></button>
        </div>
      </header>

      <section className={"ai-workspace" + (messages.length ? " has-messages" : "")}>
        {messages.length === 0 ? <div className="ai-welcome">
          <div className="ai-cover">
            <img src={"/projects/AsistenteIA/" + encodeURIComponent("Robot futurista con halo turquesa.webp")} alt="" />
            <div className="ai-cover-shade" />
            <span className="ai-cover-chip"><Cpu /> IA en el servidor</span>
            <span className="ai-cover-glow" />
          </div>
          <div className="ai-welcome-copy"><span className="ai-eyebrow"><Sparkles /> TU ESPACIO DE IDEAS</span><h1>¿En qué puedo ayudarte<span> hoy</span>?</h1><p>Pregunta sobre programación, diseño, tecnología, historia o cultura.</p></div>
          <div className="ai-prompt-grid">{suggestions.map(({ title, text }) => <button type="button" className="ai-prompt-card" key={title} onClick={() => { setDraft(text); textRef.current?.focus(); }}><span><Sparkles /></span><strong>{title}</strong><small>{text}</small><ArrowUp /></button>)}</div>
        </div> : <div className="ai-conversation">
          {messages.map((message) => <article className={"ai-message ai-message--" + message.role} key={message.id}>
            <span className={"ai-message-avatar" + (message.role === "assistant" ? " is-bot" : "")}>{message.role === "assistant" ? <Bot /> : "U"}</span>
            <div className="ai-message-body"><div className="ai-message-heading"><strong>{message.role === "assistant" ? "Terciolpelo AI" : "User"}</strong>{message.demo && <span className="ai-demo-tag">Muestra</span>}</div><p>{message.content}</p>
              {message.role === "assistant" && message.sources?.length > 0 && <div className="ai-news-sources"><strong>Fuentes actuales</strong>{message.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <small>{source.source}</small></a>)}</div>}
              {message.role === "assistant" && message.sitePages?.length > 0 && <div className="ai-news-sources"><strong>Páginas relacionadas</strong>{message.sitePages.map((page) => <a key={page.url} href={page.url}>{page.title} <small>Abrir página</small></a>)}</div>}
              {message.role === "assistant" && <div className="ai-message-actions"><button type="button" onClick={() => copyMessage(message.content)} aria-label="Copiar respuesta"><Copy /></button><button type="button" className={feedback[message.id] === "up" ? "is-selected" : ""} onClick={() => setFeedback((current) => ({ ...current, [message.id]: current[message.id] === "up" ? "" : "up" }))} aria-label="Me sirvió"><ThumbsUp /></button><button type="button" className={feedback[message.id] === "down" ? "is-selected" : ""} onClick={() => setFeedback((current) => ({ ...current, [message.id]: current[message.id] === "down" ? "" : "down" }))} aria-label="No me sirvió"><ThumbsDown /></button><button type="button" onClick={regenerate} aria-label="Generar otra respuesta"><RotateCcw /></button></div>}
            </div>
          </article>)}
          {busy && <div className="ai-typing"><span className="ai-message-avatar is-bot"><Bot /></span><span><i /><i /><i /></span><small>Preparando respuesta…</small></div>}
          <div ref={endRef} />
        </div>}

        <div className="ai-composer-area">
          {messages.length === 0 && <div className="ai-composer-hint"><ShieldCheck /> Tus mensajes se procesan localmente en el VPS.</div>}
          <form className="ai-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
            <textarea ref={textRef} rows="1" value={draft} maxLength={1200} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="Pregunta sobre programación, diseño, tecnología, historia o cultura…" aria-label="Escribe tu mensaje" />
            <div className="ai-composer-bottom"><span><Sparkles /> {connected ? "Terciolpelo AI · Gratis" : "Terciolpelo AI sin conexión"} <span className="ai-char-count">{draft.length}/1200</span></span><button type="submit" className="ai-send" disabled={!draft.trim() || busy} aria-label="Enviar mensaje">{busy ? <span className="ai-spinner" /> : <Send />}</button></div>
          </form>
          <p className="ai-disclaimer">La IA puede equivocarse. Revisa la información antes de usarla.</p>
        </div>
      </section>

      <footer className="ai-footer"><a className="ai-footer-brand" href="/asistenteconIA"><Sparkles />Terciolpelo AI</a><span>Gratis · Asistente en el servidor · Sin clave</span><div><a href="/#inicio">Programmer Full Stack</a><button type="button" onClick={() => setPanel("about")}>Acerca de esta demo</button></div><small>© {new Date().getFullYear()} · Interfaz de muestra</small></footer>
    </main>

    {panel && <div className="ai-panel-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setPanel(""); }}>
      <section className="ai-panel" role="dialog" aria-modal="true" aria-labelledby="ai-panel-title">
        <header><span className="ai-panel-icon">{panel === "about" ? <CircleHelp /> : panel === "history" ? <History /> : <Settings2 />}</span><div><small>ASISTENTE IA</small><h2 id="ai-panel-title">{panel === "about" ? "Acerca de esta demo" : panel === "history" ? "Conversaciones" : "Conexión del modelo"}</h2></div><button type="button" aria-label="Cerrar panel" onClick={() => setPanel("")}><X /></button></header>
        <div className="ai-panel-content">
          {panel === "settings" && <><div className="ai-connection-card"><span><Cpu /></span><div><strong>Ollama en este VPS</strong><small>{connected ? "Modelo local descargado y listo" : "No se detecta el servicio local"}</small></div><i className={connected ? "is-on" : ""} /></div><h3>Modelo seleccionado</h3><div className="ai-model-card"><span className="ai-model-symbol"><Bot /></span><div><strong>Terciolpelo AI</strong><small>Asistente de programación, diseño, tecnología, historia y cultura</small></div><span className="ai-cloud-label">LOCAL</span></div><h3>Entorno del modelo</h3><p>Ollama procesa las preguntas dentro del VPS. El modelo se guarda aquí:</p><div className="ai-key-path"><Cpu /><code>/var/www/SITIO DE PEDRO/.ollama/models</code></div><div className="ai-info-note"><ShieldCheck /><span>No necesita clave de API ni pago por consulta. Al responder usa memoria y CPU del VPS; después se descarga de memoria automáticamente.</span></div></>}
          {panel === "history" && <><p>Vuelve a abrir una conversación de ejemplo.</p><button type="button" className="ai-history-row" onClick={() => { setMessages(sampleChat); setPanel(""); }}><History /><span><strong>Organizar mi semana de estudio</strong><small>Ejemplo de conversación</small></span><ArrowUp /></button><button type="button" className="ai-history-row" onClick={() => { setMessages([]); setPanel(""); }}><Plus /><span><strong>Empezar un chat nuevo</strong><small>Conversación vacía</small></span><ArrowUp /></button></>}
          {panel === "about" && <><p>Terciolpelo AI responde desde este servidor y está orientado a programación, diseño, tecnología, historia y cultura.</p><div className="ai-about-stats"><span><Cpu /><strong>Asistente ligero</strong><small>Sin clave de nube</small></span><span><Zap /><strong>En el VPS</strong><small>Usa CPU y memoria al responder</small></span></div><p>La primera respuesta puede tardar un poco mientras Ollama carga el modelo.</p></>}
        </div>
        <footer><button type="button" onClick={() => setPanel("")}>Listo</button></footer>
      </section>
    </div>}

    {toast && <div className="ai-toast" role="status"><Check />{toast}</div>}
  </div>;
}

export default AssistantPage;
