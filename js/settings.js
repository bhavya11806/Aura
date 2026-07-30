/* ==========================================
   AURA SETTINGS PAGE LOGIC
   ========================================== */

let currentUser = "guest";
let activeProfileId = null;

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize Theme Selection Highlight
  const savedTheme = localStorage.getItem("aura_dossier_theme") || "aura-light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  highlightThemeCard(savedTheme);

  // 2. Initialize Database & Session
  try {
    await AuraDB.initDb();
    currentUser = localStorage.getItem("aura_current_user") || "guest";
    activeProfileId = localStorage.getItem(`aura_active_profile_id_${currentUser}`);

    // Seed default dossiers if empty
    await AuraDB.seedDefaultDb();

    // Render operator info and db metrics
    await refreshSettingsRoom();

  } catch (err) {
    console.error("Settings initialization failed:", err);
    document.getElementById("db-status-badge").innerText = "Offline";
    document.getElementById("db-status-badge").className = "badge-status-offline";
  }
});

async function refreshSettingsRoom() {
  currentUser = localStorage.getItem("aura_current_user") || "guest";
  activeProfileId = localStorage.getItem(`aura_active_profile_id_${currentUser}`);

  // Header Badge
  const profiles = await AuraDB.getProfiles(currentUser);
  const activeProf = profiles.find(p => p.id === activeProfileId) || profiles[0];
  if (activeProf) {
    renderHeaderBadge(activeProf);
  }

  // Render Operator Block
  renderOperatorBlock();

  // Render DB Stats & Size
  await renderDatabaseStats(profiles);
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

// 3. Theme Preset Change
function updateThemeOption(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("aura_dossier_theme", theme);
  highlightThemeCard(theme);
}

function highlightThemeCard(theme) {
  document.querySelectorAll(".theme-option-card").forEach(card => {
    if (card.classList.contains(theme)) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });
}

// 4. Operator Accounts & Session UI
function renderOperatorBlock() {
  const infoBox = document.getElementById("operator-info-box");
  const authWrapper = document.getElementById("auth-box-wrapper");

  if (currentUser === "guest") {
    infoBox.innerHTML = `
      <div class="operator-profile-details">
        <div class="operator-avatar-placeholder"><i class="fa-solid fa-user-secret"></i></div>
        <div>
          <h4>Guest Operator</h4>
          <p>Unauthenticated local session. Dossier records are isolated to local guest stores.</p>
        </div>
      </div>
    `;
    authWrapper.style.display = "block";
  } else {
    infoBox.innerHTML = `
      <div class="operator-profile-details">
        <div class="operator-avatar-placeholder authenticated"><i class="fa-solid fa-user-astronaut"></i></div>
        <div style="flex:1;">
          <h4>Operator: ${escapeHtml(currentUser)}</h4>
          <p class="status-success"><i class="fa-solid fa-shield-halved"></i> Active Authenticated Session</p>
        </div>
        <button class="btn btn-secondary btn-small" onclick="handleOperatorDisconnect()"><i class="fa-solid fa-right-from-bracket"></i> Disconnect</button>
      </div>
    `;
    authWrapper.style.display = "none";
  }
}

function toggleAuthPanel(panel) {
  const tabLogin = document.getElementById("tab-btn-login");
  const tabRegister = document.getElementById("tab-btn-register");
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");

  if (panel === "login") {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    formLogin.classList.add("active");
    formRegister.classList.remove("active");
  } else {
    tabLogin.classList.remove("active");
    tabRegister.classList.add("active");
    formLogin.classList.remove("active");
    formRegister.classList.add("active");
  }
}

// Actions login/register
async function handleOperatorLogin(event) {
  event.preventDefault();
  const email = document.getElementById("login-username").value.trim();
  const pass = document.getElementById("login-password").value;
  const errorEl = document.getElementById("login-error");

  if (!email || !pass) return;

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorEl.innerText = "Operator identity must be a valid email address.";
    errorEl.style.display = "block";
    return;
  }

  try {
    const success = await AuraDB.authenticateUser(email, pass);
    if (success) {
      localStorage.setItem("aura_current_user", email);
      errorEl.style.display = "none";
      document.getElementById("login-username").value = "";
      document.getElementById("login-password").value = "";
      alert(`Operator authenticated. Welcome, ${email}!`);
      
      // Auto switch active profile to operator's first
      const ops = await AuraDB.getProfiles(email);
      if (ops.length > 0) {
        localStorage.setItem(`aura_active_profile_id_${email}`, ops[0].id);
      }
      
      await refreshSettingsRoom();
    } else {
      errorEl.innerText = "Invalid operator credentials key.";
      errorEl.style.display = "block";
    }
  } catch (err) {
    errorEl.innerText = "Authentication error: " + err;
    errorEl.style.display = "block";
  }
}

async function handleOperatorRegister(event) {
  event.preventDefault();
  const email = document.getElementById("register-username").value.trim();
  const pass = document.getElementById("register-password").value;
  const errorEl = document.getElementById("register-error");

  if (!email || !pass) return;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorEl.innerText = "Operator identity must be a valid email address.";
    errorEl.style.display = "block";
    return;
  }

  // Password rules validation
  if (pass.length < 8) {
    errorEl.innerText = "Password must be at least 8 characters long.";
    errorEl.style.display = "block";
    return;
  }
  if (!/[A-Z]/.test(pass)) {
    errorEl.innerText = "Password must contain at least one uppercase letter (A-Z).";
    errorEl.style.display = "block";
    return;
  }
  if (!/[a-z]/.test(pass)) {
    errorEl.innerText = "Password must contain at least one lowercase letter (a-z).";
    errorEl.style.display = "block";
    return;
  }
  if (!/[0-9]/.test(pass)) {
    errorEl.innerText = "Password must contain at least one number (0-9).";
    errorEl.style.display = "block";
    return;
  }
  if (!/[@$!%*?&]/.test(pass)) {
    errorEl.innerText = "Password must contain at least one special character (@$!%*?&).";
    errorEl.style.display = "block";
    return;
  }

  try {
    await AuraDB.registerUser(email, pass);
    localStorage.setItem("aura_current_user", email);
    errorEl.style.display = "none";
    document.getElementById("register-username").value = "";
    document.getElementById("register-password").value = "";
    
    // Seed new operator account with basic starting profile
    const profileId = "profile_" + Date.now();
    const defaultData = AuraDB.SEED_PROFILES[0].data; // Elena clone
    await AuraDB.saveProfile(email, profileId, "Primary Dossier Profile", defaultData);
    localStorage.setItem(`aura_active_profile_id_${email}`, profileId);
    
    alert(`Operator account initialized. Active session for "${email}".`);
    await refreshSettingsRoom();
  } catch (err) {
    errorEl.innerText = err;
    errorEl.style.display = "block";
  }
}

async function handleOperatorDisconnect() {
  localStorage.removeItem("aura_current_user");
  currentUser = "guest";
  await refreshSettingsRoom();
  alert("Operator disconnected. Reverting to local Guest space.");
}

// 5. JSON backups
async function exportJSONDossier() {
  const profiles = await AuraDB.getProfiles(currentUser);
  const activeProf = profiles.find(p => p.id === activeProfileId) || profiles[0];
  
  if (!activeProf) {
    alert("No active profiles to export.");
    return;
  }

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeProf.data, null, 2));
  const anchor = document.createElement("a");
  anchor.setAttribute("href", dataStr);
  
  const cleanName = (activeProf.data.name || "dossier").trim().toLowerCase().replace(/[^a-z0-9]/g, "-");
  anchor.setAttribute("download", `aura-dossier-${cleanName}.json`);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function triggerImportClick() {
  document.getElementById("import-file").click();
}

function importJSONDossier(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.name || !data.tagline) {
        alert("Invalid archive format. Profile data must contain 'name' and 'tagline' properties.");
        return;
      }
      
      const newId = "profile_" + Date.now();
      const profileName = `Imported: ${data.name}`;
      await AuraDB.saveProfile(currentUser, newId, profileName, data);
      localStorage.setItem(`aura_active_profile_id_${currentUser}`, newId);
      
      alert("Archive file parsed and imported successfully.");
      event.target.value = ""; // clear input
      await refreshSettingsRoom();
    } catch (err) {
      alert("Error parsing JSON file schema. Ensure it is a valid AURA JSON dossier export.");
      console.error(err);
    }
  };
  reader.readAsText(file);
}

// Purge triggers
function triggerPurgeModal() {
  document.getElementById("modal-purge").classList.add("active");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

async function executeDatabasePurge() {
  closeModal("modal-purge");
  try {
    await AuraDB.clearUserProfiles(currentUser);
    
    // Create one empty profile
    const emptyId = "profile_" + Date.now();
    const emptyData = { name: "Blank Profile", tagline: "Title Undefined", skills: [], work: [], edu: [], projects: [], attachments: [] };
    await AuraDB.saveProfile(currentUser, emptyId, "New Blank Portfolio", emptyData);
    localStorage.setItem(`aura_active_profile_id_${currentUser}`, emptyId);
    
    alert("Dossier profiles wiped. Initialized new blank template.");
    await refreshSettingsRoom();
  } catch (err) {
    console.error("Purge failed:", err);
  }
}

async function executeDatabaseReset() {
  closeModal("modal-purge");
  try {
    await AuraDB.clearUserProfiles(currentUser);
    
    // Seed default dossiers
    const seed = AuraDB.SEED_PROFILES;
    for (const profile of seed) {
      await AuraDB.saveProfile(currentUser, profile.id, profile.name, profile.data);
    }
    
    localStorage.setItem(`aura_active_profile_id_${currentUser}`, seed[0].id);
    alert("Dossier databases reset to seeded default portfolios.");
    await refreshSettingsRoom();
  } catch (err) {
    console.error("Reset failed:", err);
  }
}

// 6. DB Stats calculations
async function renderDatabaseStats(profiles) {
  document.getElementById("db-stat-profiles").innerText = profiles.length;
  
  // Update online badge
  const statusBadge = document.getElementById("db-status-badge");
  if (AuraDB.isBackendOnline()) {
    statusBadge.innerText = "SQLite + IndexedDB Sync Online";
    statusBadge.className = "badge-status-online";
  } else {
    statusBadge.innerText = "IndexedDB Online (Offline Mode)";
    statusBadge.className = "badge-status-warning";
  }

  // Count accounts (approx)
  let accountsCount = 1; // guest default
  try {
    const db = await AuraDB.initDb();
    const tx = db.transaction(["users"], "readonly");
    const countReq = tx.objectStore("users").count();
    countReq.onsuccess = () => {
      accountsCount = countReq.result + 1; // plus guest
      document.getElementById("db-stat-accounts").innerText = accountsCount;
    };
  } catch(e) {
    document.getElementById("db-stat-accounts").innerText = accountsCount;
  }

  // Size estimation based on JSON serialization length
  let bytesCount = 0;
  profiles.forEach(p => {
    bytesCount += JSON.stringify(p).length;
  });
  
  const kb = bytesCount / 1024;
  document.getElementById("db-stat-size").innerText = `${kb.toFixed(2)} KB`;
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
