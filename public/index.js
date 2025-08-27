
 
  const form   = document.getElementById("search");
  const input  = document.getElementById("city-input");
  const title  = document.getElementById("results-title");
  const list   = document.getElementById("list");
  const empty  = document.getElementById("empty");
  
 
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
  
   
    const res = await fetch(`/api/mlh?city=${encodeURIComponent(q)}`);
    const data = await res.json();
    const items = data.results || [];
  
    
    renderResults(q, items.map(ev => ({
      title: ev.title,
      city: ev.location,
      date: ev.dateStr,
      url: ev.url
    })));
  });
  
  
 
  function renderResults(query, items) {

    title.textContent = `Showing Upcoming Hackathons in ${query}`;
    title.hidden = false;
  

    list.innerHTML = "";
  
    if (items.length === 0) {
      empty.hidden = false;
      return;
    }
  
    empty.hidden = true;
  

    for (const ev of items) {
      const li = document.createElement("li");
      li.className = "item";
      li.innerHTML = `
        <a href="${ev.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(ev.title)}</a>
        <div class="meta">${escapeHtml(ev.date)} · ${escapeHtml(ev.city)}</div>
      `;
      list.appendChild(li);
    }
  }
  
  
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[s]));
  }
  