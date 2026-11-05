import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, ArrowRight, ArrowUpRight, Bell, BusFront, CalendarDays, Check, ChevronDown, Gift, Heart, Hotel, Mail, MapPin, Plane, Search, ShieldCheck, Star, Utensils, UserRound, Users, X, Headphones, Tag } from "lucide-react";
import "./travel-page.css";

const asset=(name)=>"/projects/travel/"+encodeURIComponent(name);
const destinations=[
  {name:"Cancún",country:"México",price:"$129",image:"HOTEL PARADISUS CANCUN.webp",description:"Playas de arena clara, mar turquesa y una amplia oferta de actividades para disfrutar el Caribe."},
  {name:"Cartagena",country:"Colombia",price:"$209",image:"dreams-karibana-cartagena.webp",description:"Historia colonial, calles coloridas y una experiencia costera para descubrir a tu propio ritmo."},
  {name:"Punta Cana",country:"República Dominicana",price:"$149",image:"HOTEL GRAN.webp",description:"Paisajes tropicales, playas amplias y hoteles frente al mar para una escapada de descanso."},
  {name:"Machu Picchu",country:"Perú",price:"$199",image:"MACHUPICHU.webp",description:"Historia andina, montañas imponentes y uno de los destinos más conocidos de Perú."}
];
const hotels=[
  {name:"Hotel Paradisus Cancún",place:"Cancún, México",price:"$129 / noche",rating:"4.8",image:"HOTEL PARADISUS CANCUN.webp"},
  {name:"Hotel Dreams Cartagena",place:"Cartagena, Colombia",price:"$109 / noche",rating:"4.7",image:"dreams-karibana-cartagena.webp"},
  {name:"Hotel Grand Punta Cana",place:"Punta Cana, R. Dominicana",price:"$149 / noche",rating:"4.9",image:"HOTEL GRAN.webp"},
  {name:"Hotel Sol & Mar",place:"San Andrés, Colombia",price:"$119 / noche",rating:"4.8",image:"Experiencias y ofertas del Caribe.webp"}
];
const restaurants=[
  {name:"La Isla Gourmet",place:"Cancún, México",rating:"4.9",image:"ISLA GOURMET.webp"},
  {name:"Trattoria del Mar",place:"Cartagena, Colombia",rating:"4.8",image:"TRACTTORIA DEL MAR.webp"},
  {name:"Sabor Caribeño",place:"Punta Cana, R. Dominicana",rating:"4.7",image:"SABOR CARIBEÑO.webp"}
];
const menu=[
  ["Inicio",null],["Vuelos",Plane],["Buses",BusFront],["Hoteles",Hotel],["Paquetes",Gift],["Restaurantes",Utensils],["Mis reservas",CalendarDays],["Favoritos",Heart]
];
const tabs=[["Vuelos",Plane],["Buses",BusFront],["Hoteles",Hotel],["Paquetes",Gift]];
const sectionText={
  "Vuelos":["Elige ciudades, fechas y pasajeros para consultar opciones de muestra.","Vuelos nacionales e internacionales","Fechas de ida y vuelta","Resultados ilustrativos, sin compra"],
  "Buses":["Consulta rutas terrestres y horarios de ejemplo.","Origen y destino","Fecha y tipo de asiento","Resultados ilustrativos, sin compra"],
  "Hoteles":["Explora alojamientos con ubicación, servicios y tarifas de muestra.","Filtra por destino","Compara estadías","Los precios son referenciales"],
  "Paquetes":["Combina transporte, hospedaje y actividades en itinerarios demostrativos.","Vuelo y hotel","Tours sugeridos","Precios ilustrativos, sin compra"],
  "Restaurantes":["Descubre restaurantes destacados en destinos populares.","Cocina local e internacional","Ubicación y valoración de ejemplo","Fichas informativas"],
  "Mis reservas":["Resumen de un viaje reservado en esta maqueta.","Vuelo a Cancún · 15 ene 2026","2 pasajeros · Confirmada","No representa una compra real"]
};

export default function TravelPage(){
  const [query,setQuery]=useState("");
  const [tab,setTab]=useState("Vuelos");
  const [origin,setOrigin]=useState("");
  const [target,setTarget]=useState("");
  const [depart,setDepart]=useState("");
  const [returnDate,setReturnDate]=useState("");
  const [passengers,setPassengers]=useState("1 adulto");
  const [favorites,setFavorites]=useState([]);
  const [panel,setPanel]=useState(null);
  const [toast,setToast]=useState("");
  const [accountOpen,setAccountOpen]=useState(false);
  const [signedIn,setSignedIn]=useState(true);
  const [email,setEmail]=useState("");
  const accountRef=useRef(null);
  const visibleDestinations=useMemo(()=>{
    const q=query.trim().toLocaleLowerCase("es");
    return q?destinations.filter(d=>(d.name+" "+d.country).toLocaleLowerCase("es").includes(q)):destinations;
  },[query]);

  useEffect(()=>{const previous=document.title;document.title="Agencia de viajes | Programmer Full Stack";return()=>{document.title=previous}},[]);
  useEffect(()=>{if(!toast)return;const id=setTimeout(()=>setToast(""),3200);return()=>clearTimeout(id)},[toast]);
  useEffect(()=>{if(!panel)return;const key=e=>{if(e.key==="Escape")setPanel(null)};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[panel]);
  useEffect(()=>{const click=e=>{if(accountRef.current&&!accountRef.current.contains(e.target))setAccountOpen(false)};document.addEventListener("pointerdown",click);return()=>document.removeEventListener("pointerdown",click)},[]);

  function notice(message){setToast(message)}
  function action(message){setPanel(null);notice("Esto es una muestra: "+message)}
  function openSection(name){
    setAccountOpen(false);
    if(name==="Inicio"){window.scrollTo({top:0,behavior:"smooth"});return}
    if(name==="Favoritos"){setPanel({type:"favorites",title:"Tus destinos favoritos"});return}
    const items=sectionText[name]||sectionText.Vuelos;
    setPanel({type:"section",title:name,description:items[0],items:items.slice(1)});
  }
  function openDestination(item,type="destination"){setPanel({type,title:item.name,item})}
  function searchResults(kind,term=query){
    const source=kind==="hoteles"?hotels:kind==="restaurantes"?restaurants:destinations;
    const q=term.trim().toLocaleLowerCase("es");
    const found=q?source.filter(x=>(x.name+" "+(x.place||x.country||"")).toLocaleLowerCase("es").includes(q)):source;
    setPanel({type:"results",title:kind==="hoteles"?"Hoteles recomendados":kind==="restaurantes"?"Restaurantes destacados":"Destinos populares",description:found.length?"Opciones relacionadas con tu búsqueda.":"No hubo coincidencias exactas; aquí tienes opciones populares.",results:found.length?found:source});
  }
  function submitSearch(e){
    e.preventDefault();
    setPanel({type:"section",title:"Resultados de "+tab.toLocaleLowerCase("es"),description:"Búsqueda de muestra: "+(origin||"cualquier origen")+" → "+(target||"todos los destinos")+" · "+(depart||"fecha flexible")+" · "+passengers+(returnDate?" · regreso "+returnDate:""),items:(sectionText[tab]||sectionText.Vuelos).slice(1)});
  }
  function toggleFavorite(item){
    setFavorites(current=>current.some(x=>x.name===item.name)?current.filter(x=>x.name!==item.name):[...current,item]);
  }
  function profile(which){
    setAccountOpen(false);
    if(which==="profile")setPanel({type:"profile",title:"Perfil de usuario"});
    else if(which==="edit")setPanel({type:"edit",title:"Editar cuenta"});
    else {setSignedIn(which==="login");notice(which==="login"?"Sesión de demostración iniciada.":"Sesión de demostración cerrada.")}
  }
  function subscribe(e){e.preventDefault();setEmail("");notice("Suscripción de muestra completada. No se guardaron datos.");}

  const iconFor=(Icon)=>Icon?<Icon aria-hidden="true"/>:<span className="travel-home-icon" aria-hidden="true">⌂</span>;

  return <div className="travel-app">
    <aside className="travel-sidebar">
      <a className="travel-brand" href="/travel" aria-label="Agencia de viajes"><img src={asset("logo.png")} alt=""/><span>Agencia<br/>de Viajes</span></a>
      <nav className="travel-side-nav" aria-label="Menú principal">{menu.map(([name,Icon],i)=><button type="button" key={name} className={"travel-nav-item"+(!i?" is-active":"")} onClick={()=>openSection(name)}>{iconFor(Icon)}<span>{name}</span></button>)}</nav>
      <button type="button" className="travel-sidebar-promo" onClick={()=>setPanel({type:"promo",title:"Tu próxima aventura"})}><img src={asset("LISTO_PARA_TU_PROXIMA_AVENTURA-removebg-preview2.webp")} alt="Autobús para tu próxima aventura"/><span>¿Listo para<br/>tu próxima<br/>aventura?</span></button>
    </aside>

    <div className="travel-page">
      <header className="travel-topbar">
        <form className="travel-global-search" onSubmit={e=>{e.preventDefault();searchResults("destinos")}}>
          <Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar destinos, hoteles, paquetes..." aria-label="Buscar destinos, hoteles o paquetes"/><button aria-label="Buscar"><ArrowRight/></button>
        </form>
        <div className="travel-top-actions">
          <button type="button" className="travel-icon-button notification-button" aria-label="Notificaciones" onClick={()=>setPanel({type:"notifications",title:"Notificaciones"})}><Bell/><i/></button>
          <button type="button" className="travel-icon-button top-favorites" aria-label="Favoritos" onClick={()=>openSection("Favoritos")}><Heart/></button>
          <div className="travel-account" ref={accountRef}>
            <button type="button" className="travel-account-button" aria-expanded={accountOpen} onClick={()=>setAccountOpen(v=>!v)}><span className="travel-avatar"><UserRound/></span><span>User</span><ChevronDown className={accountOpen?"is-rotated":""}/></button>
            {accountOpen&&<div className="travel-user-menu" role="menu"><strong>Cuenta de demostración</strong><button role="menuitem" onClick={()=>profile("profile")}><UserRound/>Perfil</button><button role="menuitem" onClick={()=>profile("edit")}><Mail/>Editar cuenta</button><button role="menuitem" onClick={()=>profile(signedIn?"logout":"login")}>{signedIn?<ArrowRight/>:<Check/>}{signedIn?"Cerrar sesión":"Iniciar sesión"}</button></div>}
          </div>
        </div>
      </header>

      <div className="travel-layout">
        <main className="travel-main" id="travel-home">
          <section className="travel-hero">
            <img className="travel-hero-image" src={asset("portada agencia DESCUBRE EL MUNDO CON NOSOSTROS.webp")} alt=""/>
            <div className="travel-hero-copy"><img className="travel-hero-logo" src={asset("logo.png")} alt="Agencia de viajes"/><h1>Descubre el mundo<br/><span>con nosotros</span></h1><p>Vuelos, hoteles, buses, paquetes y experiencias inolvidables en un solo lugar.</p></div>
            <form className="travel-booking" onSubmit={submitSearch}>
              <div className="travel-tabs" role="tablist" aria-label="Tipo de viaje">{tabs.map(([label,Icon])=><button type="button" role="tab" aria-selected={tab===label} className={tab===label?"is-selected":""} key={label} onClick={()=>setTab(label)}><Icon/>{label}</button>)}</div>
              <div className="travel-booking-fields">
                <label className="travel-field"><MapPin/><span><b>Origen</b><input value={origin} onChange={e=>setOrigin(e.target.value)} placeholder="Ciudad de salida"/></span></label>
                <button type="button" className="travel-swap" aria-label="Intercambiar origen y destino" onClick={()=>{setOrigin(target);setTarget(origin)}}><ArrowLeftRight/></button>
                <label className="travel-field"><MapPin/><span><b>Destino</b><input value={target} onChange={e=>setTarget(e.target.value)} placeholder="Ciudad de llegada"/></span></label>
                <label className="travel-field travel-date-field"><CalendarDays/><span><b>Fecha de ida</b><input type="date" value={depart} onChange={e=>setDepart(e.target.value)} aria-label="Fecha de ida"/></span></label>
                <label className="travel-field travel-date-field"><CalendarDays/><span><b>Fecha de vuelta</b><input type="date" value={returnDate} onChange={e=>setReturnDate(e.target.value)} aria-label="Fecha de vuelta"/></span></label>
                <label className="travel-field travel-passengers"><Users/><span><b>Pasajeros</b><select value={passengers} onChange={e=>setPassengers(e.target.value)} aria-label="Cantidad de pasajeros"><option>1 adulto</option><option>2 adultos</option><option>3 adultos</option><option>Familia</option></select></span></label>
                <button className="travel-search-submit" aria-label="Buscar opciones"><Search/></button>
              </div>
            </form>
          </section>

          <section className="travel-services" aria-label="Servicios">{[[Plane,"Vuelos","Nacionales e internacionales"],[BusFront,"Buses","Viaja por todo el país"],[Hotel,"Hoteles","Las mejores estadías"],[Gift,"Paquetes","Viajes completos"],[Utensils,"Restaurantes","Descubre la gastronomía"]].map(([Icon,name,copy])=><button type="button" className="travel-service" key={name} onClick={()=>openSection(name)}><span><Icon/></span><b>{name}</b><small>{copy}</small></button>)}</section>

          <section className="travel-section">
            <div className="travel-section-heading"><div><h2>Destinos populares</h2><p>Encuentra un lugar para tu próxima aventura.</p></div><button type="button" className="travel-text-link" onClick={()=>searchResults("destinos")}>Ver todos los destinos <ArrowRight/></button></div>
            <div className="travel-destination-grid">{visibleDestinations.map(item=><article className="travel-destination-card" key={item.name}><button type="button" className="travel-destination-open" onClick={()=>openDestination(item)} aria-label={"Ver destino "+item.name}><img src={asset(item.image)} alt={item.name+", "+item.country} loading="lazy"/><span className="travel-destination-detail"><b>{item.name}</b><small>{item.country}</small><em>Desde {item.price}</em></span></button><button type="button" className={"travel-favorite-button"+(favorites.some(x=>x.name===item.name)?" is-favorite":"")} aria-pressed={favorites.some(x=>x.name===item.name)} aria-label="Agregar o quitar de favoritos" onClick={()=>toggleFavorite(item)}><Heart fill={favorites.some(x=>x.name===item.name)?"currentColor":"none"}/></button></article>)}{!visibleDestinations.length&&<p className="travel-no-results">No hay destinos con ese nombre. Prueba Cancún, Cartagena o Machu Picchu.</p>}</div>
          </section>

        </main>

        <aside className="travel-right-rail" aria-label="Información de viaje">
          <button type="button" className="travel-rail-package" onClick={()=>setPanel({type:"package",title:"Paquetes turísticos"})}><span className="travel-rail-package-copy"><b>Paquetes<br/>turísticos</b><small>Todo incluido a los mejores destinos</small><strong>Ver paquetes <ArrowRight/></strong></span><img src={asset("PAQUETES TURISTICOS.webp")} alt="Maleta para viajar" loading="lazy"/></button>
          <button type="button" className="travel-reservation-card" onClick={()=>openSection("Mis reservas")}><span><CalendarDays/>Tus reservas<ArrowUpRight/></span><b><Plane/><span>Vuelo a Cancún<small>15 Ene 2026 · 2 Pasajeros</small></span><em><Check/> Confirmada</em></b></button>
          <button type="button" className="travel-rail-offer" onClick={()=>setPanel({type:"offer",title:"Ofertas especiales"})}><span className="travel-rail-offer-heading"><Tag/><b>Ofertas especiales</b></span><span className="travel-rail-offer-image"><img src={asset("OFERTAS ESPECIALES.webp")} alt="Hotel y piscina en el Caribe" loading="lazy"/><em>Hasta<br/><b>30%</b><br/>DTO</em></span><span className="travel-rail-offer-copy"><b>Hoteles en<br/>el Caribe</b><small>Reserva hoy y disfruta de descuentos exclusivos.</small><strong>Ver ofertas <ArrowRight/></strong></span></button>
        </aside>
      </div>

      <div className="travel-lower">
          <section className="travel-promo-row">
            <button type="button" className="travel-package-banner" onClick={()=>setPanel({type:"package",title:"Paquete a Riviera Maya"})}><img src={asset("PAQUETE A RIVERA MAYA.webp")} alt="Paquete de muestra a Riviera Maya" loading="lazy"/><span className="travel-package-overlay"><small>Oferta del mes</small><b>Paquete a<br/>Riviera Maya</b><span><Plane/> Vuelo <Hotel/> Hotel <BusFront/> Tours</span><strong>Desde $599 USD</strong></span></button>
            <section className="travel-benefits"><h2>¿Por qué viajar con nosotros?</h2><div>{[[ShieldCheck,"Reservas seguras","y confiables"],[Headphones,"Atención","24/7"],[Tag,"Mejores precios","garantizados"],[Gift,"Promociones","exclusivas"]].map(([Icon,title,copy])=><article key={title}><span><Icon/></span><b>{title}<small>{copy}</small></b></article>)}</div></section>
          </section>

        <div className="travel-content-sections">
          <section className="travel-section">
            <div className="travel-section-heading"><div><h2>Hoteles recomendados</h2><p>Estadías de muestra en destinos populares.</p></div><button type="button" className="travel-text-link" onClick={()=>searchResults("hoteles")}>Ver más hoteles <ArrowRight/></button></div>
            <div className="travel-hotel-grid">{hotels.map(item=><button type="button" className="travel-hotel-card" key={item.name} onClick={()=>openDestination(item,"hotel")}><span className="travel-hotel-image"><img src={asset(item.image)} alt="" loading="lazy"/><em><Star fill="currentColor"/>{item.rating}</em></span><b>{item.name}</b><small><MapPin/>{item.place}</small><strong>Desde {item.price}</strong></button>)}</div>
          </section>

          <section className="travel-section travel-restaurants-section">
            <div className="travel-section-heading"><div><h2>Restaurantes destacados</h2><p>Sabores para acompañar tu viaje.</p></div><button type="button" className="travel-text-link" onClick={()=>searchResults("restaurantes")}>Ver más <ArrowRight/></button></div>
            <div className="travel-restaurant-grid">{restaurants.map(item=><button type="button" className="travel-restaurant-card" key={item.name} onClick={()=>openDestination(item,"restaurant")}><span className="travel-restaurant-image"><img src={asset(item.image)} alt="" loading="lazy"/><em><Star fill="currentColor"/>{item.rating}</em></span><b>{item.name}</b><small><MapPin/>{item.place}</small></button>)}</div>
          </section>
        </div>

          <form className="travel-newsletter" onSubmit={subscribe}><span className="travel-newsletter-icon"><Mail/></span><div><h2>Recibe las mejores ofertas<br/>en tu correo</h2><p>Ideas de viaje y promociones de muestra.</p></div><label><Mail/><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Tu correo electrónico" aria-label="Tu correo electrónico"/></label><button>{email?"Suscribirme":"Suscribirme"} <ArrowRight/></button><svg className="travel-flight-path" viewBox="0 0 320 90" aria-hidden="true" focusable="false"><defs><linearGradient id="travelNewsletterFlightFade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="currentColor" stopOpacity=".85"/><stop offset=".72" stopColor="currentColor" stopOpacity=".55"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><path d="M8 57 C39 13 73 78 111 45 S177 17 209 48 S264 72 309 29" fill="none" stroke="url(#travelNewsletterFlightFade)" strokeWidth="2.6" strokeDasharray="1 9" strokeLinecap="round"/></svg><Plane className="travel-newsletter-plane"/></form>

          <footer className="travel-footer"><a className="travel-footer-brand" href="/travel">Agencia de viajes <Plane/></a><span>Explora destinos, hospedajes y experiencias.</span><small>Interfaz de muestra: no se realizan reservas ni cargos.</small><a href="#travel-home">Volver arriba <ArrowUpRight/></a></footer>
      </div>
    </div>

    {panel&&<div className="travel-panel-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setPanel(null)}}><section className={"travel-panel travel-panel--"+panel.type} role="dialog" aria-modal="true" aria-labelledby="travel-panel-title"><header className="travel-panel-header"><div><small>AGENCIA DE VIAJES · MUESTRA</small><h2 id="travel-panel-title">{panel.title}</h2></div><button type="button" className="travel-panel-close" aria-label="Cerrar panel" onClick={()=>setPanel(null)}><X/></button></header><div className="travel-panel-content">
      {["destination","hotel","restaurant"].includes(panel.type)&&<article className="travel-detail"><img src={asset(panel.item.image)} alt=""/><div><small>{panel.item.country||panel.item.place}</small><h3>{panel.item.name}</h3><p>{panel.item.description||"Una opción de muestra con ubicación, servicios y detalles para planear tu visita."}</p>{panel.item.price&&<strong>Desde {panel.item.price}</strong>}<button type="button" className="travel-panel-primary" onClick={()=>action("la ficha de "+panel.item.name+" es una muestra.")}>Ir al destino <ArrowRight/></button><small className="travel-demo-note">No se realiza una reserva ni un pago.</small></div></article>}
      {panel.type==="results"&&<div className="travel-panel-results"><p>{panel.description}</p>{panel.results.map(item=><button type="button" key={item.name} onClick={()=>openDestination(item)}><img src={asset(item.image)} alt=""/><span><b>{item.name}</b><small>{item.country||item.place}</small></span><ArrowUpRight/></button>)}</div>}
      {["section","search","notifications"].includes(panel.type)&&<div className="travel-panel-section"><p>{panel.description||"Avisos de muestra para que explores las funciones de la agencia."}</p><ul>{(panel.items||["Nueva oferta de temporada disponible","Tu viaje de muestra a Cancún está confirmado","Guarda destinos con el corazón"]).map(item=><li key={item}><Check/>{item}</li>)}</ul><button type="button" className="travel-panel-primary" onClick={()=>action("las opciones de "+panel.title.toLocaleLowerCase("es")+" se mostrarían aquí.")}>Ver opciones <ArrowRight/></button><small className="travel-demo-note">Los datos y tarifas son ilustrativos.</small></div>}
      {panel.type==="favorites"&&<div className="travel-panel-section"><p>{favorites.length?"Destinos guardados durante esta visita.":"Aún no guardaste destinos. Pulsa el corazón de una tarjeta para agregar uno."}</p>{favorites.map(item=><button className="travel-favorite-row" type="button" key={item.name} onClick={()=>openDestination(item)}><img src={asset(item.image)} alt=""/><span><b>{item.name}</b><small>{item.country}</small></span><ArrowRight/></button>)}</div>}
      {panel.type==="profile"&&<div className="travel-profile"><span className="travel-profile-avatar"><UserRound/></span><div><b>User</b><small>Cuenta de demostración</small><p>Perfil de muestra para explorar los controles.</p></div><button type="button" className="travel-panel-primary" onClick={()=>profile("edit")}>Editar cuenta <ArrowRight/></button></div>}
      {panel.type==="edit"&&<form className="travel-edit-form" onSubmit={e=>{e.preventDefault();setPanel(null);notice("La cuenta de muestra fue actualizada.")}}><label>Nombre<input defaultValue="User"/></label><label>Correo electrónico<input type="email" defaultValue="user@example.com"/></label><label>Preferencia de viaje<select defaultValue="playa"><option value="playa">Playa y descanso</option><option value="cultura">Cultura e historia</option><option value="aventura">Aventura</option></select></label><button className="travel-panel-primary">Guardar cambios <Check/></button><small className="travel-demo-note">Los cambios solo viven en esta demostración.</small></form>}
      {["package","offer","promo"].includes(panel.type)&&<div className="travel-feature-panel"><img src={asset(panel.type==="package"?"PAQUETE A RIVERA MAYA.webp":panel.type==="offer"?"OFERTAS ESPECIALES.webp":"LISTO_PARA_TU_PROXIMA_AVENTURA-removebg-preview2.webp")} alt=""/><p>{panel.type==="package"?"Propuesta ilustrativa con vuelo, hospedaje y tours para explorar la Riviera Maya.":panel.type==="offer"?"Promociones de muestra para hospedajes y escapadas del Caribe.":"Cuéntanos qué tipo de viaje te gustaría planear y descubre destinos de ejemplo."}</p><button type="button" className="travel-panel-primary" onClick={()=>action("el flujo de cotización continuaría aquí.")}>Ver opciones <ArrowRight/></button><small className="travel-demo-note">Precios ilustrativos; no se procesan pagos.</small></div>}
    </div></section></div>}
    {toast&&<div className="travel-toast" role="status"><Check/>{toast}<button type="button" aria-label="Cerrar aviso" onClick={()=>setToast("")}><X/></button></div>}
  </div>;
}
