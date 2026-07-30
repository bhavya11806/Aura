/* ==========================================
   AURA PORTAL CONTROLLER
   ========================================== */

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize Theme
  const savedTheme = localStorage.getItem("aura_dossier_theme") || "aura-light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // 2. Initialize Database
  try {
    await AuraDB.initDb();
    document.getElementById("db-status").innerText = "INDEXEDDB ONLINE";
    document.getElementById("db-status").className = "online";
    
    // Seed default dossiers if first-run
    await AuraDB.seedDefaultDb();

    // Load Session & Profile
    await loadPortalSession();

  } catch (err) {
    console.error("Portal initialization failed:", err);
    document.getElementById("db-status").innerText = "DATABASE OFFLINE";
    document.getElementById("db-status").className = "offline";
  }
});

async function loadPortalSession() {
  const currentUser = localStorage.getItem("aura_current_user") || "guest";
  document.getElementById("operator-session").innerText = currentUser === "guest" ? "Guest Operator" : currentUser;

  // Retrieve profiles for user
  const profiles = await AuraDB.getProfiles(currentUser);
  document.getElementById("profile-count").innerText = profiles.length;

  if (profiles.length === 0) {
    // If guest and somehow no profiles (e.g. wiped), redirect or show empty info
    showEmptySpotlight();
    return;
  }

  // Get selected profile
  let activeProfileId = localStorage.getItem(`aura_active_profile_id_${currentUser}`);
  let activeProfile = profiles.find(p => p.id === activeProfileId);

  if (!activeProfile) {
    // Default to first profile
    activeProfile = profiles[0];
    activeProfileId = activeProfile.id;
    localStorage.setItem(`aura_active_profile_id_${currentUser}`, activeProfileId);
  }

  renderSpotlight(activeProfile);
  renderHeaderBadge(activeProfile);
}

function renderSpotlight(profile) {
  const data = profile.data;

  // Update Spotlight UI
  document.getElementById("spotlight-avatar").src = data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256";
  document.getElementById("spotlight-name").innerText = data.name || "Anonymous Record";
  document.getElementById("spotlight-tagline").innerText = data.tagline || "Title Undefined";
  document.getElementById("spotlight-bio").innerText = data.bio || "No manifesto logged for this record.";
  
  if (data.pronouns) {
    document.getElementById("spotlight-pronouns").innerText = data.pronouns;
    document.getElementById("spotlight-pronouns").style.display = "inline-block";
  } else {
    document.getElementById("spotlight-pronouns").style.display = "none";
  }

  // Location & Email
  const locEl = document.getElementById("spotlight-location");
  if (data.location) {
    locEl.querySelector("span").innerText = data.location;
    locEl.style.display = "inline-flex";
  } else {
    locEl.style.display = "none";
  }

  const mailEl = document.getElementById("spotlight-email");
  if (data.email) {
    mailEl.querySelector("span").innerText = data.email;
    mailEl.style.display = "inline-flex";
  } else {
    mailEl.style.display = "none";
  }

  // Stats
  document.getElementById("stat-skills").innerText = data.skills ? data.skills.length : 0;
  document.getElementById("stat-projects").innerText = data.projects ? data.projects.length : 0;
  document.getElementById("stat-mbti").innerText = data.mbti || "N/A";
}

function renderHeaderBadge(profile) {
  const badge = document.getElementById("active-profile-badge");
  if (profile) {
    document.getElementById("header-avatar").src = profile.data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256";
    document.getElementById("header-profile-name").innerText = profile.data.name || "Unnamed";
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }
}

function showEmptySpotlight() {
  document.getElementById("spotlight-name").innerText = "No Dossiers Found";
  document.getElementById("spotlight-tagline").innerText = "Compile your first portfolio to begin.";
  document.getElementById("spotlight-bio").innerText = "Go to the Compiler or Settings room to construct or import records.";
  document.getElementById("spotlight-pronouns").style.display = "none";
  document.getElementById("spotlight-location").style.display = "none";
  document.getElementById("spotlight-email").style.display = "none";
  document.getElementById("stat-skills").innerText = "0";
  document.getElementById("stat-projects").innerText = "0";
  document.getElementById("stat-mbti").innerText = "N/A";
  document.getElementById("active-profile-badge").style.display = "none";
}
