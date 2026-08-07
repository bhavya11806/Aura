/* ==========================================
   AURA DOSSIER EDITOR LOGIC
   ========================================== */

let activeProfileId = null;
let currentUser = "guest";
let autosaveTimeout = null;
let hasUnsavedChanges = false;

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize Theme
  const savedTheme = localStorage.getItem("aura_dossier_theme") || "aura-light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // 2. Initialize Database & Sessions
  try {
    await AuraDB.initDb();
    currentUser = localStorage.getItem("aura_current_user") || "guest";
    
    // Setup form section tabs
    initSidebarTabs();

    // Populate profiles dropdown and load active profile
    await loadProfilesDropdown();

    // Setup tooltip triggers
    initTooltips();

  } catch (err) {
    console.error("Editor failed to initialize:", err);
  }
});

// Category switching logic
function initSidebarTabs() {
  document.querySelectorAll(".sidebar-tab").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const targetTab = e.currentTarget.getAttribute("data-tab");
      
      // Toggle tabs active state
      document.querySelectorAll(".sidebar-tab").forEach(b => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      
      // Toggle form sections
      document.querySelectorAll(".editor-form-section").forEach(sec => {
        if (sec.id === targetTab) {
          sec.classList.add("active");
        } else {
          sec.classList.remove("active");
        }
      });
    });
  });
}

// Load dropdown profiles from IndexedDB
async function loadProfilesDropdown() {
  const select = document.getElementById("editor-profile-select");
  select.innerHTML = "";

  const profiles = await AuraDB.getProfiles(currentUser);
  
  if (profiles.length === 0) {
    // If absolutely empty database, redirect to Portal or load default seeded Elena
    await AuraDB.seedDefaultDb();
    location.reload();
    return;
  }

  profiles.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.innerText = p.name;
    select.appendChild(opt);
  });

  // Get active profile
  activeProfileId = localStorage.getItem(`aura_active_profile_id_${currentUser}`);
  const activeProf = profiles.find(p => p.id === activeProfileId);

  if (activeProf) {
    select.value = activeProfileId;
    populateEditorForm(activeProf.data);
    renderHeaderBadge(activeProf);
  } else {
    // Fallback to first profile
    activeProfileId = profiles[0].id;
    select.value = activeProfileId;
    localStorage.setItem(`aura_active_profile_id_${currentUser}`, activeProfileId);
    populateEditorForm(profiles[0].data);
    renderHeaderBadge(profiles[0]);
  }
  
  updateDeleteBtnState();
}

function updateDeleteBtnState() {
  const delBtn = document.getElementById("btn-delete-profile");
  const select = document.getElementById("editor-profile-select");
  
  // Disable delete if only one profile remains
  if (select.options.length <= 1) {
    delBtn.disabled = true;
    delBtn.classList.add("disabled");
  } else {
    delBtn.disabled = false;
    delBtn.classList.remove("disabled");
  }
}

function renderHeaderBadge(profile) {
  const badge = document.getElementById("active-profile-badge");
  document.getElementById("header-avatar").src = profile.data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256";
  document.getElementById("header-profile-name").innerText = profile.data.name || "Unnamed";
  badge.style.display = "flex";
}

// Handle switches
async function handleProfileSwitch(profileId) {
  if (hasUnsavedChanges) {
    // Force instant save before switching
    await saveActiveProfileSync();
  }

  activeProfileId = profileId;
  localStorage.setItem(`aura_active_profile_id_${currentUser}`, activeProfileId);
  
  const profile = await AuraDB.getProfile(profileId);
  if (profile) {
    populateEditorForm(profile.data);
    renderHeaderBadge(profile);
  }
}

// Populate Editor Inputs
function populateEditorForm(data) {
  // Reset containers
  document.getElementById("skills-container").innerHTML = "";
  document.getElementById("work-container").innerHTML = "";
  document.getElementById("edu-container").innerHTML = "";
  document.getElementById("project-container").innerHTML = "";
  document.getElementById("attachments-container").innerHTML = "";

  // Set individual inputs
  const standardFields = [
    'name', 'tagline', 'pronouns', 'avatar', 'bio', 'email', 'phone', 'location', 'website',
    'github', 'linkedin', 'twitter', 'medium', 'instagram', 'facebook', 'youtube', 'tiktok',
    'height', 'weight', 'blood-group', 'water-goal', 'diet-type', 'eye-color', 'hair-color',
    'allergies', 'medical-conditions', 'fitness-level', 'activity-level', 'sleep-rhythm',
    'mbti', 'enneagram', 'zodiac', 'learning-style', 'core-values', 'strengths',
    'growth-areas', 'curiosities', 'stress-coping', 'life-motto', 'hobbies', 'travel-style',
    'work-environment', 'social-battery', 'daily-routine',
    'passion', 'targetJob', 'targetIndustries', 'aiWorkPreference', 'skill-upgrade'
  ];

  standardFields.forEach(id => {
    const el = document.getElementById(id);
    const modelKey = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    if (el) {
      el.value = data[modelKey] || "";
    }
  });

  // Set range displays
  document.getElementById("fitness-val-display").innerText = data.fitnessLevel || "5";

  // Re-create dynamic rows
  if (data.skills) data.skills.forEach(s => addSkillRow(s.name, s.level, s.category));
  if (data.work) data.work.forEach(w => addWorkRow(w.company, w.role, w.dates, w.details));
  if (data.edu) data.edu.forEach(e => addEduRow(e.school, e.degree, e.dates, e.details));
  if (data.projects) data.projects.forEach(p => addProjectRow(p.name, p.link, p.desc));
  if (data.attachments) data.attachments.forEach(att => addAttachmentRow(att.name, att.type, att.data));

  updateVisualizer(data);
  hasUnsavedChanges = false;
  document.getElementById("autosave-status").innerHTML = `<i class="fa-solid fa-circle-check"></i> Dossier Synchronized`;
}

// Get FormData representation
function serializeEditorData() {
  const data = {
    name: document.getElementById('name').value,
    tagline: document.getElementById('tagline').value,
    pronouns: document.getElementById('pronouns').value,
    avatar: document.getElementById('avatar').value,
    bio: document.getElementById('bio').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    location: document.getElementById('location').value,
    website: document.getElementById('website').value,
    
    github: document.getElementById('github').value,
    linkedin: document.getElementById('linkedin').value,
    twitter: document.getElementById('twitter').value,
    medium: document.getElementById('medium').value,
    instagram: document.getElementById('instagram').value,
    facebook: document.getElementById('facebook').value,
    youtube: document.getElementById('youtube').value,
    tiktok: document.getElementById('tiktok').value,
    
    height: document.getElementById('height').value,
    weight: document.getElementById('weight').value,
    bloodGroup: document.getElementById('blood-group').value,
    waterGoal: document.getElementById('water-goal').value,
    dietType: document.getElementById('diet-type').value,
    eyeColor: document.getElementById('eye-color').value,
    hairColor: document.getElementById('hair-color').value,
    allergies: document.getElementById('allergies').value,
    medicalConditions: document.getElementById('medical-conditions').value,
    fitnessLevel: document.getElementById('fitness-level').value,
    activityLevel: document.getElementById('activity-level').value,
    sleepRhythm: document.getElementById('sleep-rhythm').value,
    
    mbti: document.getElementById('mbti').value,
    enneagram: document.getElementById('enneagram').value,
    zodiac: document.getElementById('zodiac').value,
    learningStyle: document.getElementById('learning-style').value,
    coreValues: document.getElementById('core-values').value,
    strengths: document.getElementById('strengths').value,
    growthAreas: document.getElementById('growth-areas').value,
    curiosities: document.getElementById('curiosities').value,
    stressCoping: document.getElementById('stress-coping').value,
    
    lifeMotto: document.getElementById('life-motto').value,
    hobbies: document.getElementById('hobbies').value,
    travelStyle: document.getElementById('travel-style').value,
    workEnvironment: document.getElementById('work-environment').value,
    socialBattery: document.getElementById('social-battery').value,
    dailyRoutine: document.getElementById('daily-routine').value,
    passion: document.getElementById('passion').value,
    targetJob: document.getElementById('targetJob').value,
    targetIndustries: document.getElementById('targetIndustries').value,
    aiWorkPreference: document.getElementById('aiWorkPreference').value,
    skillUpgrade: document.getElementById('skill-upgrade').value,
    
    skills: [],
    work: [],
    edu: [],
    projects: [],
    attachments: []
  };

  // Skills
  document.querySelectorAll('.skill-row').forEach(row => {
    const name = row.querySelector('.skill-name-input').value;
    if (name.trim()) {
      data.skills.push({
        name: name,
        category: row.querySelector('.skill-category-input').value,
        level: row.querySelector('.skill-level-input').value
      });
    }
  });

  // Work
  document.querySelectorAll('.work-row').forEach(row => {
    const company = row.querySelector('.work-company-input').value;
    if (company.trim()) {
      data.work.push({
        company: company,
        role: row.querySelector('.work-role-input').value,
        dates: row.querySelector('.work-dates-input').value,
        details: row.querySelector('.work-details-input').value
      });
    }
  });

  // Edu
  document.querySelectorAll('.edu-row').forEach(row => {
    const school = row.querySelector('.edu-school-input').value;
    if (school.trim()) {
      data.edu.push({
        school: school,
        degree: row.querySelector('.edu-degree-input').value,
        dates: row.querySelector('.edu-dates-input').value,
        details: row.querySelector('.edu-details-input').value
      });
    }
  });

  // Projects
  document.querySelectorAll('.project-row').forEach(row => {
    const name = row.querySelector('.project-name-input').value;
    if (name.trim()) {
      data.projects.push({
        name: name,
        link: row.querySelector('.project-link-input').value,
        desc: row.querySelector('.project-desc-input').value
      });
    }
  });

  // Attachments
  document.querySelectorAll('.attachment-row').forEach(row => {
    const name = row.getAttribute('data-name');
    const type = row.getAttribute('data-type');
    const dataString = row.getAttribute('data-content');
    if (name) {
      data.attachments.push({ name, type, data: dataString });
    }
  });

  return data;
}

// Update micro-visualizer card in drawer
function updateVisualizer(data) {
  document.getElementById("micro-avatar").src = data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256";
  document.getElementById("micro-name").innerText = data.name || "Anonymous Persona";
  document.getElementById("micro-tagline").innerText = data.tagline || "Title Undefined";
  document.getElementById("micro-bio").innerText = data.bio || "No manifesto logged.";
  document.getElementById("micro-mbti-code").innerText = data.mbti || "N/A";
  document.getElementById("micro-stat-skills").innerText = data.skills ? data.skills.length : 0;
  document.getElementById("micro-stat-projects").innerText = data.projects ? data.projects.length : 0;
}

// Trigger auto-save debounce
function triggerFormChange() {
  hasUnsavedChanges = true;
  document.getElementById("autosave-status").innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Changes pending...`;
  
  // Visualizer instant sync
  const data = serializeEditorData();
  updateVisualizer(data);

  clearTimeout(autosaveTimeout);
  autosaveTimeout = setTimeout(saveActiveProfile, 1500);
}

// Save active profile (Debounced/Asynchronous)
async function saveActiveProfile() {
  if (!activeProfileId) return;

  const data = serializeEditorData();
  const select = document.getElementById("editor-profile-select");
  const profileName = select.options[select.selectedIndex].text;

  try {
    const updated = await AuraDB.saveProfile(currentUser, activeProfileId, profileName, data);
    renderHeaderBadge(updated);
    hasUnsavedChanges = false;
    document.getElementById("autosave-status").innerHTML = `<i class="fa-solid fa-circle-check"></i> Dossier Synchronized`;
  } catch (err) {
    console.error("Autosave failure:", err);
    document.getElementById("autosave-status").innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Sync Error`;
  }
}

// Save profile synchronously before exit/switch
async function saveActiveProfileSync() {
  clearTimeout(autosaveTimeout);
  if (!activeProfileId) return;
  const data = serializeEditorData();
  const select = document.getElementById("editor-profile-select");
  const profileName = select.options[select.selectedIndex].text;
  await AuraDB.saveProfile(currentUser, activeProfileId, profileName, data);
}

// Create new Profile File version
async function handleNewProfile() {
  const name = prompt("Enter a name for this new profile file (e.g. Principal Lead CV, Health Biosphere Dossier):");
  if (!name || !name.trim()) return;

  const newId = "profile_" + Date.now();
  const defaultData = serializeEditorData(); // Clone current fields

  try {
    await AuraDB.saveProfile(currentUser, newId, name.trim(), defaultData);
    localStorage.setItem(`aura_active_profile_id_${currentUser}`, newId);
    await loadProfilesDropdown();
    alert(`Successfully compiled new dossier workspace: "${name}"`);
  } catch (e) {
    console.error("New profile creation error:", e);
  }
}

// Delete Profile Version
async function handleDeleteProfile() {
  const select = document.getElementById("editor-profile-select");
  if (select.options.length <= 1) return; // safety

  const profileName = select.options[select.selectedIndex].text;
  const confirmDel = confirm(`Are you sure you want to permanently delete the profile workspace: "${profileName}"?`);
  if (!confirmDel) return;

  try {
    await AuraDB.deleteProfile(activeProfileId);
    localStorage.removeItem(`aura_active_profile_id_${currentUser}`);
    await loadProfilesDropdown();
    alert("Dossier profile deleted.");
  } catch (err) {
    console.error("Delete failed:", err);
  }
}

// ==========================================
// DYNAMIC ROW BINDERS
// ==========================================
function addSkillRow(name = "", level = 50, category = "technical") {
  const container = document.getElementById("skills-container");
  const div = document.createElement("div");
  div.className = "dynamic-item-row skill-row";
  div.innerHTML = `
    <button class="btn-remove-row" onclick="this.parentElement.remove(); triggerFormChange();"><i class="fa-solid fa-xmark"></i></button>
    <div class="form-grid-row">
      <div class="form-field-row">
        <label>Skill Name</label>
        <input type="text" class="skill-name-input" placeholder="e.g. JavaScript, Public Speaking" value="${escapeHtml(name)}" oninput="triggerFormChange()">
      </div>
      <div class="form-field-row">
        <label>Category</label>
        <select class="skill-category-input" onchange="triggerFormChange()">
          <option value="technical" ${category === "technical" ? "selected" : ""}>Technical</option>
          <option value="soft" ${category === "soft" ? "selected" : ""}>Soft Skills</option>
          <option value="creative" ${category === "creative" ? "selected" : ""}>Creative</option>
          <option value="tools" ${category === "tools" ? "selected" : ""}>Tools / Systems</option>
        </select>
      </div>
      <div class="form-field-row">
        <label>Proficiency</label>
        <div class="range-wrapper-row">
          <input type="range" class="skill-level-input" min="1" max="100" value="${level}" oninput="this.nextElementSibling.innerText=this.value; triggerFormChange();">
          <span>${level}</span>
        </div>
      </div>
    </div>
  `;
  container.appendChild(div);
}

function addWorkRow(company = "", role = "", dates = "", details = "") {
  const container = document.getElementById("work-container");
  const div = document.createElement("div");
  div.className = "dynamic-item-row work-row";
  div.innerHTML = `
    <button class="btn-remove-row" onclick="this.parentElement.remove(); triggerFormChange();"><i class="fa-solid fa-xmark"></i></button>
    <div class="form-grid-row">
      <div class="form-field-row">
        <label>Company / Organization</label>
        <input type="text" class="work-company-input" placeholder="e.g. SpaceX" value="${escapeHtml(company)}" oninput="triggerFormChange()">
      </div>
      <div class="form-field-row">
        <label>Job Title / Role</label>
        <input type="text" class="work-role-input" placeholder="e.g. Guidance Software Lead" value="${escapeHtml(role)}" oninput="triggerFormChange()">
      </div>
      <div class="form-field-row full-width-row">
        <label>Dates (Start - End)</label>
        <input type="text" class="work-dates-input" placeholder="e.g. Jan 2024 - Present" value="${escapeHtml(dates)}" oninput="triggerFormChange()">
      </div>
      <div class="form-field-row full-width-row">
        <label>Key Achievements / Responsibilities</label>
        <textarea class="work-details-input" rows="3" placeholder="Bullet points detailing what you accomplished..." oninput="triggerFormChange()">${escapeHtml(details)}</textarea>
      </div>
    </div>
  `;
  container.appendChild(div);
}

function addEduRow(school = "", degree = "", dates = "", details = "") {
  const container = document.getElementById("edu-container");
  const div = document.createElement("div");
  div.className = "dynamic-item-row edu-row";
  div.innerHTML = `
    <button class="btn-remove-row" onclick="this.parentElement.remove(); triggerFormChange();"><i class="fa-solid fa-xmark"></i></button>
    <div class="form-grid-row">
      <div class="form-field-row">
        <label>Institution / School</label>
        <input type="text" class="edu-school-input" placeholder="e.g. MIT" value="${escapeHtml(school)}" oninput="triggerFormChange()">
      </div>
      <div class="form-field-row">
        <label>Degree / Qualification</label>
        <input type="text" class="edu-degree-input" placeholder="e.g. M.S. Aerospace Engineering" value="${escapeHtml(degree)}" oninput="triggerFormChange()">
      </div>
      <div class="form-field-row full-width-row">
        <label>Dates (Start - End)</label>
        <input type="text" class="edu-dates-input" placeholder="e.g. 2020 - 2022" value="${escapeHtml(dates)}" oninput="triggerFormChange()">
      </div>
      <div class="form-field-row full-width-row">
        <label>Notable Honors / Major / Thesis</label>
        <textarea class="edu-details-input" rows="2" placeholder="e.g. GPA 4.0, specialization in orbital mechanics..." oninput="triggerFormChange()">${escapeHtml(details)}</textarea>
      </div>
    </div>
  `;
  container.appendChild(div);
}

function addProjectRow(name = "", link = "", desc = "") {
  const container = document.getElementById("project-container");
  const div = document.createElement("div");
  div.className = "dynamic-item-row project-row";
  div.innerHTML = `
    <button class="btn-remove-row" onclick="this.parentElement.remove(); triggerFormChange();"><i class="fa-solid fa-xmark"></i></button>
    <div class="form-grid-row">
      <div class="form-field-row">
        <label>Project Name</label>
        <input type="text" class="project-name-input" placeholder="e.g. BioSync Core" value="${escapeHtml(name)}" oninput="triggerFormChange()">
      </div>
      <div class="form-field-row">
        <label>Project URL / Repo Link</label>
        <input type="text" class="project-link-input" placeholder="e.g. https://github.com/..." value="${escapeHtml(link)}" oninput="triggerFormChange()">
      </div>
      <div class="form-field-row full-width-row">
        <label>Brief Description</label>
        <textarea class="project-desc-input" rows="2" placeholder="Outline what this project does and tech used..." oninput="triggerFormChange()">${escapeHtml(desc)}</textarea>
      </div>
    </div>
  `;
  container.appendChild(div);
}

// Avatar upload trigger
function triggerAvatarUpload() {
  document.getElementById("avatar-upload").click();
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 1 * 1024 * 1024) {
    alert("Profile image size exceeds 1MB limit.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById("avatar").value = e.target.result;
    triggerFormChange();
  };
  reader.readAsDataURL(file);
}

// Attachment Credentials Uploads
function triggerAttachmentUpload() {
  document.getElementById("attachment-upload").click();
}

function handleAttachmentUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  Array.from(files).forEach(file => {
    if (file.size > 1 * 1024 * 1024) {
      alert(`File "${file.name}" exceeds 1MB limit and was skipped.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      addAttachmentRow(file.name, file.type, e.target.result);
      triggerFormChange();
    };
    reader.readAsDataURL(file);
  });
  
  event.target.value = "";
}

function addAttachmentRow(name = "", type = "", dataString = "") {
  const container = document.getElementById("attachments-container");
  const div = document.createElement("div");
  div.className = "dynamic-item-row attachment-row";
  div.setAttribute("data-name", name);
  div.setAttribute("data-type", type);
  div.setAttribute("data-content", dataString);
  
  let icon = "fa-file-lines";
  if (type.startsWith("image/")) icon = "fa-file-image";
  else if (type === "application/pdf") icon = "fa-file-pdf";
  else if (type.includes("word")) icon = "fa-file-word";

  div.innerHTML = `
    <button class="btn-remove-row" onclick="this.parentElement.remove(); triggerFormChange();"><i class="fa-solid fa-xmark"></i></button>
    <div style="display: flex; align-items: center; gap: 10px; padding: 10px; width: 100%;">
      <i class="fa-solid ${icon}" style="font-size: 20px; color: var(--accent-secondary);"></i>
      <span style="font-weight: 500; word-break: break-all; flex: 1;">${escapeHtml(name)}</span>
    </div>
  `;
  container.appendChild(div);
}

// Toggle slide out preview drawer
function togglePreviewDrawer() {
  const drawer = document.getElementById("preview-drawer");
  drawer.classList.toggle("active");
}

// Tooltips Engine
const TOOLTIPS = {
  "attachments": "Upload files (certificates, reference letters, images) to display in your dossier. Max 1MB each.",
  "sleep-rhythm": "Select your chronotype. Lion: morning peak, Bear: mid-day peak, Wolf: night owl, Dolphin: light sleeper.",
  "mbti": "Myers-Briggs personality type, representing cognitive processing style.",
  "enneagram": "Enneagram personality type, outlining subconscious motivations and fears.",
  "zodiac": "Astrological alignment sign based on your birth date.",
  "learning-style": "Your preferred method for processing and retaining new information.",
  "core-values": "Your absolute core principles (e.g., Integrity, Autonomy, Empathy).",
  "strengths": "Your primary psychological and problem-solving strengths.",
  "growth-areas": "Your identified areas for growth, challenges, or current weaknesses.",
  "curiosities": "Intellectual obsessions or subjects you are currently research-diving.",
  "stress-coping": "Methods you employ to reset mental load (e.g., climbing, tea ceremony).",
  "life-motto": "A quote, proverb, or philosophy you live by.",
  "daily-routine": "A text layout of your typical diurnal rhythm blocks."
};

function initTooltips() {
  document.querySelectorAll("[data-tooltip]").forEach(trigger => {
    const tooltipKey = trigger.getAttribute("data-tooltip");
    const content = TOOLTIPS[tooltipKey];
    if (content) {
      trigger.addEventListener("mouseenter", (e) => {
        showTooltip(e, content);
      });
      trigger.addEventListener("mouseleave", () => {
        hideTooltip();
      });
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        showTooltip(e, content);
      });
    }
  });

  document.addEventListener("click", hideTooltip);
}

function showTooltip(e, text) {
  const container = document.getElementById("tooltip-container");
  if (!container) return;
  container.innerText = text;
  container.classList.add("active");
  
  const rect = e.currentTarget.getBoundingClientRect();
  const tooltipRect = container.getBoundingClientRect();
  
  let left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);
  let top = rect.top + window.scrollY - tooltipRect.height - 10;
  
  if (left < 10) left = 10;
  if (left + tooltipRect.width > window.innerWidth - 10) {
    left = window.innerWidth - tooltipRect.width - 10;
  }
  if (top < window.scrollY + 10) {
    top = rect.bottom + window.scrollY + 10;
  }
  
  container.style.left = `${left}px`;
  container.style.top = `${top}px`;
}

function hideTooltip() {
  const container = document.getElementById("tooltip-container");
  if (container) container.classList.remove("active");
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
window.addSkillRow = addSkillRow;
window.addWorkRow = addWorkRow;
window.addEduRow = addEduRow;
window.addProjectRow = addProjectRow;
