<script>
/* ===== LOGIN ===== */
const USERS={gmelendez:"noc2025",admin:"admin123"};
let currentUser=null;

function login(){
  const u=document.getElementById("loginUser").value.trim();
  const p=document.getElementById("loginPass").value.trim();
  if(USERS[u]&&USERS[u]===p){
    localStorage.setItem("session",u);
    iniciar();
  }else alert("❌ Credenciales incorrectas");
}

function iniciar(){
  currentUser = localStorage.getItem("session");
  if(!currentUser) return;

  loginCard.classList.add("hidden");
  app.classList.remove("hidden");
  topbar.classList.remove("hidden");

  // nombre por defecto según usuario logueado
  const nombres = {
    gmelendez: "GUILLERMO MELENDEZ",
    admin: "ADMINISTRADOR"
  };

  if(nombres[currentUser]){
    document.getElementById("quien").value = nombres[currentUser];
  }

  cargarPresets();
  mostrarHistorial();
}

function logout(){
  localStorage.removeItem("session");
  location.reload();
}

/* ===== PRESETS ===== */
const PRESETS_BASE=[
"Cliente reporta enlace caído, luego de validación, se solicita descartes a cliente. Posterior a reinicio eléctrico el servicio restablece.",
"En validación del enlace reportado, se identificó servicio operativo posterior a reinicio eléctrico aplicado sobre equipo en sitio.",
"Servicio afectado por corte de fibra ocasionado por incidente externo. Servicio restablecido.",
"Cliente solicita limpieza DHCP y ARP. Se realiza lo solicitado por cliente."
];

function cargarPresets(){
  preset.innerHTML="<option></option>";
  let custom=JSON.parse(localStorage.getItem("presets_"+currentUser)||"[]");
  [...PRESETS_BASE,...custom].forEach(p=>preset.innerHTML+=`<option>${p}</option>`);
}
function usarPreset(){
  solucion.value = preset.value;
  autoGrow(solucion);
}

function guardarPreset(){
  if(!solucion.value)return;
  let p=JSON.parse(localStorage.getItem("presets_"+currentUser)||"[]");
  p.push(solucion.value);
  localStorage.setItem("presets_"+currentUser,JSON.stringify([...new Set(p)]));
  cargarPresets();
}
function editarPreset(){
  let p=JSON.parse(localStorage.getItem("presets_"+currentUser)||"[]");
  let i=p.indexOf(preset.value);
  if(i<0)return alert("Solo presets guardados");
  p[i]=solucion.value;
  localStorage.setItem("presets_"+currentUser,JSON.stringify(p));
  cargarPresets();
}
function eliminarPreset(){
  let p=JSON.parse(localStorage.getItem("presets_"+currentUser)||"[]");
  if(!p.includes(preset.value))return alert("No se puede eliminar preset base");
  p=p.filter(x=>x!==preset.value);
  localStorage.setItem("presets_"+currentUser,JSON.stringify(p));
  preset.value="";solucion.value="";
  cargarPresets();
}

/* ================= CAUSAS ================= */

const CAUSAS_FALLA = [
"Router inhibido",
"Obstrucción en el rectificador",
"Degradación",
"Red de cliente",
"Saturación",
"Puerto LAN desconectado",
"Energía interna",
"Router inhibido",
"Hardware  dañado en nodo",
"BUG en elemento de red",
"Atenuación",
"Falla en la red de transmisión",
"Firmware dañado",
"Conectividad",
"Equipo inhibido en nodo dependiente",
"Falla en equipo de fuerza en nodo dependiente",
"Patchcord dañado",
"Interfaz inhibida en nodo",
"Hardware dañado en nodo",
"Retiro de equipos por parte de cliente",
"Componente óptico dañado",
"Degradación en salida internacional",
"Power injector inhibido",
"Aparato telefónico de cliente dañado",
"Corte de fibra óptica"
];

const CAUSAS_SOL = [
"Limpieza DHCP y ARP",
"Sincronización en VERSA de CPE",
"Habilitación de sitios web",
"Cambio de DNS",
"Cambio a perfil de navegación",
"Apertura de puertos",
"Solicitud de información",
"Solicitud de configuración",
"Configuración de URL",
"Validación de configuración",
"Solicitud de monitoreo",
"Configuración de VLAN",
"Incremento ancho de banda",
"Decremento ancho de banda",
"Falla con aparato telefonico",
"Configurar VPN",
"Creación de usuarios VPN",
"Vista de monitoreo",
"Creación de usuarios LDAP",
"Registro DNS",
"RFO",
"Creación de usuarios Orion",
"Reserva de IP y MAC"
];

function actualizarCausas(){
  causa.innerHTML = "<option></option>";
  let lista = reporte.value === "FALLA" ? CAUSAS_FALLA : CAUSAS_SOL;
  lista.forEach(c => causa.innerHTML += `<option>${c}</option>`);
}

/* ===== OUTPUT ===== */
function generar(){
  if(!hora.value)return alert("Seleccione fecha y hora");
  const d=new Date(hora.value);
  const fecha =
  String(d.getDate()).padStart(2,"0") + "/" +
  String(d.getMonth()+1).padStart(2,"0") + "/" +
  d.getFullYear() + " - " +
  String(d.getHours()).padStart(2,"0") + ":" +
  String(d.getMinutes()).padStart(2,"0") + " H";

  const texto=[
    quien.value,area.value,producto.value,transporte.value,reporte.value,
    depto.value,medio.value,causa.value,solucion.value,fecha
  ].join(" | ");
  resultado.value=texto;
  guardarHistorial(texto);
}

function copiar(){
  resultado.select();
  navigator.clipboard.writeText(resultado.value);
}

/* ===== HISTORIAL ===== */
function guardarHistorial(t){
  let h=JSON.parse(localStorage.getItem("hist_"+currentUser)||"[]");
  h.unshift(t);
  localStorage.setItem("hist_"+currentUser,JSON.stringify(h));
  mostrarHistorial();
}
function mostrarHistorial(f=""){
  let h=JSON.parse(localStorage.getItem("hist_"+currentUser)||"[]");
  historial.innerHTML="<h3>📜 Historial</h3>";
  h.filter(x=>x.toLowerCase().includes(f.toLowerCase()))
   .forEach(r=>historial.innerHTML+=`<div class='registro'>${r}</div>`);
}
function buscar(v){mostrarHistorial(v);}
function exportarCSV(){
  let h=JSON.parse(localStorage.getItem("hist_"+currentUser)||"[]");
  let a=document.createElement("a");
  a.href="data:text/csv;charset=utf-8,"+h.join("\n");
  a.download="historial_noc.csv";
  a.click();
}
function limpiarHistorial(){
  if(!confirm("⚠️ ¿Seguro que deseas eliminar todo el historial? Esta acción no se puede deshacer.")){
    return;
  }
  localStorage.removeItem("hist_" + currentUser);
  mostrarHistorial();
}
function toggleDark(){
  document.body.classList.toggle("dark");
  actualizarFavicon();
}
function actualizarFavicon(){
  const esOscuro = document.body.classList.contains("dark");

  // Cambiar favicon del navegador
  const favicon = document.getElementById("favicon");
  favicon.href = esOscuro ? "favicon2.ico" : "favicon.ico";

  // Cambiar todos los logos visibles
  document.querySelectorAll(".logo").forEach(img=>{
    img.src = esOscuro ? "favicon2.ico" : "favicon.ico";
  });
}

/* AUTO CRECER SOLUCIÓN (horizontal + vertical) */
const solucion = document.getElementById("solucion");

function autoGrow(el){
  // Reset
  el.style.height = "auto";
  el.style.width  = "100%";

  // Vertical
  el.style.height = el.scrollHeight + "px";

  // Horizontal (solo si el contenido lo necesita)
  if(el.scrollWidth > el.clientWidth){
    el.style.width = Math.min(el.scrollWidth, el.parentElement.clientWidth) + "px";
  }
}

solucion.addEventListener("input", function(){
  autoGrow(this);
});

/* Auto login */
iniciar();
actualizarFavicon();
</script>
