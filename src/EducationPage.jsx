import { useEffect, useMemo, useRef, useState } from "react";
import {
  GraduationCap, Home, BookOpen, Compass, BadgeCheck, ChartNoAxesColumnIncreasing,
  CalendarDays, UsersRound, Search, Bell, ChevronDown, Menu, X, Play, Pause,
  Star, Clock3, Bookmark, ArrowRight, ChevronLeft, ChevronRight, Target, Check,
  UserRound, Pencil, LogOut, SlidersHorizontal, Code2, Palette, Megaphone,
  BriefcaseBusiness, Layers3, Video, Award, FileText, Heart, Send, Save, TrendingUp,
  MessageCircle, BarChart3, LockKeyhole, ArrowUpRight
} from "lucide-react";
import "./education-page.css";

const navigation = [
  { id: "home", label: "Inicio", Icon: Home },
  { id: "my-courses", label: "Mis cursos", Icon: BookOpen },
  { id: "explore", label: "Explorar cursos", Icon: Compass },
  { id: "certificates", label: "Certificaciones", Icon: BadgeCheck },
  { id: "progress", label: "Progreso", Icon: ChartNoAxesColumnIncreasing },
  { id: "calendar", label: "Calendario", Icon: CalendarDays },
  { id: "community", label: "Comunidad", Icon: UsersRound }
];

const courseData = [
  { id: "react", image: "Desarrollo Web con React.webp", title: "Desarrollo Web con React", category: "Programación", tag: "Desarrollo", rating: "4.8", learners: "2,456", hours: "24 horas", instructor: "Laura Méndez", accent: "react", Icon: Code2, progress: 68 },
  { id: "design", image: "UIUX Design Profesional.webp", title: "UI/UX Design Profesional", category: "Diseño", tag: "Diseño", rating: "4.9", learners: "1,320", hours: "18 horas", instructor: "Sofía Torres", accent: "design", Icon: Palette, progress: 42 },
  { id: "python", image: "Python de Cero a Avanzado.webp", title: "Python de Cero a Avanzado", category: "Programación", tag: "Programación", rating: "4.8", learners: "3,892", hours: "30 horas", instructor: "Andrés Gil", accent: "python", Icon: Code2, progress: 24 },
  { id: "marketing", image: "Marketing Digital Estratégico.webp", title: "Marketing Digital Estratégico", category: "Marketing", tag: "Marketing", rating: "4.7", learners: "2,108", hours: "20 horas", instructor: "Valentina Ruiz", accent: "marketing", Icon: TrendingUp, progress: 85 }
];

const categoryData = [
  { label: "Programación", Icon: Code2 },
  { label: "Diseño", Icon: Palette },
  { label: "Marketing", Icon: Megaphone },
  { label: "Negocios", Icon: BriefcaseBusiness },
  { label: "Productividad", Icon: ChartNoAxesColumnIncreasing },
  { label: "Más categorías", Icon: Layers3, more: true }
];

const panelNames = {
  "my-courses": "Mis cursos",
  explore: "Explorar cursos",
  certificates: "Certificaciones",
  progress: "Mi progreso",
  calendar: "Calendario de estudio",
  community: "Comunidad",
  account: "Datos personales",
  edit: "Editar cuenta",
  logout: "Cerrar sesión",
  upgrade: "Mejora tu aprendizaje",
  courses: "Todos mis cursos"
};

const defaultGoals = [true, false, false];
const defaultPosts = [
  { id: 1, name: "Camila R.", time: "Hace 2 horas", text: "Terminé el módulo de componentes de React. Los ejercicios prácticos me ayudaron a entender mejor las props.", likes: 8, liked: false },
  { id: 2, name: "Mateo G.", time: "Ayer", text: "¿Qué curso recomiendan para empezar con diseño de interfaces? Quiero mejorar mis prototipos.", likes: 5, liked: false }
];

function ProgressRing({ value }) {
  const circumference = 2 * Math.PI * 47;
  return <div className="edu-progress-ring" role="img" aria-label={"Progreso: " + value + "%"}>
    <svg viewBox="0 0 110 110" aria-hidden="true">
      <circle className="edu-ring-track" cx="55" cy="55" r="47" />
      <circle className="edu-ring-value" cx="55" cy="55" r="47" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)} />
    </svg>
    <strong>{value}%</strong>
  </div>;
}

function EduLMSPage() {
  const [panel, setPanel] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [popover, setPopover] = useState("");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [bookmarks, setBookmarks] = useState(["design"]);
  const [goals, setGoals] = useState(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("edulms-goals"));
      return Array.isArray(saved) && saved.length === 3 ? saved : defaultGoals;
    } catch {
      return defaultGoals;
    }
  });
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 0, 15));
  const [selectedDay, setSelectedDay] = useState(15);
  const [progress, setProgress] = useState(75);
  const [playing, setPlaying] = useState(false);
  const [loggedIn, setLoggedIn] = useState(true);
  const [account, setAccount] = useState({ name: "User", email: "usuario@edulms.com", program: "Desarrollo Web" });
  const [draftAccount, setDraftAccount] = useState(account);
  const [posts, setPosts] = useState(defaultPosts);
  const [postDraft, setPostDraft] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(0);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const currentCourse = courseData.find((course) => panel === "course:" + course.id);
  const visibleCourses = useMemo(() => courseData.filter((course) => {
    const categoryMatch = selectedCategory === "Todos" || course.category === selectedCategory;
    const query = search.trim().toLocaleLowerCase("es");
    const searchMatch = !query || (course.title + " " + course.category + " " + course.tag + " " + course.instructor).toLocaleLowerCase("es").includes(query);
    return categoryMatch && searchMatch;
  }), [selectedCategory, search]);

  const panelTitle = currentCourse ? currentCourse.title : panelNames[panel] || "EduLMS";
  const PanelIcon = currentCourse ? currentCourse.Icon : (navigation.find((item) => item.id === panel)?.Icon || BookOpen);
  const monthName = new Intl.DateTimeFormat("es", { month: "long" }).format(calendarDate);
  const monthLabel = monthName.charAt(0).toLocaleUpperCase("es") + monthName.slice(1) + " " + calendarDate.getFullYear();
  const weekDates = Array.from({ length: 7 }, (_, index) => new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 12 + index));
  const weekDays = weekDates.map((date) => new Intl.DateTimeFormat("es", { weekday: "short" }).format(date).replace(".", "").slice(0, 3));
  const nextClassDate = weekDates.find((date) => date.getDate() === selectedDay);
  const selectedDateLabel = nextClassDate ? new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(nextClassDate) : "fecha seleccionada";

  useEffect(() => {
    const oldTitle = document.title;
    document.title = "Plataforma educativa EduLMS | Programmer Full Stack";
    const description = document.querySelector('meta[name="description"]');
    const oldDescription = description?.content;
    if (description) description.content = "Maqueta interactiva de EduLMS: cursos, progreso, calendario y comunidad.";
    return () => {
      document.title = oldTitle;
      if (description && oldDescription) description.content = oldDescription;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setPanel("");
        setPopover("");
        setMobileMenu(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!profileRef.current?.contains(event.target) && !notificationRef.current?.contains(event.target)) setPopover("");
      if (!searchRef.current?.contains(event.target)) setSearchOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!panel) return undefined;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = oldOverflow; };
  }, [panel]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  function showToast(message) {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(""), 3200);
  }

  function openPanel(name) {
    setPanel(name);
    setPopover("");
    setMobileMenu(false);
    setSearchOpen(false);
  }

  function goHome() {
    setPanel("");
    setPopover("");
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseCategory(category) {
    setSelectedCategory(category);
    setSearch("");
    setPanel("");
    setPopover("");
    window.requestAnimationFrame(() => document.getElementById("edu-courses")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  function shiftMonth(direction) {
    setCalendarDate((current) => new Date(current.getFullYear(), current.getMonth() + direction, 15));
    setSelectedDay(15);
  }

  function toggleGoal(index) {
    setGoals((current) => {
      const next = current.map((value, position) => position === index ? !value : value);
      try { window.localStorage.setItem("edulms-goals", JSON.stringify(next)); } catch { /* demo state still works without storage */ }
      return next;
    });
  }

  function continueCourse(course) {
    setProgress((value) => Math.min(100, value + 5));
    setPlaying(true);
    setPanel("");
    showToast("Continuaste el curso: " + course.title);
  }

  function selectSearchCourse(course) {
    setSearchOpen(false);
    setPanel("course:" + course.id);
  }

  function saveAccount(event) {
    event.preventDefault();
    setAccount(draftAccount);
    setPanel("");
    showToast("Tus datos se guardaron en esta maqueta.");
  }

  function addPost(event) {
    event.preventDefault();
    const text = postDraft.trim();
    if (!text) {
      showToast("Escribe un mensaje antes de publicar.");
      return;
    }
    setPosts((current) => [{ id: Date.now(), name: "User", time: "Ahora", text, likes: 0, liked: false }, ...current]);
    setPostDraft("");
    showToast("Tu publicación ya está en la comunidad.");
  }

  function toggleLike(id) {
    setPosts((current) => current.map((post) => post.id === id ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } : post));
  }

  function openCalendarPanel() {
    openPanel("calendar");
  }

  return <div className="edu-app">
    <aside className={"edu-sidebar" + (mobileMenu ? " is-open" : "")}>
      <a className="edu-brand" href="/Plataformaeducativa" aria-label="EduLMS, inicio">
        <GraduationCap aria-hidden="true" /><span>EduLMS</span>
      </a>
      <div className="edu-side-scroll">
        <p className="edu-nav-label">Menú principal</p>
        <nav className="edu-nav" aria-label="Menú de aprendizaje">
          {navigation.map(({ id, label, Icon }) => <button className={"edu-nav-item" + (id === "home" && !panel ? " is-active" : "")} type="button" key={id} onClick={() => id === "home" ? goHome() : openPanel(id)} aria-current={id === "home" && !panel ? "page" : undefined}>
            <Icon aria-hidden="true" /><span>{label}</span>
          </button>)}
        </nav>
      </div>
      <section className="edu-upgrade">
        <div className="edu-upgrade-cap"><GraduationCap aria-hidden="true" /></div>
        <h2>Mejora tu aprendizaje</h2>
        <p>Explora más cursos y sigue avanzando a tu ritmo.</p>
        <button type="button" onClick={() => openPanel("upgrade")}>Actualizar plan <ArrowRight aria-hidden="true" /></button>
      </section>
    </aside>
    {mobileMenu && <button type="button" className="edu-mobile-scrim" aria-label="Cerrar menú" onClick={() => setMobileMenu(false)} />}

    <div className="edu-main">
      <header className="edu-topbar">
        <button type="button" className="edu-mobile-menu" onClick={() => setMobileMenu((value) => !value)} aria-label={mobileMenu ? "Cerrar menú" : "Abrir menú"}>
          {mobileMenu ? <X /> : <Menu />}
        </button>
        <div className="edu-search-wrap" ref={searchRef}>
          <form className="edu-search" role="search" onSubmit={(event) => { event.preventDefault(); setSearchOpen(false); document.getElementById("edu-courses")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
            <Search aria-hidden="true" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setSearchOpen(Boolean(event.target.value)); }} onFocus={() => { if (search) setSearchOpen(true); }} placeholder="Buscar cursos, temas o instructores..." aria-label="Buscar cursos, temas o instructores" />
            {search && <button type="button" className="edu-search-clear" aria-label="Limpiar búsqueda" onClick={() => { setSearch(""); setSearchOpen(false); }}><X /></button>}
          </form>
          {searchOpen && search && <div className="edu-search-results" role="listbox" aria-label="Cursos encontrados">
            {visibleCourses.length ? visibleCourses.map((course) => <button type="button" role="option" key={course.id} onMouseDown={(event) => event.preventDefault()} onClick={() => selectSearchCourse(course)}>
              <span className={"edu-search-result-icon edu-course-art--" + course.accent}><course.Icon /></span><span><strong>{course.title}</strong><small>{course.category} · {course.instructor}</small></span><ArrowUpRight aria-hidden="true" />
            </button>) : <p>No encontramos cursos para “{search}”.</p>}
          </div>}
        </div>
        <div className="edu-top-actions">
          <div className="edu-popover-anchor" ref={notificationRef}>
            <button type="button" className={"edu-icon-button edu-notification-button" + (popover === "notifications" ? " is-open" : "")} aria-label="Notificaciones" aria-expanded={popover === "notifications"} onClick={() => setPopover((value) => value === "notifications" ? "" : "notifications")}>
              <Bell aria-hidden="true" /><i />
            </button>
            {popover === "notifications" && <div className="edu-popover edu-notifications">
              <div className="edu-popover-heading"><strong>Notificaciones</strong><span>2 nuevas</span></div>
              <button type="button" className="edu-notice-item" onClick={() => openPanel("my-courses")}><span className="edu-notice-icon"><Video /></span><span><strong>Tu próxima clase te espera</strong><small>React: Componentes y Props · 12 min</small></span></button>
              <button type="button" className="edu-notice-item" onClick={() => openPanel("certificates")}><span className="edu-notice-icon edu-notice-gold"><Award /></span><span><strong>Vas por buen camino</strong><small>Ya completaste 6 de 8 cursos</small></span></button>
            </div>}
          </div>
          <div className="edu-popover-anchor" ref={profileRef}>
            <button type="button" className="edu-profile-button" aria-expanded={popover === "profile"} onClick={() => {
              if (!loggedIn) { setLoggedIn(true); showToast("Sesión de demostración iniciada."); return; }
              setPopover((value) => value === "profile" ? "" : "profile");
            }}>
              <span className="edu-avatar" aria-hidden="true">U</span><span className="edu-profile-name">{loggedIn ? "User" : "Invitado"}</span><ChevronDown aria-hidden="true" />
            </button>
            {popover === "profile" && loggedIn && <div className="edu-popover edu-profile-menu">
              <div className="edu-profile-summary"><span className="edu-avatar">U</span><span><strong>{account.name}</strong><small>{account.email}</small></span></div>
              <button type="button" onClick={() => openPanel("account")}><UserRound />Datos personales</button>
              <button type="button" onClick={() => { setDraftAccount(account); openPanel("edit"); }}><Pencil />Editar cuenta</button>
              <span className="edu-menu-separator" />
              <button type="button" className="edu-logout-action" onClick={() => openPanel("logout")}><LogOut />Cerrar sesión</button>
            </div>}
          </div>
        </div>
      </header>

      <main className="edu-content">
        <div className="edu-primary">
          <section className="edu-hero" aria-labelledby="edu-heading">
            <img className="edu-hero-image" src="/projects/education/edulms-cover.webp" alt="Estudiante aprendiendo en línea con una laptop" fetchPriority="high" />
            <div className="edu-hero-copy">
              <div className="edu-hero-chip"><GraduationCap aria-hidden="true" />Aprende a tu ritmo</div>
              <h1 id="edu-heading">Plataforma educativa<br />para <span>tu crecimiento</span></h1>
              <p>Cursos online, certificaciones y rutas de aprendizaje diseñadas para tu desarrollo profesional.</p>
              <button type="button" className="edu-primary-button" onClick={() => openPanel("explore")}>Explorar cursos <ArrowRight aria-hidden="true" /></button>
            </div>
          </section>

          <section className="edu-benefits" aria-label="Ventajas de la plataforma">
            <div><GraduationCap /><span><strong>+1,000 cursos</strong><small>En diversas áreas</small></span></div>
            <div><BadgeCheck /><span><strong>Certificaciones</strong><small>Valida tu aprendizaje</small></span></div>
            <div><TrendingUp /><span><strong>Acceso ilimitado</strong><small>Aprende sin límites</small></span></div>
            <div><UsersRound /><span><strong>Instructores expertos</strong><small>De la industria</small></span></div>
          </section>

          <section className="edu-section edu-course-section" id="edu-courses" aria-labelledby="edu-courses-title">
            <header className="edu-section-heading">
              <div><h2 id="edu-courses-title">{search ? "Resultados de búsqueda" : selectedCategory === "Todos" ? "Cursos recomendados para ti" : "Cursos de " + selectedCategory}</h2><p>{search ? visibleCourses.length + " cursos encontrados" : "Continúa aprendiendo con cursos seleccionados para ti."}</p></div>
              <button type="button" className="edu-text-button" onClick={() => openPanel("courses")}>Ver todos <ArrowRight /></button>
            </header>
            {visibleCourses.length ? <div className="edu-course-grid">
              {visibleCourses.map((course) => <article className="edu-course-card" key={course.id}>
                <div className={"edu-course-art edu-course-art--" + course.accent}>
                  <img className="edu-course-image" src={"/projects/education/" + encodeURIComponent(course.image)} alt="" loading="lazy" /><span className="edu-course-tag">{course.tag}</span>
                  <button type="button" className={"edu-bookmark" + (bookmarks.includes(course.id) ? " is-saved" : "")} aria-label={bookmarks.includes(course.id) ? "Quitar de guardados" : "Guardar curso"} aria-pressed={bookmarks.includes(course.id)} onClick={() => setBookmarks((current) => current.includes(course.id) ? current.filter((id) => id !== course.id) : [...current, course.id])}><Bookmark aria-hidden="true" /></button>
                </div>
                <div className="edu-course-info"><button type="button" className="edu-course-title" onClick={() => openPanel("course:" + course.id)}>{course.title}</button>
                  <div className="edu-course-meta"><span><Star aria-hidden="true" />{course.rating} <small>({course.learners})</small></span><span><Clock3 aria-hidden="true" />{course.hours}</span></div>
                </div>
              </article>)}
            </div> : <div className="edu-empty-courses"><Search /><strong>No encontramos cursos</strong><span>Prueba otro término o categoría.</span><button type="button" onClick={() => { setSearch(""); setSelectedCategory("Todos"); }}>Limpiar filtros</button></div>}
          </section>

          <section className="edu-section edu-category-section" aria-labelledby="edu-category-title">
            <header className="edu-section-heading"><div><h2 id="edu-category-title">Explora por categorías</h2></div><button type="button" className="edu-text-button" onClick={() => openPanel("explore")}>Ver todas <ArrowRight /></button></header>
            <div className="edu-category-grid">
              {categoryData.map(({ label, Icon, more }) => <button type="button" className={"edu-category" + (selectedCategory === label ? " is-selected" : "")} key={label} onClick={() => more ? openPanel("explore") : chooseCategory(selectedCategory === label ? "Todos" : label)} aria-pressed={!more && selectedCategory === label}>
                <Icon aria-hidden="true" /><span>{label}</span>
              </button>)}
            </div>
          </section>
        </div>

        <aside className="edu-rail" aria-label="Resumen de aprendizaje">
          <section className="edu-widget edu-progress-widget">
            <h2>Tu progreso</h2>
            <div className="edu-progress-summary"><ProgressRing value={progress} /><p><strong>6 de 8 cursos</strong><span>completados</span></p></div>
            <button type="button" className="edu-widget-link" onClick={() => openPanel("progress")}>Ver progreso <ArrowRight /></button>
          </section>

          <section className="edu-widget edu-next-widget">
            <h2>Tu próxima clase</h2>
            <div className="edu-next-content">
              <button type="button" className={"edu-video-thumb" + (playing ? " is-playing" : "")} aria-label={playing ? "Pausar clase" : "Reproducir clase"} onClick={() => { setPlaying((value) => !value); showToast(playing ? "Clase en pausa." : "Reproduciendo la clase de React."); }}>{playing ? <Pause /> : <Play />}</button>
              <div className="edu-next-details"><strong>React: Componentes y Props</strong><span><Clock3 />12 min restantes</span></div>
              <button type="button" className="edu-play-button" aria-label={playing ? "Pausar clase" : "Reproducir clase"} onClick={() => { setPlaying((value) => !value); showToast(playing ? "Clase en pausa." : "Reproduciendo la clase de React."); }}>{playing ? <Pause /> : <Play />}</button>
            </div>
          </section>

          <section className="edu-widget edu-calendar-widget">
            <div className="edu-calendar-heading"><h2>Calendario de estudio</h2><div><button type="button" aria-label="Mes anterior" onClick={() => shiftMonth(-1)}><ChevronLeft /></button><button type="button" aria-label="Mes siguiente" onClick={() => shiftMonth(1)}><ChevronRight /></button></div></div>
            <div className="edu-calendar-month">{monthLabel}</div>
            <div className="edu-calendar-days" role="group" aria-label={"Días de " + monthLabel}>
              {weekDates.map((date, index) => <div className="edu-calendar-day" key={date.toISOString()}><span>{weekDays[index]}</span><button type="button" className={date.getDate() === selectedDay ? "is-selected" : ""} aria-pressed={date.getDate() === selectedDay} onClick={() => setSelectedDay(date.getDate())}>{date.getDate()}</button>{date.getDate() === 15 && <i aria-hidden="true" />}</div>)}
            </div>
            <button type="button" className="edu-calendar-note" onClick={openCalendarPanel}><span className="edu-calendar-dot" />1 clase programada <ArrowRight /></button>
          </section>

          <section className="edu-widget edu-goals-widget">
            <h2><Target aria-hidden="true" />Metas de aprendizaje</h2>
            <div className="edu-goals-list">{["Completar 2 cursos este mes", "Estudiar 5 horas por semana", "Obtener una nueva certificación"].map((goal, index) => <label className="edu-goal" key={goal}>
              <input type="checkbox" checked={Boolean(goals[index])} onChange={() => toggleGoal(index)} /><span className="edu-custom-checkbox"><Check aria-hidden="true" /></span><span>{goal}</span>
            </label>)}</div>
          </section>
        </aside>
      </main>
    </div>

    {panel && <div className="edu-panel-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setPanel(""); }}>
      <section className="edu-panel" role="dialog" aria-modal="true" aria-labelledby="edu-panel-title">
        <header className="edu-panel-header"><span className="edu-panel-heading-icon"><PanelIcon aria-hidden="true" /></span><div><h2 id="edu-panel-title">{panelTitle}</h2><p>{currentCourse ? "Detalles y contenido del curso" : panel === "community" ? "Aprende y comparte con otras personas." : "Tu espacio de aprendizaje en EduLMS."}</p></div><button type="button" className="edu-panel-close" aria-label="Cerrar panel" onClick={() => setPanel("")}><X /></button></header>
        <div className="edu-panel-scroll">
          {(panel === "my-courses" || panel === "courses") && <div className="edu-panel-course-list">
            <div className="edu-panel-intro"><p>Retoma tus cursos y revisa cuánto has avanzado.</p><span>{courseData.length} cursos disponibles</span></div>
            {courseData.map((course, index) => <article className="edu-enrolled-course" key={course.id}>
              <span className={"edu-enrolled-icon edu-course-art--" + course.accent}><course.Icon /></span>
              <div className="edu-enrolled-details"><div><strong>{course.title}</strong><span>{index < 2 ? "En progreso" : "Disponible"}</span></div><div className="edu-mini-progress"><i style={{ width: (index < 2 ? course.progress : 0) + "%" }} /></div><small>{index < 2 ? course.progress + "% completado" : course.hours + " de contenido"}</small></div>
              <button type="button" className="edu-small-action" onClick={() => openPanel("course:" + course.id)}>{index < 2 ? "Continuar" : "Ver curso"} <ArrowRight /></button>
            </article>)}
            <button type="button" className="edu-primary-button edu-panel-primary" onClick={() => openPanel("explore")}>Explorar más cursos <ArrowRight /></button>
          </div>}

          {panel === "explore" && <div className="edu-explore-content">
            <div className="edu-panel-intro"><p>Elige un área para ver cursos relacionados con tus intereses.</p><span>5 áreas de aprendizaje</span></div>
            <div className="edu-explore-grid">{categoryData.filter((item) => !item.more).map(({ label, Icon }) => <button type="button" className="edu-explore-option" key={label} onClick={() => label === "Negocios" || label === "Productividad" ? showToast("Pronto encontrarás nuevos cursos de " + label + ".") : chooseCategory(label)}>
              <span><Icon /></span><strong>{label}</strong><small>{label === "Programación" ? "Desarrollo, React y Python" : label === "Diseño" ? "Diseño visual y experiencia de usuario" : label === "Marketing" ? "Estrategia y comunicación digital" : label === "Negocios" ? "Emprendimiento y gestión" : "Organización y hábitos de estudio"}</small><ArrowUpRight />
            </button>)}</div>
            <h3 className="edu-panel-subtitle">Cursos recomendados</h3><div className="edu-panel-featured">{courseData.slice(0, 2).map((course) => <button type="button" key={course.id} onClick={() => openPanel("course:" + course.id)}><span className={"edu-enrolled-icon edu-course-art--" + course.accent}><course.Icon /></span><span><strong>{course.title}</strong><small>{course.category} · {course.hours}</small></span><ArrowRight /></button>)}</div>
          </div>}

          {panel === "certificates" && <div className="edu-certificate-list">
            <div className="edu-panel-intro"><p>Tus logros reflejan el camino que has recorrido.</p><span>2 certificados disponibles</span></div>
            {[["Fundamentos de React", "Completado · 18 oct 2025", Code2], ["Diseño de interfaces", "Completado · 02 dic 2025", Palette]].map(([title, detail, Icon]) => <article className="edu-certificate" key={title}>
              <span className="edu-certificate-seal"><Icon /></span><span><strong>{title}</strong><small>{detail}</small></span><button type="button" onClick={() => showToast("Vista de muestra del certificado: " + title)} aria-label={"Ver certificado de " + title}><FileText /><span>Ver certificado</span><ArrowUpRight /></button>
            </article>)}
            <div className="edu-certificate-note"><Award /><p>Completa un curso para desbloquear un nuevo certificado.</p></div>
          </div>}

          {panel === "progress" && <div className="edu-progress-detail">
            <div className="edu-panel-intro"><p>Un resumen de tu actividad de aprendizaje.</p><span>Este mes</span></div>
            <div className="edu-stat-grid"><article><span><BookOpen /></span><strong>6 de 8</strong><small>Cursos completados</small></article><article><span><Clock3 /></span><strong>18 h 24 min</strong><small>Tiempo de estudio</small></article><article><span><Award /></span><strong>2</strong><small>Certificaciones</small></article></div>
            <div className="edu-progress-block"><div><strong>Progreso general</strong><b>{progress}%</b></div><div className="edu-large-progress"><i style={{ width: progress + "%" }} /></div><p>Has completado {progress}% de tu ruta de aprendizaje.</p></div>
            <div className="edu-progress-block"><div><strong>Actividad semanal</strong><span>5 horas de meta</span></div><div className="edu-week-bars">{[["Lun", 42], ["Mar", 72], ["Mié", 58], ["Jue", 89], ["Vie", 35], ["Sáb", 63], ["Dom", 27]].map(([day, amount]) => <span key={day}><i style={{ height: amount + "%" }} /><small>{day}</small></span>)}</div></div>
            <h3 className="edu-panel-subtitle">Cursos en progreso</h3>{courseData.slice(0, 2).map((course) => <div className="edu-progress-course" key={course.id}><span>{course.title}</span><b>{course.progress}%</b><div className="edu-large-progress"><i style={{ width: course.progress + "%" }} /></div></div>)}
          </div>}

          {panel === "calendar" && <div className="edu-panel-calendar">
            <div className="edu-panel-intro"><p>Organiza tus sesiones y clases próximas.</p><span>{monthLabel}</span></div>
            <div className="edu-calendar-full-header"><button type="button" aria-label="Mes anterior" onClick={() => shiftMonth(-1)}><ChevronLeft /></button><strong>{monthLabel}</strong><button type="button" aria-label="Mes siguiente" onClick={() => shiftMonth(1)}><ChevronRight /></button></div>
            <div className="edu-calendar-full-grid">{weekDates.map((date, index) => <div key={date.toISOString()}><small>{weekDays[index]}</small><button type="button" className={date.getDate() === selectedDay ? "is-selected" : ""} onClick={() => setSelectedDay(date.getDate())}>{date.getDate()}</button></div>)}</div>
            <h3 className="edu-panel-subtitle">Clases de {selectedDateLabel}</h3>
            <article className="edu-schedule-item"><span><Video /></span><div><strong>React: Componentes y Props</strong><small>10:30 a. m. · 12 minutos · Laura Méndez</small></div><button type="button" aria-label="Abrir clase de React" onClick={() => openPanel("course:react")}><ArrowRight /></button></article>
            <article className="edu-schedule-item"><span><Palette /></span><div><strong>Revisión de prototipos</strong><small>3:00 p. m. · 25 minutos · Sofía Torres</small></div><button type="button" aria-label="Abrir curso de diseño" onClick={() => openPanel("course:design")}><ArrowRight /></button></article>
          </div>}

          {panel === "community" && <div className="edu-community">
            <form className="edu-post-form" onSubmit={addPost}><label htmlFor="edu-post">Comparte una idea o pregunta</label><textarea id="edu-post" value={postDraft} onChange={(event) => setPostDraft(event.target.value)} placeholder="¿Qué estás aprendiendo hoy?" maxLength={300} /><div><small>{postDraft.length}/300 caracteres</small><button type="submit" className="edu-primary-button">Publicar <Send /></button></div></form>
            <div className="edu-community-filters"><strong>Conversaciones recientes</strong><button type="button" onClick={() => setPosts((current) => [...current].reverse())}><SlidersHorizontal />Cambiar orden</button></div>
            {posts.map((post) => <article className="edu-post" key={post.id}><div className="edu-post-avatar">{post.name.charAt(0)}</div><div className="edu-post-main"><div className="edu-post-meta"><strong>{post.name}</strong><span>{post.time}</span></div><p>{post.text}</p><button type="button" className={post.liked ? "is-liked" : ""} onClick={() => toggleLike(post.id)}><Heart />Me gusta <span>{post.likes}</span></button></div></article>)}
          </div>}

          {panel === "account" && <div className="edu-account-content"><div className="edu-profile-large"><span className="edu-avatar">U</span><div><strong>{account.name}</strong><small>Estudiante · Cuenta de demostración</small></div></div><dl className="edu-account-data"><div><dt>Nombre de usuario</dt><dd>{account.name}</dd></div><div><dt>Correo electrónico</dt><dd>{account.email}</dd></div><div><dt>Ruta de aprendizaje</dt><dd>{account.program}</dd></div><div><dt>Miembro desde</dt><dd>Enero de 2025</dd></div></dl><button type="button" className="edu-primary-button" onClick={() => { setDraftAccount(account); openPanel("edit"); }}>Editar datos <Pencil /></button></div>}

          {panel === "edit" && <form className="edu-edit-form" onSubmit={saveAccount}><div className="edu-panel-intro"><p>Actualiza la información de tu perfil de demostración.</p><span>Cambios locales</span></div><label>Nombre<input value={draftAccount.name} onChange={(event) => setDraftAccount((current) => ({ ...current, name: event.target.value }))} required maxLength={40} /></label><label>Correo electrónico<input type="email" value={draftAccount.email} onChange={(event) => setDraftAccount((current) => ({ ...current, email: event.target.value }))} required /></label><label>Ruta de aprendizaje<input value={draftAccount.program} onChange={(event) => setDraftAccount((current) => ({ ...current, program: event.target.value }))} required maxLength={60} /></label><button type="submit" className="edu-primary-button"><Save />Guardar cambios</button></form>}

          {panel === "logout" && <div className="edu-logout-content"><span><LogOut /></span><h3>¿Quieres cerrar tu sesión?</h3><p>Esto finalizará la sesión de demostración en este dispositivo.</p><div><button type="button" className="edu-secondary-button" onClick={() => setPanel("")}>Seguir en EduLMS</button><button type="button" className="edu-primary-button" onClick={() => { setLoggedIn(false); setPanel(""); showToast("Sesión de demostración cerrada."); }}>Cerrar sesión</button></div><button type="button" className="edu-login-again" onClick={() => { setLoggedIn(true); setPanel(""); showToast("Sesión de demostración iniciada."); }}>Volver a iniciar sesión</button></div>}

          {panel === "upgrade" && <div className="edu-upgrade-panel"><span><GraduationCap /></span><h3>Continúa aprendiendo a tu ritmo</h3><p>Explora cursos en distintas áreas y guarda tus favoritos para volver cuando quieras.</p><ul><li><Check />Rutas de aprendizaje por tema</li><li><Check />Seguimiento de tus cursos</li><li><Check />Certificados de muestra al completar módulos</li></ul><button type="button" className="edu-primary-button" onClick={() => openPanel("explore")}>Explorar cursos <ArrowRight /></button></div>}

          {currentCourse && <div className="edu-course-detail"><div className={"edu-course-detail-art edu-course-art--" + currentCourse.accent}><currentCourse.Icon /></div><div className="edu-course-detail-tags"><span>{currentCourse.category}</span><span>{currentCourse.hours}</span><span><Star />{currentCourse.rating} ({currentCourse.learners})</span></div><p>Aprende con ejercicios guiados y avanza paso a paso junto a {currentCourse.instructor}. Este curso incluye lecciones breves, actividades prácticas y seguimiento de tu progreso.</p><div className="edu-course-detail-instructor"><span className="edu-instructor-avatar">{currentCourse.instructor.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><strong>{currentCourse.instructor}</strong><small>Instructora de EduLMS</small></span></div><h3 className="edu-panel-subtitle">Contenido del curso</h3>{["Introducción y objetivos", "Conceptos fundamentales", "Práctica guiada", "Proyecto de cierre"].map((lesson, index) => <div className="edu-lesson-row" key={lesson}><span className={index === 0 ? "is-done" : ""}>{index === 0 ? <Check /> : <Play />}</span><span><strong>{lesson}</strong><small>Lección {index + 1} · {index === 2 ? "12" : "8"} min</small></span><span>{index === 0 ? "Completada" : "Disponible"}</span></div>)}<button type="button" className="edu-primary-button edu-course-continue" onClick={() => continueCourse(currentCourse)}>{playing ? "Continuar clase" : "Comenzar curso"} <ArrowRight /></button></div>}
        </div>
      </section>
    </div>}

    {toast && <div className="edu-toast" role="status"><Check aria-hidden="true" /><span>{toast}</span><button type="button" aria-label="Cerrar aviso" onClick={() => setToast("")}><X /></button></div>}
  <footer className="edu-footer">
    <a className="edu-footer-brand" href="/Plataformaeducativa"><GraduationCap /><span>EduLMS</span></a>
    <p>Aprende a tu ritmo y avanza hacia tus metas.</p>
    <nav aria-label="Enlaces del pie de página">
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Inicio</button>
      <button type="button" onClick={() => openPanel("explore")}>Explorar cursos</button>
      <a href="/asistenteconIA">Asistente IA</a>
    </nav>
    <small>© {new Date().getFullYear()} EduLMS · Interfaz de demostración</small>
  </footer>
  </div>;
}

export default EduLMSPage;
