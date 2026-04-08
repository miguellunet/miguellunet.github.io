const dataPath = "./data/site-data.json";
const travelPath = "./data/travel.xlsx";

const el = {
  siteTitle: document.querySelector("#site-title"),
  name: document.querySelector("#name"),
  tagline: document.querySelector("#tagline"),
  bio: document.querySelector("#bio"),
  profileImage: document.querySelector("#profile-image"),
  cvLink: document.querySelector("#cv-link"),
  relevantLinks: document.querySelector("#relevant-links"),
  educationLongList: document.querySelector("#education-long-list"),
  educationShortList: document.querySelector("#education-short-list"),
  professionalList: document.querySelector("#professional-list"),
  teachingList: document.querySelector("#teaching-list"),
  publicationsList: document.querySelector("#publications-list"),
  communicationsList: document.querySelector("#communications-list"),
  ongoingList: document.querySelector("#ongoing-list"),
  musicList: document.querySelector("#music-list"),
  musicIntro: document.querySelector("#music-intro"),
  yearRangeFilter: document.querySelector("#year-range-filter"),
  yearMinFilter: document.querySelector("#year-min-filter"),
  yearMaxFilter: document.querySelector("#year-max-filter"),
  yearMinLabel: document.querySelector("#year-min-label"),
  yearMaxLabel: document.querySelector("#year-max-label"),
  mapLegend: document.querySelector("#map-legend"),
};

bootstrap();

async function bootstrap() {
  try {
    const response = await fetch(dataPath);
    if (!response.ok) {
      throw new Error(`Could not load ${dataPath}`);
    }

    const data = await response.json();
    renderSite(data);
    const travelPlaces = await loadTravelPlacesFromXlsx();
    renderMap(travelPlaces.length ? travelPlaces : data.travelPlaces || [], data.mapEmojis || {});
  } catch (error) {
    console.error(error);
    el.bio.textContent =
      "Could not load website data. Check data/site-data.json and refresh the page.";
  }
}

async function loadTravelPlacesFromXlsx() {
  if (typeof XLSX === "undefined") {
    return [];
  }

  try {
    const response = await fetch(travelPath);
    if (!response.ok) {
      return [];
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

    return rows
      .map((row) => {
        const city = getRowValue(row, ["City"]);
        const country = getRowValue(row, ["Country"]);
        const year = String(getRowValue(row, ["Year"]) || "");
        const month = String(getRowValue(row, ["Month"]) || "");
        const context = normalizeContext(String(getRowValue(row, ["Context"]) || ""));
        const lat = Number(getRowValue(row, ["Latitude", "Lat"]));
        const lng = Number(getRowValue(row, ["Longitude", "Lng", "Lon", "Long"]));

        return {
          city,
          country,
          year,
          month,
          context,
          lat,
          lng,
        };
      })
      .filter(
        (place) =>
          place.city &&
          place.country &&
          Number.isFinite(place.lat) &&
          Number.isFinite(place.lng)
      );
  } catch (error) {
    console.error("Could not load travel.xlsx", error);
    return [];
  }
}

function getRowValue(row, keys) {
  const rowKeys = Object.keys(row);
  const match = rowKeys.find((k) => keys.includes(k.trim()));
  return match ? row[match] : "";
}

function normalizeContext(context) {
  const normalized = context.trim().toLowerCase();
  if (normalized === "academia") return "Academia";
  if (normalized === "friends" || normalized === "friedns") return "Friends";
  if (normalized === "girlfriend" || normalized === "grilfriend") return "Girlfriend";
  if (normalized === "family" || normalized === "famility" || normalized === "familty") return "Family";
  return context || "Other";
}

function renderSite(data) {
  const profile = data.profile || {};
  const workshopsAsEducation = (data.attendedConferencesWorkshops || []).map((item) => ({
    title: item.name,
    organization: "PhD School / Workshop",
    location: item.location,
    period: item.year,
    details: "",
    url: item.url || item.link || "",
    linkLabel: item.linkLabel || item.urlLabel || "Open link",
  }));

  el.siteTitle.textContent = profile.fullName || "Your Name";
  el.name.textContent = profile.fullName || "Your Name";
  el.tagline.textContent = profile.tagline || "Add your tagline in JSON";
  el.bio.textContent = profile.bio || "Add your biography in JSON";
  el.profileImage.src = profile.photo || "assets/profile-placeholder.svg";
  el.profileImage.alt = profile.fullName
    ? `Photo of ${profile.fullName}`
    : "Profile photo";

  if (profile.cv) {
    el.cvLink.href = profile.cv;
  }

  if (el.musicIntro) {
    el.musicIntro.textContent =
      data.musicIntro ||
      "Music is my second job, where I compose, perform, and release projects alongside my academic career.";
  }

  renderLinks(profile.relevantLinks || []);
  renderTimeline(el.educationLongList, data.education || []);
  renderTimeline(el.educationShortList, workshopsAsEducation);
  renderTimeline(el.professionalList, data.professionalExperience || []);
  renderTimeline(el.teachingList, data.teaching || []);
  renderPublications(data.publications || []);
  renderOngoingWork(data.ongoingWork || []);
  renderCommunications(data.communications || []);
  renderMusic(data.musicAlbums || []);
}

function renderLinks(links) {
  el.relevantLinks.innerHTML = "";

  links.forEach((item) => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.href = item.url;
    a.textContent = item.label;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    li.appendChild(a);
    el.relevantLinks.appendChild(li);
  });
}

function renderTimeline(container, items) {
  container.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "timeline-item";

    const title = document.createElement("h3");
    title.textContent = item.title || "Untitled";

    const meta = document.createElement("p");
    meta.className = "item-meta";
    meta.textContent = [item.organization, item.location, item.period]
      .filter(Boolean)
      .join(" | ");

    const details = document.createElement("p");
    details.textContent = item.details || "";

    let thesisBox = null;
    if (item.thesis) {
      thesisBox = document.createElement("div");
      thesisBox.className = "thesis-box";

      const thesisLabel = document.createElement("p");
      thesisLabel.className = "thesis-label";
      thesisLabel.textContent = "Thesis";

      const thesisText = document.createElement("p");
      thesisText.className = "thesis-text";
      thesisText.textContent = item.thesis;

      thesisBox.appendChild(thesisLabel);
      thesisBox.appendChild(thesisText);
    }

    const linkUrl = item.url || item.link || "";
    const linkLabel = item.linkLabel || "Open link";
    let itemLink = null;
    if (linkUrl) {
      itemLink = document.createElement("a");
      itemLink.href = linkUrl;
      itemLink.target = "_blank";
      itemLink.rel = "noopener noreferrer";
      itemLink.textContent = linkLabel;
      itemLink.className = "timeline-link";
    }

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(details);
    if (itemLink) {
      meta.appendChild(document.createTextNode(" ("));
      meta.appendChild(itemLink);
      meta.appendChild(document.createTextNode(")"));
    }
    if (thesisBox) card.appendChild(thesisBox);
    container.appendChild(card);
  });
}

function renderPublications(publications) {
  el.publicationsList.innerHTML = "";

  publications.forEach((pub) => {
    const li = document.createElement("li");

    if (pub.url) {
      const a = document.createElement("a");
      a.href = pub.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = publicationLabel(pub);
      li.appendChild(a);
    } else {
      li.textContent = publicationLabel(pub);
    }

    el.publicationsList.appendChild(li);
  });
}

function publicationLabel(pub) {
  const parts = [];
  if (pub.authors) parts.push(pub.authors);
  if (pub.title) parts.push(`"${pub.title}"`);
  if (pub.venue) parts.push(pub.venue);
  if (pub.year) parts.push(pub.year);
  return parts.filter(Boolean).join(", ");
}

function renderMusic(albums) {
  el.musicList.innerHTML = "";

  const sortedAlbums = [...albums].sort((left, right) => {
    const leftIsDocumentary = (left.platform || "").toLowerCase() === "youtube";
    const rightIsDocumentary = (right.platform || "").toLowerCase() === "youtube";

    if (leftIsDocumentary && !rightIsDocumentary) return -1;
    if (!leftIsDocumentary && rightIsDocumentary) return 1;
    return 0;
  });

  sortedAlbums.forEach((album) => {
    const li = document.createElement("li");

    const card = document.createElement("article");
    card.className = "timeline-item";

    const title = document.createElement("h3");
    title.textContent = album.album || "Untitled";

    const meta = document.createElement("p");
    meta.className = "item-meta";
    meta.textContent = [album.artist, album.year, album.platform]
      .filter(Boolean)
      .join(" | ");

    const details = document.createElement("p");
    details.textContent = album.role || "";

    if ((album.platform || "").toLowerCase() === "spotify") {
      const albumId = extractSpotifyAlbumId(album.url || "");
      if (albumId) {
        const iframe = document.createElement("iframe");
        iframe.className = "music-preview music-preview-spotify";
        iframe.src = `https://open.spotify.com/embed/album/${albumId}`;
        iframe.title = `${album.album} preview`;
        iframe.loading = "lazy";
        iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
        card.appendChild(iframe);
      }
    }

    if ((album.platform || "").toLowerCase() === "youtube") {
      const videoId = extractYouTubeVideoId(album.url || "");
      if (videoId) {
        const iframe = document.createElement("iframe");
        iframe.className = "music-preview music-preview-youtube";
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.title = `${album.album} documentary preview`;
        iframe.loading = "lazy";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allowFullscreen = true;
        card.appendChild(iframe);
      }
    }

    const link = document.createElement("a");
    link.href = album.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = (album.platform || "Open Link").toLowerCase() === "youtube"
      ? "Open Documentary"
      : "Open Album";

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(details);
    card.appendChild(link);
    li.appendChild(card);
    el.musicList.appendChild(li);
  });
}

function extractSpotifyAlbumId(url) {
  const match = url.match(/spotify\.com\/[^/]+\/album\/([A-Za-z0-9]+)/i) ||
    url.match(/spotify\.com\/album\/([A-Za-z0-9]+)/i);
  return match ? match[1] : "";
}

function extractYouTubeVideoId(url) {
  const shortMatch = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i);
  if (shortMatch) return shortMatch[1];
  const longMatch = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
  if (longMatch) return longMatch[1];
  return "";
}

function renderCommunications(communications) {
  el.communicationsList.innerHTML = "";

  communications.forEach((comm) => {
    const li = document.createElement("li");
    const parts = [];
    
    if (comm.authors) parts.push(comm.authors);
    if (comm.title) parts.push(`"${comm.title}"`);
    if (comm.venue) parts.push(comm.venue);
    if (comm.type) parts.push(`[${comm.type}]`);
    if (comm.year) parts.push(comm.year);
    
    li.textContent = parts.filter(Boolean).join(", ");
    el.communicationsList.appendChild(li);
  });
}

function renderOngoingWork(works) {
  el.ongoingList.innerHTML = "";

  works.forEach((work) => {
    const li = document.createElement("li");
    const parts = [];
    
    if (work.authors) parts.push(work.authors);
    if (work.title) parts.push(`"${work.title}"`);
    if (work.status) parts.push(`(${work.status})`);
    if (work.year) parts.push(work.year);
    
    li.textContent = parts.filter(Boolean).join(", ");
    el.ongoingList.appendChild(li);
  });
}

function renderMap(places, emojiMap = {}) {
  if (!places.length) {
    return;
  }

  const map = L.map("travel-map", {
    worldCopyJump: true,
    minZoom: 2,
  }).setView([20, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const bounds = [];
  const contextEmojis = {
    Academia: "🎓",
    Friends: "👥",
    Family: "👨‍👩‍👧‍👦",
    Girlfriend: "💕",
    Other: "📍",
    ...emojiMap,
  };

  const years = [...new Set(places.map((p) => Number.parseInt(p.year, 10)).filter(Number.isFinite))].sort(
    (a, b) => a - b
  );
  const contexts = [...new Set(places.map((p) => p.context).filter(Boolean))].sort();
  let selectedContext = "all";
  let selectedMinYear = years.length ? years[0] : null;
  let selectedMaxYear = years.length ? years[years.length - 1] : null;

  if (el.yearRangeFilter) {
    el.yearRangeFilter.hidden = !years.length;
  }

  if (el.yearMinFilter && el.yearMaxFilter && years.length) {
    const minYear = years[0];
    const maxYear = years[years.length - 1];

    el.yearMinFilter.min = String(minYear);
    el.yearMinFilter.max = String(maxYear);
    el.yearMinFilter.value = String(minYear);

    el.yearMaxFilter.min = String(minYear);
    el.yearMaxFilter.max = String(maxYear);
    el.yearMaxFilter.value = String(maxYear);
  }

  syncYearLabels();

  if (el.mapLegend) {
    el.mapLegend.innerHTML = "";

    const allButton = document.createElement("button");
    allButton.type = "button";
    allButton.className = "map-legend-button is-active";
    allButton.dataset.context = "all";
    allButton.textContent = "All";
    el.mapLegend.appendChild(allButton);

    contexts.forEach((context) => {
      const badge = document.createElement("button");
      badge.type = "button";
      badge.className = "map-legend-button";
      badge.dataset.context = context;
      badge.textContent = `${contextEmojis[context] || contextEmojis.Other} ${context}`;
      el.mapLegend.appendChild(badge);
    });
  }

  const markerLayer = L.layerGroup().addTo(map);

  function syncYearLabels() {
    if (el.yearMinLabel) {
      el.yearMinLabel.textContent = selectedMinYear === null ? "-" : String(selectedMinYear);
    }
    if (el.yearMaxLabel) {
      el.yearMaxLabel.textContent = selectedMaxYear === null ? "-" : String(selectedMaxYear);
    }
  }

  function paintMap() {
    const filtered = places.filter((place) => {
      const placeYear = Number.parseInt(place.year, 10);
      const yearFilterEnabled = selectedMinYear !== null && selectedMaxYear !== null;
      const yearOk =
        !yearFilterEnabled ||
        !Number.isFinite(placeYear) ||
        (placeYear >= selectedMinYear && placeYear <= selectedMaxYear);
      const contextOk = selectedContext === "all" || place.context === selectedContext;
      return yearOk && contextOk;
    });

    markerLayer.clearLayers();
    bounds.length = 0;

    filtered.forEach((place) => {
      if (typeof place.lat !== "number" || typeof place.lng !== "number") {
        return;
      }

      const marker = L.marker([place.lat, place.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="font-size:16px;line-height:1;">${
            contextEmojis[place.context] || contextEmojis.Other
          }</div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      }).addTo(markerLayer);
      marker.bindPopup(
        `<strong>${place.city || "Unknown city"}</strong><br>${place.country || ""}<br>${[
          place.month,
          place.year,
        ]
          .filter(Boolean)
          .join(" ")}`
      );

      bounds.push([place.lat, place.lng]);
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [35, 35] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 5);
    }
  }

  function updateMinYear(value) {
    if (!Number.isFinite(value) || selectedMinYear === null || selectedMaxYear === null) {
      return;
    }

    selectedMinYear = Math.min(value, selectedMaxYear);
    if (el.yearMinFilter) {
      el.yearMinFilter.value = String(selectedMinYear);
    }
  }

  function updateMaxYear(value) {
    if (!Number.isFinite(value) || selectedMinYear === null || selectedMaxYear === null) {
      return;
    }

    selectedMaxYear = Math.max(value, selectedMinYear);
    if (el.yearMaxFilter) {
      el.yearMaxFilter.value = String(selectedMaxYear);
    }
  }

  if (el.yearMinFilter) {
    el.yearMinFilter.addEventListener("input", () => {
      updateMinYear(Number.parseInt(el.yearMinFilter.value, 10));
      syncYearLabels();
      paintMap();
    });
  }

  if (el.yearMaxFilter) {
    el.yearMaxFilter.addEventListener("input", () => {
      updateMaxYear(Number.parseInt(el.yearMaxFilter.value, 10));
      syncYearLabels();
      paintMap();
    });
  }

  if (el.mapLegend) {
    el.mapLegend.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-context]");
      if (!button) {
        return;
      }

      selectedContext = button.dataset.context || "all";
      el.mapLegend.querySelectorAll("button[data-context]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      paintMap();
    });
  }
  paintMap();
}
