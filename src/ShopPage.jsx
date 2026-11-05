import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft, ArrowRight, BadgePercent, BriefcaseBusiness, Check, ChevronDown,
  ChevronLeft, ChevronRight, CreditCard, Gamepad2, Headphones, Heart, House,
  Laptop, Layers3, Menu, Minus, PackageCheck, Play, Plus, Search, ShieldCheck,
  ShoppingBag, ShoppingCart, Smartphone, Sparkles, Star, Trash2, Truck,
  UserRound, X
} from "lucide-react";
import "./shop-page.css";

const categories = [
  ["Todas", Layers3],
  ["Computadoras", Laptop],
  ["Celulares", Smartphone],
  ["Audio", Headphones],
  ["Videojuegos", Gamepad2],
  ["Hogar inteligente", House],
  ["Accesorios", Sparkles],
  ["Oficina", BriefcaseBusiness]
];

const rawProducts = [
  ["Computadoras", "Laptop Pro 14″", "16 GB RAM · 512 GB SSD", 16999, 4.8, 326, "laptop", "-15%", "", false],
  ["Celulares", "Smartphone X Pro", "256 GB · Cámara de 48 MP", 13999, 4.9, 512, "phone", "", "Nuevo", true],
  ["Audio", "Audífonos NoiseCancel", "Cancelación de ruido · Bluetooth 5.3", 2399, 4.7, 1204, "headphones", "-20%", "", false],
  ["Accesorios", "Smartwatch Active", "Monitor de actividad · GPS", 2499, 4.6, 521, "smartwatch", "-10%", "", false],
  ["Videojuegos", "Control inalámbrico Pro", "Compatible con PC · Bluetooth", 1799, 4.8, 645, "controller", "-10%", "", false],
  ["Computadoras", "Laptop Creator 16", "32 GB RAM · 1 TB SSD", 26999, 4.9, 188, "laptop", "", "Nuevo", true],
  ["Celulares", "Smartphone Lite 128 GB", "Pantalla AMOLED · Doble SIM", 7499, 4.6, 411, "phone", "-12%", "", false],
  ["Audio", "Audífonos Studio Pro", "Audio de alta resolución · Micrófono", 3299, 4.8, 733, "headphones", "", "", false],
  ["Oficina", "Teclado mecánico RGB", "Distribución español · USB-C", 1599, 4.7, 892, "keyboard", "-15%", "", false],
  ["Accesorios", "Mouse inalámbrico 8K", "Sensor preciso · Batería recargable", 899, 4.6, 620, "mouse", "", "Nuevo", true],
  ["Computadoras", "Laptop esencial 15″", "8 GB RAM · SSD 512 GB", 11999, 4.5, 284, "laptop", "-8%", "", false],
  ["Celulares", "Smartphone compacto", "128 GB · Carga rápida", 5899, 4.5, 379, "phone", "", "", false],
  ["Audio", "Audífonos inalámbricos Air", "Estuche de carga · Controles táctiles", 1299, 4.4, 1206, "headphones", "-10%", "", false],
  ["Videojuegos", "Control inalámbrico blanco", "Vibración háptica · USB-C", 1899, 4.8, 403, "controller", "", "", false],
  ["Oficina", "Tablet Air 11″", "256 GB · Compatible con stylus", 8899, 4.7, 352, "tablet", "-12%", "", false],
  ["Accesorios", "Cámara digital compacta", "Zoom óptico · Video Full HD", 6499, 4.6, 193, "camera", "", "Nuevo", true],
  ["Oficina", "Webcam 4K Stream", "Autoenfoque · Micrófono dual", 2199, 4.7, 548, "webcam", "-15%", "", false],
  ["Hogar inteligente", "Asistente inteligente", "Control por voz · Wi-Fi", 1499, 4.5, 760, "robot", "", "", false],
  ["Computadoras", "Teclado compacto inalámbrico", "Mecánico · Retroiluminación RGB", 1899, 4.6, 291, "keyboard", "", "", false],
  ["Computadoras", "Laptop Pro 14″ edición Plus", "16 GB RAM · 1 TB SSD", 18999, 4.8, 217, "laptop", "", "Nuevo", true],
  ["Celulares", "Smartphone X Pro Max", "512 GB · Pantalla OLED", 17999, 4.9, 394, "phone", "-8%", "", false],
  ["Videojuegos", "Control inalámbrico edición Nova", "PC · Android · Conexión Bluetooth", 1599, 4.6, 272, "controller", "-10%", "", false],
  ["Oficina", "Tablet Pro para diseño", "Pantalla de alta resolución · 128 GB", 10999, 4.8, 166, "tablet", "", "", false],

  ["Oficina", "Cámara para videollamadas", "Enfoque automático · Tapa de privacidad", 1299, 4.5, 401, "webcam", "", "", false],
  ["Hogar inteligente", "Robot asistente Mini", "Rutinas y control de dispositivos", 1799, 4.4, 238, "robot", "-8%", "", false],
  ["Computadoras", "Laptop Studio 14″", "Intel Core · 16 GB RAM · 1 TB SSD", 22999, 4.8, 124, "laptop", "", "", false],
  ["Audio", "Audífonos plegables Travel", "Batería de larga duración · Bluetooth", 1699, 4.6, 694, "headphones", "", "Nuevo", true],
  ["Celulares", "Smartphone Nova 5G", "256 GB · Cámara triple", 9999, 4.7, 281, "phone", "-10%", "", false],
  ["Videojuegos", "Control inalámbrico compacto", "Compatible con PC · Baja latencia", 1199, 4.5, 319, "controller", "", "", false],
  ["Oficina", "Teclado numérico inalámbrico", "Teclas silenciosas · USB-C", 649, 4.4, 195, "keyboard", "", "", false],
  ["Accesorios", "Mouse Pro recargable", "Sensor óptico · Diseño ambidiestro", 799, 4.5, 256, "mouse", "-12%", "", false],
  ["Hogar inteligente", "Asistente de escritorio AI", "Voz inteligente · Luz ambiental", 2299, 4.7, 144, "robot", "", "Nuevo", true]
];


const productImageByName = {"Laptop Pro 14″": "laptop-pro-14", "Smartphone X Pro": "celulares", "Audífonos NoiseCancel": "audifonos-noisecancel", "Smartwatch Active": "smartwatch-active", "Control inalámbrico Pro": "control-inalambrico-pro", "Laptop Creator 16": "laptop-creator-16", "Smartphone Lite 128 GB": "smartphone-lite-128-gb", "Audífonos Studio Pro": "audifonos-studio-pro", "Teclado mecánico RGB": "teclado-mecanico-rgb", "Mouse inalámbrico 8K": "mouse-inalambrico-8k", "Laptop esencial 15″": "laptop-esencial-15", "Smartphone compacto": "smartphone-compacto", "Audífonos inalámbricos Air": "audifonos-inalambricos-air", "Control inalámbrico blanco": "control-inalambrico-blanco", "Tablet Air 11″": "tablet-air-11", "Cámara digital compacta": "images-removebg-preview", "Webcam 4K Stream": "webcam-4k-stream", "Asistente inteligente": "asistente-inteligente", "Teclado compacto inalámbrico": "teclado-compacto-inalambrico", "Laptop Pro 14″ edición Plus": "laptop-pro-14-edicion-plus", "Smartphone X Pro Max": "smartphone-x-pro-max", "Control inalámbrico edición Nova": "control-inalambrico-edicion-nova", "Tablet Pro para diseño": "tablet-pro-para-diseno", "Cámara para videollamadas": "camara-para-videollamadas", "Robot asistente Mini": "robot-asistente-mini", "Laptop Studio 14″": "laptop-studio-14", "Audífonos plegables Travel": "audifonos-plegables-travel", "Smartphone Nova 5G": "smartphone-nova-5g", "Control inalámbrico compacto": "control-inalambrico-compacto", "Teclado numérico inalámbrico": "teclado-numerico-inalambrico", "Mouse Pro recargable": "mouse-pro-recargable", "Asistente de escritorio AI": "asistente-de-escritorio-ai"};
const products = rawProducts.map((item, index) => ({
  id: "shop-product-" + productImageByName[item[1]],
  category: item[0],
  name: item[1],
  detail: item[2],
  price: item[3],
  rating: item[4],
  reviews: item[5],
  image: productImageByName[item[1]] || item[6],
  discount: item[7],
  badge: item[8],
  isNew: item[9]
}));

const money = (amount) => new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0
}).format(amount);

function readSavedCart() {
  try {
    return JSON.parse(window.localStorage.getItem("shoppro-cart-v2") || "{}");
  } catch {
    return {};
  }
}

export default function ShopPage({ onClose }) {
  const [category, setCategory] = useState("Todas");
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState("all");
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState(readSavedCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [demoOpen, setDemoOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const toastTimer = useRef(0);
  const searchRef = useRef(null);

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const keydown = (event) => {
      if (event.key !== "Escape") return;
      if (demoOpen) setDemoOpen(false);
      else if (cartOpen) setCartOpen(false);
      else onClose();
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", keydown);
      window.clearTimeout(toastTimer.current);
    };
  }, [onClose, demoOpen, cartOpen]);

  useEffect(() => {
    window.localStorage.setItem("shoppro-cart-v2", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    setPage(1);
  }, [category, query, collection]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    return products.filter((item) => {
      const matchesCategory = category === "Todas" || item.category === category;
      const matchesQuery = !normalized || [item.name, item.detail, item.category]
        .join(" ").toLocaleLowerCase("es").includes(normalized);
      const matchesCollection = collection === "all" ||
        (collection === "offers" && Boolean(item.discount)) ||
        (collection === "new" && item.isNew) ||
        (collection === "favorites" && favorites.includes(item.id));
      return matchesCategory && matchesQuery && matchesCollection;
    });
  }, [category, query, collection, favorites]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / 25));
  const pageItems = filtered.slice((page - 1) * 25, page * 25);
  const cartEntries = Object.entries(cart).map(([id, quantity]) => ({
    product: products.find((item) => item.id === id),
    quantity
  })).filter((entry) => entry.product && entry.quantity > 0);
  const cartCount = cartEntries.reduce((count, entry) => count + entry.quantity, 0);
  const subtotal = cartEntries.reduce((total, entry) => total + entry.product.price * entry.quantity, 0);

  function notify(message) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3000);
  }

  function addToCart(item) {
    setCart((current) => ({
      ...current,
      [item.id]: (current[item.id] || 0) + 1
    }));
    notify(item.name + " se agregó al carrito");
  }

  function changeQuantity(id, amount) {
    setCart((current) => {
      const next = { ...current, [id]: (current[id] || 0) + amount };
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }

  function removeFromCart(id) {
    setCart((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function toggleFavorite(id) {
    setFavorites((current) => current.includes(id)
      ? current.filter((saved) => saved !== id)
      : [...current, id]);
  }

  function chooseCollection(next) {
    setCollection(next);
    setCategory("Todas");
    setMenuOpen(false);
    document.getElementById("shop-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToProducts() {
    document.getElementById("shop-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function checkout() {
    setOrderComplete(true);
    setCart({});
    setCartOpen(false);
  }

  function finishOrder() {
    setOrderComplete(false);
    notify("Gracias por visitar ShopPro");
  }

  return (
    <div className="shop-page" role="dialog" aria-modal="true" aria-label="Tienda ShopPro">
      <div className="shop-announcement">
        <span><Truck /> Envío gratis en compras mayores a $1,499 MXN</span>
        <span><ShieldCheck /> Soporte 24/7</span>
      </div>

      <header className="shop-header">
        <div className="shop-nav-row">
          <button className="shop-brand" type="button" onClick={scrollToProducts} aria-label="ShopPro, ir a productos">
            <span className="shop-brand-icon"><ShoppingBag /></span><b>ShopPro</b>
          </button>
          <button className="shop-menu-toggle" type="button" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
          <nav className={menuOpen ? "shop-nav is-open" : "shop-nav"} aria-label="Navegación ShopPro">
            <button type="button" className={collection === "all" ? "is-current" : ""} onClick={() => { setCollection("all"); setCategory("Todas"); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Inicio</button>
            <button type="button" onClick={scrollToProducts}>Productos <ChevronDown /></button>
            <button type="button" className={collection === "offers" ? "is-current" : ""} onClick={() => chooseCollection("offers")}>Ofertas <span className="shop-fire">✦</span></button>
            <button type="button" className={collection === "new" ? "is-current" : ""} onClick={() => chooseCollection("new")}>Novedades</button>
            <button type="button" onClick={() => notify("El canal de soporte estará disponible próximamente.")}>Contacto</button>
          </nav>
          <label className="shop-search">
            <Search />
            <input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar productos, marcas o categorías…" aria-label="Buscar productos" />
            <kbd>/</kbd>
          </label>
          <div className="shop-header-actions">
            <button className="shop-action-button" type="button" onClick={() => notify("El perfil de cliente estará disponible próximamente.")} aria-label="Mi cuenta"><UserRound /></button>
            <button className={collection === "favorites" ? "shop-action-button is-active" : "shop-action-button"} type="button" onClick={() => chooseCollection(collection === "favorites" ? "all" : "favorites")} aria-label="Mostrar favoritos"><Heart /><span className="shop-action-dot">{favorites.length || ""}</span></button>
            <button className="shop-action-button cart-trigger" type="button" onClick={() => setCartOpen(true)} aria-label={"Abrir carrito, " + cartCount + " productos"}><ShoppingCart /><span className="shop-cart-count">{cartCount}</span></button>
          </div>
        </div>
        <label className="shop-mobile-search">
          <Search />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar productos y categorías…" aria-label="Buscar productos" />
        </label>
      </header>

      <main className="shop-main">
        <section className="shop-hero" aria-labelledby="shop-hero-title">
          <div className="shop-hero-copy">
            <div className="shop-collection-label"><Sparkles /> Nueva colección 2026</div>
            <p className="shop-eyebrow">TECNOLOGÍA PARA CADA DÍA</p>
            <h1 id="shop-hero-title">Tecnología que<br /><em>mejora tu día</em></h1>
            <p className="shop-hero-description">Descubre los últimos lanzamientos en electrónicos, accesorios y más, con la mejor calidad y garantía.</p>
            <div className="shop-hero-actions">
              <button type="button" className="shop-primary-cta" onClick={scrollToProducts}>Comprar ahora <ArrowRight /></button>
              <button type="button" className="shop-video-cta" onClick={() => setDemoOpen(true)}><Play /> Ver recorrido</button>
            </div>
            <div className="shop-trust-row">
              <span><ShieldCheck /> Garantía oficial</span>
              <span><Truck /> Envío rápido</span>
              <span><CreditCard /> Pagos seguros</span>
            </div>
          </div>
          <div className="shop-hero-offer"><small>Hasta</small><b>30%</b><span>OFF</span></div>
          <div className="shop-hero-dots" aria-label="Colección principal"><i className="is-active" /><i /><i /><i /></div>
        </section>

        <section className="shop-category-strip" aria-label="Categorías de productos">
          {categories.map(([name, Icon]) => (
            <button type="button" key={name} className={category === name ? "shop-category is-active" : "shop-category"} onClick={() => { setCategory(name); setCollection("all"); scrollToProducts(); }}>
              <Icon /><span>{name === "Todas" ? <>Todas las<br />categorías</> : name}</span>
            </button>
          ))}
        </section>

        <section id="shop-products" className="shop-products-section" aria-labelledby="shop-products-title">
          <div className="shop-section-heading">
            <div className="shop-title-with-marker"><span className="shop-heading-marker" /><div>
              <p className="shop-section-kicker">{collection === "offers" ? "PRECIOS ESPECIALES" : collection === "new" ? "ACABAN DE LLEGAR" : collection === "favorites" ? "TU LISTA PERSONAL" : "LO MÁS BUSCADO"}</p>
              <h2 id="shop-products-title">{collection === "offers" ? "Ofertas para ti" : collection === "new" ? "Novedades" : collection === "favorites" ? "Tus favoritos" : "Productos destacados"}</h2>
              <p>{collection === "favorites" ? "Tus artículos guardados para volver a encontrarlos." : "Tecnología seleccionada para trabajar, crear y disfrutar."}</p>
            </div></div>
            <div className="shop-products-tools">
              <span className="shop-product-count">{filtered.length} productos</span>
              <button type="button" className="shop-see-all" onClick={() => { setCollection("all"); setCategory("Todas"); setQuery(""); scrollToProducts(); }}>Ver todos <ArrowRight /></button>
            </div>
          </div>

          <div className="shop-active-filters">
            {category !== "Todas" && <button type="button" onClick={() => setCategory("Todas")}>{category}<X /></button>}
            {query && <button type="button" onClick={() => setQuery("")}>“{query}”<X /></button>}
          </div>

          {pageItems.length ? (
            <div className="shop-product-grid">
              {pageItems.map((item) => {
                const liked = favorites.includes(item.id);
                return <article className="shop-product-card" key={item.id}>
                  <div className="shop-product-image-area">
                    {item.discount && <span className="shop-product-discount">{item.discount}</span>}
                    {item.badge && <span className="shop-product-badge">{item.badge}</span>}
                    <button type="button" className={liked ? "shop-favorite is-liked" : "shop-favorite"} onClick={() => toggleFavorite(item.id)} aria-label={liked ? "Quitar de favoritos" : "Agregar a favoritos"} aria-pressed={liked}><Heart /></button>
                    <img src={"/projects/ecommerce/products/" + item.image + ".webp"} alt={item.name} loading="lazy" decoding="async" />
                  </div>
                  <div className="shop-product-info">
                    <span className="shop-product-category">{item.category}</span>
                    <h3>{item.name}</h3>
                    <p>{item.detail}</p>
                    <div className="shop-product-price-row"><strong>{money(item.price)}</strong>{item.discount && <del>{money(Math.round(item.price * 1.16))}</del>}</div>
                    <div className="shop-product-bottom">
                      <span className="shop-rating"><Star fill="currentColor" /> {item.rating} <small>({item.reviews.toLocaleString("es-MX")})</small></span>
                      <button type="button" className="shop-add-button" onClick={() => addToCart(item)} aria-label={"Agregar " + item.name + " al carrito"}><ShoppingCart /><span>Agregar</span></button>
                    </div>
                  </div>
                </article>;
              })}
            </div>
          ) : (
            <div className="shop-empty"><Search /><strong>No encontramos productos</strong><span>Prueba con otra búsqueda o quita algunos filtros.</span><button type="button" onClick={() => { setQuery(""); setCategory("Todas"); setCollection("all"); }}>Ver catálogo completo</button></div>
          )}

          {filtered.length > 0 && <nav className="shop-pagination" aria-label="Paginación del catálogo">
            <button type="button" aria-label="Página anterior" disabled={page === 1} onClick={() => { setPage((current) => Math.max(1, current - 1)); scrollToProducts(); }}><ChevronLeft /></button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button type="button" key={number} className={page === number ? "is-current" : ""} aria-current={page === number ? "page" : undefined} onClick={() => { setPage(number); scrollToProducts(); }}>{number}</button>)}
            <button type="button" aria-label="Página siguiente" disabled={page === pageCount} onClick={() => { setPage((current) => Math.min(pageCount, current + 1)); scrollToProducts(); }}><ChevronRight /></button>
            <span>Página {page} de {pageCount}</span>
          </nav>}
        </section>

        <section className="shop-service-banner">
          <div><PackageCheck /><span><strong>Tu compra protegida</strong><small>Productos seleccionados y garantía oficial.</small></span></div>
          <div><Truck /><span><strong>Envío sin costo</strong><small>En compras desde $1,499 MXN.</small></span></div>
          <div><CreditCard /><span><strong>Compra con confianza</strong><small>Revisa tu carrito antes de continuar.</small></span></div>
        </section>
      </main>

      <footer className="shop-footer"><button type="button" onClick={onClose}><ArrowLeft /> Volver a proyectos</button><span>ShopPro · Tienda de demostración</span><small>© 2026</small></footer>

      {cartOpen && createPortal(<div className="shop-cart-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
        <aside className="shop-cart-drawer" role="dialog" aria-modal="true" aria-labelledby="shop-cart-title">
          <header><div><p>SHOPPRO</p><h2 id="shop-cart-title">Tu carrito <span>({cartCount})</span></h2></div><button type="button" onClick={() => setCartOpen(false)} aria-label="Cerrar carrito"><X /></button></header>
          <div className="shop-cart-items">
            {cartEntries.length ? cartEntries.map(({ product: item, quantity }) => <article className="shop-cart-item" key={item.id}>
              <img src={"/projects/ecommerce/products/" + item.image + ".webp"} alt="" />
              <div className="shop-cart-item-info"><strong>{item.name}</strong><small>{money(item.price)}</small><div className="shop-quantity"><button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label="Reducir cantidad"><Minus /></button><span>{quantity}</span><button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label="Aumentar cantidad"><Plus /></button></div></div>
              <button type="button" className="shop-remove-item" onClick={() => removeFromCart(item.id)} aria-label={"Quitar " + item.name}><Trash2 /></button>
            </article>) : <div className="shop-cart-empty"><ShoppingBag /><strong>Tu carrito está vacío</strong><span>Agrega productos para verlos aquí.</span><button type="button" onClick={() => setCartOpen(false)}>Explorar productos</button></div>}
          </div>
          <div className="shop-cart-summary">
            <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
            <small>{subtotal >= 1499 ? "Tu pedido incluye envío gratis." : "El envío se calcula al completar la compra."}</small>
            <button type="button" className="shop-checkout" disabled={!cartEntries.length} onClick={checkout}>Continuar compra <ArrowRight /></button>
            <span className="shop-cart-note"><ShieldCheck /> Compra de demostración · No se realiza ningún cobro</span>
          </div>
        </aside>
      </div>, document.body)}

      {demoOpen && createPortal(<div className="shop-demo-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDemoOpen(false); }}>
        <section className="shop-demo-modal" role="dialog" aria-modal="true" aria-labelledby="shop-demo-title"><button type="button" className="shop-demo-close" onClick={() => setDemoOpen(false)} aria-label="Cerrar"><X /></button><span className="shop-demo-play"><Play fill="currentColor" /></span><p>RECORRIDO SHOPPRO</p><h2 id="shop-demo-title">Todo lo que buscas, en un solo lugar</h2><span>Explora categorías, encuentra tus productos favoritos y añádelos al carrito de demostración.</span><button type="button" onClick={() => { setDemoOpen(false); scrollToProducts(); }}>Explorar productos <ArrowRight /></button></section>
      </div>, document.body)}

      {orderComplete && createPortal(<div className="shop-demo-backdrop"><section className="shop-order-modal" role="dialog" aria-modal="true" aria-labelledby="shop-order-title"><span className="shop-order-check"><Check /></span><p>PEDIDO DE PRUEBA</p><h2 id="shop-order-title">¡Gracias por tu compra!</h2><span>El flujo de carrito funciona como demostración. No se procesó ningún pago.</span><button type="button" onClick={finishOrder}>Seguir explorando</button></section></div>, document.body)}

      {toast && createPortal(<div className="shop-toast" role="status"><Check />{toast}<button type="button" onClick={() => setToast("")} aria-label="Cerrar aviso"><X /></button></div>, document.body)}
    </div>
  );
}
