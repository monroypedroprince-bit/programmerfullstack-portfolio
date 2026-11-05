import { useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, ExternalLink, MessageCircle, Send, Sparkles, X } from "lucide-react";
import "./floating-terciolpelo-chat.css";

const starters = ["Ayúdame con una idea de programación", "¿Qué proyectos hay en este sitio?", "Noticias recientes de tecnología"];

export default function FloatingTerciolpeloChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const requestController = useRef(null);

  useEffect(() => { if (open) { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); inputRef.current?.focus(); } }, [open, messages, busy]);
  function closeChat() { requestController.current?.abort(); requestController.current = null; setOpen(false); setMessages([]); setDraft(""); setError(""); setBusy(false); }
  useEffect(() => { const onKey = (event) => { if (event.key === "Escape") closeChat(); }; const onPageHide = () => { requestController.current?.abort(); requestController.current = null; setMessages([]); setDraft(""); setError(""); setBusy(false); setOpen(false); }; window.addEventListener("keydown", onKey); window.addEventListener("pagehide", onPageHide); return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("pagehide", onPageHide); requestController.current?.abort(); }; }, []);

  async function send(value = draft) {
    const text = value.trim();
    if (!text || busy) return;
    const user = { id: Date.now(), role: "user", content: text };
    const next = [...messages, user];
    setMessages(next); setDraft(""); setError(""); setBusy(true);
    const controller = new AbortController(); requestController.current = controller;
    try {
      const response = await fetch("/api/ollama/chat", { method: "POST", cache: "no-store", signal: controller.signal, headers: { "Content-Type": "application/json", Accept: "application/json", "Cache-Control": "no-store" }, body: JSON.stringify({ messages: next.slice(-4).map(({ role, content }) => ({ role, content })) }) });
      const raw = await response.text();
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; }
      catch { throw new Error("El servidor respondió con HTTP " + response.status + " y un contenido no válido."); }
      if (!response.ok || !(data && data.reply)) throw new Error((data && data.error) || "No se pudo obtener una respuesta (HTTP " + response.status + ").");
      setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", content: data.reply, sources: Array.isArray(data.sources) ? data.sources : [], sitePages: Array.isArray(data.sitePages) ? data.sitePages : [], continues: data.continues === true }]);
    } catch (exception) { if (!(exception instanceof DOMException && exception.name === "AbortError")) setError(exception.message || "No se pudo conectar con Rocky."); }
    finally { if (requestController.current === controller) { requestController.current = null; if (!controller.signal.aborted) setBusy(false); } }
  }

  return <div className="terciolpelo-widget" data-site="programmerfullstack">
    {open && <section className="terciolpelo-panel" role="dialog" aria-modal="false" aria-labelledby="terciolpelo-title">
      <header className="terciolpelo-head"><span className="terciolpelo-mark"><Sparkles aria-hidden="true" /></span><div><strong id="terciolpelo-title">Rocky</strong><small>Programación · diseño · tecnología</small></div><button type="button" onClick={closeChat} aria-label="Cerrar chat"><X /></button></header>
      <div className="terciolpelo-messages" aria-live="polite">
        {!messages.length && <div className="terciolpelo-welcome"><span className="terciolpelo-welcome-icon"><Bot /></span><h2>Hola, ¿qué estás creando?</h2><p>Puedo ayudarte con tecnología, programación, diseño, historia y cultura, además de orientarte por los proyectos de este sitio.</p><div className="terciolpelo-starters">{starters.map((item) => <button key={item} type="button" onClick={() => send(item)}>{item}</button>)}</div></div>}
        {messages.map((message) => <article key={message.id} className={`terciolpelo-message is-${message.role}`}><span className="terciolpelo-avatar">{message.role === "assistant" ? <Sparkles /> : "Tú"}</span><div><p>{message.content}</p>{message.sources?.length > 0 && <div className="terciolpelo-sources"><strong>Fuentes actuales</strong>{message.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer"><span>{source.title}<small>{source.source}{source.date ? ` · ${source.date}` : ""}</small></span><ExternalLink aria-hidden="true" /></a>)}</div>}{message.sitePages?.length > 0 && <div className="terciolpelo-sources"><strong>Páginas relacionadas</strong>{message.sitePages.map((page) => <a key={page.url} href={page.url}><span>{page.title}<small>Abrir página</small></span><ExternalLink aria-hidden="true" /></a>)}</div>}<div className="terciolpelo-continue-wrap">{message.role === "assistant" && message.continues && <button type="button" className="terciolpelo-continue" onClick={() => send("Continua desde donde quedaste, por favor.")}>Continuar respuesta</button>}</div></div></article>)}
        {busy && <div className="terciolpelo-typing"><i /><i /><i /><span>Rocky está respondiendo…</span></div>}
        {error && <p className="terciolpelo-error" role="alert">{error}</p>}<div ref={endRef} />
      </div>
      <form className="terciolpelo-compose" onSubmit={(event) => { event.preventDefault(); send(); }}><textarea ref={inputRef} rows="1" maxLength="1200" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="Escribe tu pregunta…" aria-label="Escribe tu pregunta" /><button type="submit" disabled={!draft.trim() || busy} aria-label="Enviar"><Send /></button><small>Gratis · IA en el servidor · Sin clave</small></form>
    </section>}
    <button type="button" className="terciolpelo-launcher" onClick={() => open ? closeChat() : setOpen(true)} aria-expanded={open} aria-label={open ? "Cerrar Rocky" : "Usa IA gratis"}>{open ? <ChevronDown aria-hidden="true" /> : <MessageCircle aria-hidden="true" />}<span>{open ? "Cerrar" : "Usa IA gratis"}</span></button>
  </div>;
}
