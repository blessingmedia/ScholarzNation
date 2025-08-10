(async () => {
  const folderId = "1JFoa-ErykK1gglro5UDXJzCuJlA3jY8x";
  const apiKey = "AIzaSyD9VrC-9_eAdTsdFZx954L0tsayMB2gjEU"; // Add your Google Drive API key here

  async function fetchFiles() {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&key=${apiKey}&fields=files(id,name,webViewLink,thumbnailLink)&orderBy=createdTime desc`;
    const res = await fetch(url);
    const data = await res.json();
    return data.files || [];
  }

  function buildCard(file) {
    const a = document.createElement('a');
    a.href = file.webViewLink;
    a.target = '_blank';
    a.className = 'scholarz-featured-card';
    a.innerHTML = `
      <div class="scholarz-featured-image" style="background-image:url('${file.thumbnailLink || ''}')"></div>
      <div class="scholarz-featured-content">
        <h3>${file.name}</h3>
        <p>Click to view or download</p>
        <div class="scholarz-featured-meta">
          <span>★★★★★</span>
          <span class="scholarz-featured-button">Open</span>
        </div>
      </div>`;
    return a;
  }

  function populate(track, files) {
    track.innerHTML = '';
    files.forEach(f => track.appendChild(buildCard(f)));
    // clone for looping
    const cardCount = track.children.length;
    for (let i = 0; i < cardCount; i++) {
      const clone = track.children[i].cloneNode(true);
      track.appendChild(clone);
    }
  }

  function startScroll() {
    const track = document.getElementById('featuredTrack');
    let offset = 0, speed = 0.5, pause = 1200, cw = 276, last = 0, pauseOn = false;
    function step(ts) {
      if (!last) last = ts;
      if (pauseOn) {
        if (ts - last >= pause) { pauseOn = false; last = ts; }
      } else {
        offset += speed;
        if (offset >= cw) { offset = 0; pauseOn = true; last = ts; }
        track.style.transform = `translateX(-${offset}px)`;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const track = document.getElementById('featuredTrack');
  const container = document.getElementById('featuredContainer');
  container.addEventListener('mouseenter', () => cancelAnimationFrame(window.scrollAnim));
  container.addEventListener('mouseleave', startScroll);

  const files = await fetchFiles();
  populate(track, files);
  startScroll();
})();
