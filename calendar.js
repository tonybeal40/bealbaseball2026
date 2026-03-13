// ...existing code...
(() => {
  const MONTHS = [
    { y: 2026, m: 2, name: "March 2026",  id: "month-march" },
    { y: 2026, m: 3, name: "April 2026",  id: "month-april" },
    { y: 2026, m: 4, name: "May 2026",    id: "month-may"   },
    { y: 2026, m: 5, name: "June 2026",   id: "month-june"  },
    { y: 2026, m: 6, name: "July 2026",   id: "month-july"  }
  ];

  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const esc = (s="") => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':"&quot;","'":"&#39;"}[c]));

  function inRange(dateISO, startISO, endISO){
    return dateISO >= startISO && dateISO <= endISO;
  }

  function occursOnDate(ev, dateISO){
    if (ev.date) return ev.date === dateISO;
    if (ev.startDate && ev.endDate) return inRange(dateISO, ev.startDate, ev.endDate);
    return false;
  }

  function eventClass(ev){
    if (ev.kid === "Breyer") {
      return (ev.team || "").toLowerCase().includes("jv") ? "breyer-jv" : "breyer-varsity";
    }
    return ev.kid.toLowerCase();
  }

  function mapLink(location){
    if (!location || location === "TBD") return "";
    const q = encodeURIComponent(location);
    return `<a target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/?api=1&query=${q}">map</a>`;
  }

  function eventHtml(ev){
    const location = ev.location || "TBD";
    return `
      <div class="event ${eventClass(ev)}">
        <span class="title">${esc(ev.kid)}${ev.team ? ` (${esc(ev.team)})` : ""} - ${esc(ev.title)}</span>
        <span class="meta">${esc(ev.time || "All Day")}</span>
        <span class="meta">${esc(location)} ${mapLink(location)}</span>
      </div>
    `;
  }

  function renderMonth({ y, m, name, id }){
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const days = last.getDate();
    const startWeekday = first.getDay();

    let html = `<section class="month" id="${id}"><h2>${name}</h2><table class="grid"><thead><tr>
      <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
    </tr></thead><tbody><tr>`;

    let cell = 0;
    for (; cell < startWeekday; cell++) html += "<td></td>";

    for (let day = 1; day <= days; day++, cell++) {
      if (cell % 7 === 0 && cell !== 0) html += "</tr><tr>";
      const d = new Date(y, m, day);
      const dateISO = iso(d);

      const dayEvents = (window.BEAL_EVENTS || [])
        .filter(ev => occursOnDate(ev, dateISO))
        .sort((a,b) => (a.time || "").localeCompare(b.time || ""));

      html += `<td><div class="date">${day}</div>${dayEvents.map(eventHtml).join("")}</td>`;
    }

    while (cell % 7 !== 0) { html += "<td></td>"; cell++; }
    html += "</tr></tbody></table></section>";
    return html;
  }

  function init(){
    const root = document.getElementById("calendar-container");
    root.innerHTML = MONTHS.map(renderMonth).join("");

    document.getElementById("add-event-form").addEventListener("submit", function(e) {
      e.preventDefault();
      const kid = document.getElementById("ae-kid").value;
      const type = document.getElementById("ae-type").value;
      const title = document.getElementById("ae-title").value.trim();
      const date = document.getElementById("ae-date").value;
      const rawTime = document.getElementById("ae-time").value;
      const location = document.getElementById("ae-location").value.trim() || "TBD";

      if (!title || !date) return;

      let time = "TBD";
      if (rawTime) {
        const [h, m] = rawTime.split(":").map(Number);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        time = `${h12}:${pad(m)} ${ampm}`;
      }

      const newEvent = { kid, team: "", date, title: `${type}: ${title}`, time, location };
      window.BEAL_EVENTS.push(newEvent);
      root.innerHTML = MONTHS.map(renderMonth).join("");

      // reset
      e.target.reset();
      alert(`✅ Added: ${kid} - ${type}: ${title} on ${date}`);
    });
  }

  window.addEventListener("DOMContentLoaded", init);
})();