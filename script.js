const dataPath = "./data/site-data.json";

const el = {
  siteTitle: document.querySelector("#site-title"),
  name: document.querySelector("#name"),
  tagline: document.querySelector("#tagline"),
  bio: document.querySelector("#bio"),
  profileImage: document.querySelector("#profile-image"),
  cvLink: document.querySelector("#cv-link"),
  relevantLinks: document.querySelector("#relevant-links"),
  educationList: document.querySelector("#education-list"),
  professionalList: document.querySelector("#professional-list"),
  researchList: document.querySelector("#research-list"),
  publicationsList: document.querySelector("#publications-list"),
  conferencesList: document.querySelector("#conferences-list"),
  musicList: document.querySelector("#music-list"),
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
    renderMap(data.travelPlaces || []);
  } catch (error) {
    console.error(error);
    el.bio.textContent =
      "Could not load website data. Check data/site-data.json and refresh the page.";
  }
}

function renderSite(data) {
  const profile = data.profile || {};

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

  renderLinks(profile.relevantLinks || []);
  renderTimeline(el.educationList, data.education || []);
  renderTimeline(el.professionalList, data.professionalExperience || []);
  renderTimeline(el.researchList, data.researchExperience || []);
  renderPublications(data.publications || []);
  renderConferences(data.attendedConferencesWorkshops || []);
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

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(details);
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
  return [pub.authors, `"${pub.title}"`, pub.venue, pub.year]
    .filter(Boolean)
    .join(", ");
}

function renderConferences(items) {
  el.conferencesList.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = [item.name, item.location, item.year]
      .filter(Boolean)
      .join(" | ");
    el.conferencesList.appendChild(li);
  });
}

function renderMusic(albums) {
  el.musicList.innerHTML = "";

  albums.forEach((album) => {
    const li = document.createElement("li");

    const title = document.createElement("p");
    title.textContent = `${album.artist} - ${album.album}`;

    const link = document.createElement("a");
    link.href = album.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = album.platform || "Listen";

    li.appendChild(title);
    li.appendChild(link);
    el.musicList.appendChild(li);
  });
}

function renderMap(places) {
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

  places.forEach((place) => {
    if (typeof place.lat !== "number" || typeof place.lng !== "number") {
      return;
    }

    const marker = L.marker([place.lat, place.lng]).addTo(map);
    marker.bindPopup(
      `<strong>${place.city || "Unknown city"}</strong><br>${
        place.country || ""
      } ${place.year ? `(${place.year})` : ""}`
    );

    bounds.push([place.lat, place.lng]);
  });

  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [35, 35] });
  }
}
