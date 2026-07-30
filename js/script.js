/* ==========================================
   AURA DOSSIER JAVASCRIPT CONTROLLER
   ========================================== */

// 1. CONSTANTS & PRESETS
const MBTI_METRICS = {
  INTJ: { title: "The Architect", traits: { ie: 78, ns: 82, tf: 71, jp: 85 } },
  INTP: { title: "The Logician", traits: { ie: 84, ns: 78, tf: 81, jp: 32 } },
  ENTJ: { title: "The Commander", traits: { ie: 26, ns: 79, tf: 82, jp: 75 } },
  ENTP: { title: "The Debater", traits: { ie: 29, ns: 76, tf: 72, jp: 21 } },
  INFJ: { title: "The Advocate", traits: { ie: 82, ns: 85, tf: 26, jp: 81 } },
  INFP: { title: "The Mediator", traits: { ie: 86, ns: 81, tf: 22, jp: 28 } },
  ENFJ: { title: "The Protagonist", traits: { ie: 22, ns: 75, tf: 29, jp: 76 } },
  ENFP: { title: "The Campaigner", traits: { ie: 24, ns: 83, tf: 25, jp: 21 } },
  ISTJ: { title: "The Logistician", traits: { ie: 75, ns: 28, tf: 68, jp: 79 } },
  ISFJ: { title: "The Defender", traits: { ie: 71, ns: 32, tf: 35, jp: 74 } },
  ESTJ: { title: "The Executive", traits: { ie: 32, ns: 35, tf: 71, jp: 78 } },
  ESFJ: { title: "The Consul", traits: { ie: 28, ns: 32, tf: 30, jp: 76 } },
  ISTP: { title: "The Virtuoso", traits: { ie: 74, ns: 29, tf: 75, jp: 32 } },
  ISFP: { title: "The Adventurer", traits: { ie: 78, ns: 35, tf: 28, jp: 25 } },
  ESTP: { title: "The Entrepreneur", traits: { ie: 35, ns: 32, tf: 64, jp: 29 } },
  ESFP: { title: "The Entertainer", traits: { ie: 29, ns: 30, tf: 26, jp: 25 } }
};

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256";

// 2. PAGE INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  // Setup tooltips
  initTooltips();

  // Load language settings
  const savedLang = localStorage.getItem("aura_dossier_lang") || "en";
  document.getElementById("lang-select").value = savedLang;
  changeLanguage(savedLang);

  // Set theme select dropdown value and update DOM
  const savedTheme = localStorage.getItem("aura_dossier_theme") || "aurora";
  document.getElementById("theme-select").value = savedTheme;
  changeTheme(savedTheme);

  // Setup user session/profiles OR guest loading
  setupUserSession();
});

// 3. TAB CONTROLLERS
function switchFormTab(tabId) {
  // Hide all form sections
  document.querySelectorAll(".form-tab-section").forEach(sec => sec.classList.remove("active"));
  // Deactivate all tab buttons
  document.querySelectorAll(".tab-link").forEach(btn => btn.classList.remove("active"));
  
  // Activate selected section and button
  document.getElementById(tabId).classList.add("active");
  const activeBtn = Array.from(document.querySelectorAll(".tab-link")).find(btn => 
    btn.getAttribute("onclick").includes(tabId)
  );
  if (activeBtn) activeBtn.classList.add("active");
}

function setMobileView(view) {
  const editor = document.getElementById("editor-panel");
  const preview = document.getElementById("preview-panel");
  const toggleEd = document.getElementById("toggle-editor");
  const togglePrev = document.getElementById("toggle-preview");

  if (view === 'edit') {
    editor.classList.add("mobile-active");
    preview.classList.remove("mobile-active");
    toggleEd.classList.add("active");
    togglePrev.classList.remove("active");
  } else {
    editor.classList.remove("mobile-active");
    preview.classList.add("mobile-active");
    toggleEd.classList.remove("active");
    togglePrev.classList.add("active");
  }
}

// 4. DYNAMIC ROW BUILDERS & REMOVERS
function addSkillRow(name = "", level = 50, category = "technical") {
  const container = document.getElementById("skills-container");
  const div = document.createElement("div");
  div.className = "dynamic-item-row skill-row";
  div.innerHTML = `
    <button class="btn-remove-row" onclick="this.parentElement.remove(); updatePreview();"><i class="fa-solid fa-xmark"></i></button>
    <div class="form-grid">
      <div class="form-field full-width">
        <label>Skill Name</label>
        <input type="text" class="skill-name-input" placeholder="e.g. JavaScript, Public Speaking" value="${escapeHtml(name)}" oninput="updatePreview()">
      </div>
      <div class="form-field">
        <label>Category</label>
        <select class="skill-category-input" onchange="updatePreview()">
          <option value="technical" ${category === "technical" ? "selected" : ""}>Technical</option>
          <option value="soft" ${category === "soft" ? "selected" : ""}>Soft Skills</option>
          <option value="creative" ${category === "creative" ? "selected" : ""}>Creative</option>
          <option value="tools" ${category === "tools" ? "selected" : ""}>Tools / Systems</option>
        </select>
      </div>
      <div class="form-field">
        <label>Proficiency</label>
        <div class="range-wrapper">
          <input type="range" class="skill-level-input" min="1" max="100" value="${level}" oninput="this.nextElementSibling.innerText=this.value; updatePreview();">
          <span>${level}</span>
        </div>
      </div>
    </div>
  `;
  container.appendChild(div);
  updatePreview();
}

function addWorkRow(company = "", role = "", dates = "", details = "") {
  const container = document.getElementById("work-container");
  const div = document.createElement("div");
  div.className = "dynamic-item-row work-row";
  div.innerHTML = `
    <button class="btn-remove-row" onclick="this.parentElement.remove(); updatePreview();"><i class="fa-solid fa-xmark"></i></button>
    <div class="form-grid">
      <div class="form-field">
        <label>Company / Organization</label>
        <input type="text" class="work-company-input" placeholder="e.g. SpaceX" value="${escapeHtml(company)}" oninput="updatePreview()">
      </div>
      <div class="form-field">
        <label>Job Title / Role</label>
        <input type="text" class="work-role-input" placeholder="e.g. Guidance Software Lead" value="${escapeHtml(role)}" oninput="updatePreview()">
      </div>
      <div class="form-field full-width">
        <label>Dates (Start - End)</label>
        <input type="text" class="work-dates-input" placeholder="e.g. Jan 2024 - Present" value="${escapeHtml(dates)}" oninput="updatePreview()">
      </div>
      <div class="form-field full-width">
        <label>Key Achievements / Responsibilities</label>
        <textarea class="work-details-input" rows="3" placeholder="Bullet points detailing what you accomplished..." oninput="updatePreview()">${escapeHtml(details)}</textarea>
      </div>
    </div>
  `;
  container.appendChild(div);
  updatePreview();
}

function addEduRow(school = "", degree = "", dates = "", details = "") {
  const container = document.getElementById("edu-container");
  const div = document.createElement("div");
  div.className = "dynamic-item-row edu-row";
  div.innerHTML = `
    <button class="btn-remove-row" onclick="this.parentElement.remove(); updatePreview();"><i class="fa-solid fa-xmark"></i></button>
    <div class="form-grid">
      <div class="form-field">
        <label>Institution / School</label>
        <input type="text" class="edu-school-input" placeholder="e.g. MIT" value="${escapeHtml(school)}" oninput="updatePreview()">
      </div>
      <div class="form-field">
        <label>Degree / Qualification</label>
        <input type="text" class="edu-degree-input" placeholder="e.g. M.S. Aerospace Engineering" value="${escapeHtml(degree)}" oninput="updatePreview()">
      </div>
      <div class="form-field full-width">
        <label>Dates (Start - End)</label>
        <input type="text" class="edu-dates-input" placeholder="e.g. 2020 - 2022" value="${escapeHtml(dates)}" oninput="updatePreview()">
      </div>
      <div class="form-field full-width">
        <label>Notable Honors / Major / Thesis</label>
        <textarea class="edu-details-input" rows="2" placeholder="e.g. GPA 4.0, specialization in orbital mechanics..." oninput="updatePreview()">${escapeHtml(details)}</textarea>
      </div>
    </div>
  `;
  container.appendChild(div);
  updatePreview();
}

function addProjectRow(name = "", link = "", desc = "") {
  const container = document.getElementById("project-container");
  const div = document.createElement("div");
  div.className = "dynamic-item-row project-row";
  div.innerHTML = `
    <button class="btn-remove-row" onclick="this.parentElement.remove(); updatePreview();"><i class="fa-solid fa-xmark"></i></button>
    <div class="form-grid">
      <div class="form-field">
        <label>Project Name</label>
        <input type="text" class="project-name-input" placeholder="e.g. BioSync Core" value="${escapeHtml(name)}" oninput="updatePreview()">
      </div>
      <div class="form-field">
        <label>Project URL / Repo Link</label>
        <input type="text" class="project-link-input" placeholder="e.g. https://github.com/..." value="${escapeHtml(link)}" oninput="updatePreview()">
      </div>
      <div class="form-field full-width">
        <label>Brief Description</label>
        <textarea class="project-desc-input" rows="2" placeholder="Outline what this project does and tech used..." oninput="updatePreview()">${escapeHtml(desc)}</textarea>
      </div>
    </div>
  `;
  container.appendChild(div);
  updatePreview();
}

// Update range value indicators in UI
function updateFitnessVal(val) {
  document.getElementById("fitness-val").innerText = val;
  updatePreview();
}

// 5. THEME SYSTEM
function changeTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("aura_dossier_theme", theme);
}

// 6. REAL-TIME DATA SYNCHRONIZATION & RENDERING
function updatePreview() {
  const data = getFormData();
  renderPreview(data);
  
  // Save to localStorage
  localStorage.setItem("aura_dossier_data", JSON.stringify(data));
  
  // Set synctime stamp
  const now = new Date();
  document.getElementById("sync-time").innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Collects data from input elements
function getFormData() {
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
    
    // Socials
    github: document.getElementById('github').value,
    linkedin: document.getElementById('linkedin').value,
    twitter: document.getElementById('twitter').value,
    instagram: document.getElementById('instagram').value,
    facebook: document.getElementById('facebook').value,
    youtube: document.getElementById('youtube').value,
    tiktok: document.getElementById('tiktok').value,
    medium: document.getElementById('medium').value,
    
    // Vitality / Medical
    height: document.getElementById('height').value,
    weight: document.getElementById('weight').value,
    bloodGroup: document.getElementById('blood-group').value,
    dietType: document.getElementById('diet-type').value,
    eyeColor: document.getElementById('eye-color').value,
    hairColor: document.getElementById('hair-color').value,
    allergies: document.getElementById('allergies').value,
    medicalConditions: document.getElementById('medical-conditions').value,
    fitnessLevel: document.getElementById('fitness-level').value,
    activityLevel: document.getElementById('activity-level').value,
    sleepRhythm: document.getElementById('sleep-rhythm').value,
    waterGoal: document.getElementById('water-goal').value,
    
    // Mind
    mbti: document.getElementById('mbti').value,
    enneagram: document.getElementById('enneagram').value,
    zodiac: document.getElementById('zodiac').value,
    learningStyle: document.getElementById('learning-style').value,
    coreValues: document.getElementById('core-values').value,
    strengths: document.getElementById('strengths').value,
    growthAreas: document.getElementById('growth-areas').value,
    curiosities: document.getElementById('curiosities').value,
    stressCoping: document.getElementById('stress-coping').value,
    
    // Lifestyle
    lifeMotto: document.getElementById('life-motto').value,
    hobbies: document.getElementById('hobbies').value,
    travelStyle: document.getElementById('travel-style').value,
    workEnvironment: document.getElementById('work-environment').value,
    socialBattery: document.getElementById('social-battery').value,
    dailyRoutine: document.getElementById('daily-routine').value,
    
    // Dynamic Arrays
    skills: [],
    work: [],
    edu: [],
    projects: [],
    attachments: []
  };

  // Skill row serialization
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

  // Work row serialization
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

  // Edu row serialization
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

  // Project row serialization
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

  // Attachment row serialization
  document.querySelectorAll('.attachment-row').forEach(row => {
    const name = row.getAttribute('data-name');
    const type = row.getAttribute('data-type');
    const dataString = row.getAttribute('data-content');
    if (name) {
      data.attachments.push({
        name: name,
        type: type,
        data: dataString
      });
    }
  });

  return data;
}

// Maps data model onto preview DOM elements
function renderPreview(data) {
  // Identity & Header
  document.getElementById("prev-name").innerText = data.name || "Anonymous Person";
  document.getElementById("prev-tagline").innerText = data.tagline || "Undocumented Individual";
  
  if (data.pronouns) {
    document.getElementById("prev-pronouns").innerText = data.pronouns;
    document.getElementById("prev-pronouns").style.display = "inline-block";
  } else {
    document.getElementById("prev-pronouns").style.display = "none";
  }
  
  // Avatar
  const avatarImg = document.getElementById("prev-avatar");
  avatarImg.src = data.avatar.trim() || DEFAULT_AVATAR;

  // Header quick badges
  toggleQuickBadge("prev-badge-mbti", data.mbti, "brain");
  toggleQuickBadge("prev-badge-zodiac", data.zodiac, "star");
  toggleQuickBadge("prev-badge-blood", data.bloodGroup, "droplet");
  
  const sleepMap = { lion: "Lion Riser", bear: "Bear Active", wolf: "Wolf Owl", dolphin: "Dolphin Sleeper" };
  toggleQuickBadge("prev-badge-sleep", data.sleepRhythm ? sleepMap[data.sleepRhythm] : "", "moon");

  // Manifesto (Bio)
  document.getElementById("prev-bio").innerText = data.bio || "No personal statement or manifesto has been logged for this profile.";

  // Coordinates
  document.getElementById("prev-email").innerText = data.email || "N/A";
  if (data.email) {
    document.getElementById("prev-email-row").style.display = "flex";
  } else {
    document.getElementById("prev-email-row").style.display = "none";
  }
  
  document.getElementById("prev-phone").innerText = data.phone || "N/A";
  if (data.phone) {
    document.getElementById("prev-phone-row").style.display = "flex";
  } else {
    document.getElementById("prev-phone-row").style.display = "none";
  }

  document.getElementById("prev-location").innerText = data.location || "N/A";
  if (data.location) {
    document.getElementById("prev-location-row").style.display = "flex";
  } else {
    document.getElementById("prev-location-row").style.display = "none";
  }

  const websiteEl = document.getElementById("prev-website");
  if (data.website) {
    websiteEl.innerText = data.website.replace(/^https?:\/\//, "");
    websiteEl.href = data.website.startsWith("http") ? data.website : "https://" + data.website;
    document.getElementById("prev-website-row").style.display = "flex";
  } else {
    document.getElementById("prev-website-row").style.display = "none";
  }

  // Social Links Badges
  const socialContainer = document.getElementById("prev-socials-container");
  socialContainer.innerHTML = "";
  
  appendSocialBadge(socialContainer, data.github, "fa-brands fa-github", "GitHub", "https://github.com/");
  appendSocialBadge(socialContainer, data.linkedin, "fa-brands fa-linkedin", "LinkedIn", "https://linkedin.com/in/");
  appendSocialBadge(socialContainer, data.twitter, "fa-brands fa-x-twitter", "Twitter/X", "https://twitter.com/");
  appendSocialBadge(socialContainer, data.instagram, "fa-brands fa-instagram", "Instagram", "https://instagram.com/");
  appendSocialBadge(socialContainer, data.facebook, "fa-brands fa-facebook", "Facebook", "https://facebook.com/");
  appendSocialBadge(socialContainer, data.youtube, "fa-brands fa-youtube", "YouTube", "https://youtube.com/");
  appendSocialBadge(socialContainer, data.tiktok, "fa-brands fa-tiktok", "TikTok", "https://tiktok.com/@");
  appendSocialBadge(socialContainer, data.medium, "fa-brands fa-medium", "Medium", "https://medium.com/@");

  // HEALTH & VITALITY
  // Height/Weight/Blood & BMI Calculation
  let fitnessText = "N/A";
  let hVal = parseFloat(data.height);
  let wVal = parseFloat(data.weight);
  
  document.getElementById("prev-height").innerText = data.height ? data.height + " cm" : "N/A";
  document.getElementById("prev-weight").innerText = data.weight ? data.weight + " kg" : "N/A";
  document.getElementById("prev-blood").innerText = data.bloodGroup || "N/A";
  document.getElementById("prev-water").innerText = data.waterGoal ? data.waterGoal + "L / Day" : "N/A";
  
  if (hVal > 0 && wVal > 0) {
    const bmiVal = wVal / ((hVal / 100) ** 2);
    let bmiClass = "Normal";
    if (bmiVal < 18.5) bmiClass = "Underweight";
    else if (bmiVal >= 25 && bmiVal < 30) bmiClass = "Overweight";
    else if (bmiVal >= 30) bmiClass = "Obese";
    
    document.getElementById("prev-weight").innerText += ` (BMI: ${bmiVal.toFixed(1)} - ${bmiClass})`;
  }

  // Allergies & Medical Alert boxes
  const allergiesAlert = document.getElementById("prev-allergies-alert");
  if (data.allergies && data.allergies.trim()) {
    allergiesAlert.style.display = "flex";
    document.getElementById("prev-allergies-val").innerText = data.allergies;
  } else {
    allergiesAlert.style.display = "none";
  }

  const conditionsAlert = document.getElementById("prev-conditions-alert");
  if (data.medicalConditions && data.medicalConditions.trim()) {
    conditionsAlert.style.display = "flex";
    document.getElementById("prev-conditions-val").innerText = data.medicalConditions;
  } else {
    conditionsAlert.style.display = "none";
  }

  // Fitness & Sleep sliders in preview
  document.getElementById("prev-fitness-label").innerText = `${data.fitnessLevel}/10 (${capitalize(data.activityLevel)})`;
  document.getElementById("prev-fitness-bar").style.width = (data.fitnessLevel * 10) + "%";

  const sleepWidths = { lion: 85, bear: 65, wolf: 45, dolphin: 30 };
  const sleepWidth = sleepWidths[data.sleepRhythm] || 50;
  document.getElementById("prev-sleep-label").innerText = data.sleepRhythm ? capitalize(data.sleepRhythm) : "Balanced";
  document.getElementById("prev-sleep-bar").style.width = sleepWidth + "%";

  // COGNITIVE & PSYCHOLOGICAL (MIND)
  // MBTI Widget
  const mbtiBox = document.getElementById("prev-mbti-box");
  if (data.mbti && MBTI_METRICS[data.mbti]) {
    mbtiBox.style.display = "block";
    const m = MBTI_METRICS[data.mbti];
    document.getElementById("prev-mbti-type").innerText = data.mbti;
    document.getElementById("prev-mbti-title").innerText = m.title;
    
    // Fill sliders
    document.getElementById("mbti-i-e").style.width = m.traits.ie + "%";
    document.getElementById("mbti-n-s").style.width = m.traits.ns + "%";
    document.getElementById("mbti-t-f").style.width = m.traits.tf + "%";
    document.getElementById("mbti-j-p").style.width = m.traits.jp + "%";
  } else {
    mbtiBox.style.display = "none";
  }

  // Enneagram & learning style
  toggleSimpleRow("prev-enneagram-row", "prev-enneagram", data.enneagram);
  
  const learningNames = { visual: "Visual Spatial", auditory: "Auditory", readwrite: "Read & Write", kinesthetic: "Kinesthetic / Hands-on" };
  document.getElementById("prev-learning").innerText = data.learningStyle ? learningNames[data.learningStyle] : "Read & Write";
  
  toggleSimpleRow("prev-coping-row", "prev-coping", data.stressCoping);

  // Psychological Tag Clouds
  renderTagCloud("prev-values-box", "prev-values-list", data.coreValues);
  renderTagCloud("prev-strengths-box", "prev-strengths-list", data.strengths);
  renderTagCloud("prev-growth-box", "prev-growth-list", data.growthAreas);
  renderTagCloud("prev-curiosities-box", "prev-curiosities-list", data.curiosities);

  // LIFESTYLE & OUTLOOK
  // Motto Block
  const mottoBox = document.getElementById("prev-motto-box");
  if (data.lifeMotto && data.lifeMotto.trim()) {
    mottoBox.style.display = "block";
    document.getElementById("prev-motto").innerText = data.lifeMotto;
  } else {
    mottoBox.style.display = "none";
  }

  // Hobbies Cloud
  renderTagCloud("prev-hobbies-box", "prev-hobbies-list", data.hobbies);

  // Travel Philosophy
  const travelBox = document.getElementById("prev-travel-box");
  if (data.travelStyle && data.travelStyle.trim()) {
    travelBox.style.display = "block";
    document.getElementById("prev-travel").innerText = data.travelStyle;
  } else {
    travelBox.style.display = "none";
  }

  // Work Env & Battery
  const envLabels = { remote: "Remote / Async", hybrid: "Hybrid Co-work", office: "In-Office Collaborative" };
  const batteryLabels = { solitary: "Solitary Focus", balanced: "Balanced Hybrid", outgoing: "Outgoing Synergy" };
  document.getElementById("prev-work-env").innerText = envLabels[data.workEnvironment] || "Remote";
  document.getElementById("prev-collab").innerText = batteryLabels[data.socialBattery] || "Balanced";

  // Typical Rhythm
  const routineBox = document.getElementById("prev-routine-box");
  if (data.dailyRoutine && data.dailyRoutine.trim()) {
    routineBox.style.display = "block";
    document.getElementById("prev-routine").innerText = data.dailyRoutine;
  } else {
    routineBox.style.display = "none";
  }

  // PROFESSIONAL MATRIX (SKILLS)
  const skillsMatrix = document.getElementById("prev-skills-matrix");
  skillsMatrix.innerHTML = "";
  
  if (data.skills && data.skills.length > 0) {
    // Group skills by category
    const grouped = {};
    data.skills.forEach(s => {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    });

    const categoryNames = { technical: "Technical & Science", soft: "Human Elements & Soft Skills", creative: "Artistic & Creative", tools: "Tools & Architectures" };

    Object.keys(grouped).forEach(cat => {
      const catBox = document.createElement("div");
      catBox.className = "skill-category-group";
      catBox.innerHTML = `<h5>${categoryNames[cat] || cat}</h5>`;
      
      const listGrid = document.createElement("div");
      listGrid.className = "skill-list-grid";

      grouped[cat].forEach(skill => {
        const item = document.createElement("div");
        item.className = "skill-item";
        item.innerHTML = `
          <div class="skill-info">
            <span>${escapeHtml(skill.name)}</span>
            <span>${skill.level}%</span>
          </div>
          <div class="skill-track">
            <div class="skill-fill" style="width: ${skill.level}%;"></div>
          </div>
        `;
        listGrid.appendChild(item);
      });
      catBox.appendChild(listGrid);
      skillsMatrix.appendChild(catBox);
    });
  } else {
    skillsMatrix.innerHTML = `<p class="section-desc" style="margin-bottom:0;">No skills logged in this matrix.</p>`;
  }

  // CHRONICLE TIMELINE (WORK & EDU COMBINED)
  const timeline = document.getElementById("prev-timeline");
  timeline.innerHTML = "";

  const hasWork = data.work && data.work.length > 0;
  const hasEdu = data.edu && data.edu.length > 0;

  if (hasWork || hasEdu) {
    // Combine work and education into single timeline list
    let listItems = [];
    if (hasWork) {
      data.work.forEach(w => listItems.push({ type: 'work', title: w.role, subtitle: w.company, dates: w.dates, details: w.details }));
    }
    if (hasEdu) {
      data.edu.forEach(e => listItems.push({ type: 'edu', title: e.degree, subtitle: e.school, dates: e.dates, details: e.details }));
    }

    // Sort items or just list them in natural order (Work then Edu or alternate)
    listItems.forEach(item => {
      const node = document.createElement("div");
      node.className = `timeline-node ${item.type}`;
      node.innerHTML = `
        <div class="timeline-marker"></div>
        <div class="timeline-header">
          <span class="timeline-title">${escapeHtml(item.title)}</span>
          <span class="timeline-dates">${escapeHtml(item.dates)}</span>
        </div>
        <div class="timeline-subtitle">${escapeHtml(item.subtitle)}</div>
        ${item.details ? `<div class="timeline-details">${escapeHtml(item.details)}</div>` : ''}
      `;
      timeline.appendChild(node);
    });
  } else {
    timeline.innerHTML = `<p class="section-desc" style="margin-bottom:0;">Chronological logs are currently empty.</p>`;
  }

  // PORTFOLIO CREATIONS
  const projectsGrid = document.getElementById("prev-projects-grid");
  projectsGrid.innerHTML = "";
  
  if (data.projects && data.projects.length > 0) {
    data.projects.forEach(p => {
      const card = document.createElement("div");
      card.className = "project-card";
      
      let linkHTML = "";
      if (p.link) {
        const cleanLink = p.link.replace(/^https?:\/\//, "");
        linkHTML = `<a href="${p.link.startsWith("http") ? p.link : "https://" + p.link}" target="_blank" class="project-link"><i class="fa-solid fa-link"></i> ${escapeHtml(cleanLink)}</a>`;
      }

      card.innerHTML = `
        <div class="project-header-row">
          <span class="project-name">${escapeHtml(p.name)}</span>
          ${linkHTML}
        </div>
        ${p.desc ? `<p class="project-desc">${escapeHtml(p.desc)}</p>` : ''}
      `;
      projectsGrid.appendChild(card);
    });
  } else {
    projectsGrid.innerHTML = `<p class="section-desc" style="margin-bottom:0;">No projects logged in this index.</p>`;
  }

  // ATTACHMENTS PREVIEW RENDER
  const attachmentsCard = document.getElementById("prev-attachments-card");
  const attachmentsList = document.getElementById("prev-attachments-list");
  attachmentsList.innerHTML = "";
  
  if (data.attachments && data.attachments.length > 0) {
    attachmentsCard.style.display = "block";
    data.attachments.forEach(att => {
      const card = document.createElement("div");
      card.className = "attachment-preview-card";
      
      let icon = "fa-file-lines";
      if (att.type.startsWith("image/")) icon = "fa-file-image";
      else if (att.type === "application/pdf") icon = "fa-file-pdf";
      else if (att.type.includes("word")) icon = "fa-file-word";
      
      card.innerHTML = `
        <a href="${att.data}" download="${escapeHtml(att.name)}" class="attachment-info" target="_blank">
          <i class="fa-solid ${icon}"></i>
          <span>${escapeHtml(att.name)}</span>
        </a>
        <div class="attachment-actions">
          <a href="${att.data}" download="${escapeHtml(att.name)}" class="btn btn-secondary btn-small-icon" style="height:28px; width:28px;" title="Download"><i class="fa-solid fa-download"></i></a>
        </div>
      `;
      attachmentsList.appendChild(card);
    });
  } else {
    attachmentsCard.style.display = "none";
  }
}

// 7. HELPER FUNCTIONS
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function fallbackAvatar(img) {
  img.src = DEFAULT_AVATAR;
}

function toggleQuickBadge(elementId, val, iconName) {
  const el = document.getElementById(elementId);
  if (val && val.trim()) {
    el.style.display = "flex";
    el.querySelector(".val").innerText = val;
  } else {
    el.style.display = "none";
  }
}

function toggleSimpleRow(rowId, valId, val) {
  const row = document.getElementById(rowId);
  if (val && val.trim()) {
    row.style.display = "flex";
    document.getElementById(valId).innerText = val;
  } else {
    row.style.display = "none";
  }
}

function appendSocialBadge(container, val, iconClass, label, baseUrl) {
  if (val && val.trim()) {
    const handle = val.replace(/^https?:\/\/(www\.)?(github|linkedin|twitter|instagram|x)\.com\//, "").replace(/\/$/, "");
    const badge = document.createElement("a");
    badge.className = "social-badge";
    badge.href = val.startsWith("http") ? val : baseUrl + handle;
    badge.target = "_blank";
    badge.innerHTML = `<i class="${iconClass}"></i> ${escapeHtml(label)}`;
    container.appendChild(badge);
  }
}

function renderTagCloud(boxId, listId, commaStr) {
  const box = document.getElementById(boxId);
  const list = document.getElementById(listId);
  list.innerHTML = "";
  
  if (commaStr && commaStr.trim()) {
    box.style.display = "block";
    commaStr.split(",").forEach(tag => {
      const trimmed = tag.trim();
      if (trimmed) {
        const span = document.createElement("span");
        span.innerText = trimmed;
        list.appendChild(span);
      }
    });
  } else {
    box.style.display = "none";
  }
}

// 8. DATA PERSISTENCE & ACTIONS
function populateForm(data) {
  // Reset existing inputs
  document.getElementById("skills-container").innerHTML = "";
  document.getElementById("work-container").innerHTML = "";
  document.getElementById("edu-container").innerHTML = "";
  document.getElementById("project-container").innerHTML = "";
  document.getElementById("attachments-container").innerHTML = "";

  // Basic fields
  const fields = [
    'name', 'tagline', 'pronouns', 'avatar', 'bio', 'email', 'phone', 'location', 'website',
    'github', 'linkedin', 'twitter', 'instagram', 'facebook', 'youtube', 'tiktok', 'medium', 'height', 'weight', 'blood-group', 'diet-type',
    'eye-color', 'hair-color', 'allergies', 'medical-conditions', 'fitness-level', 'activity-level',
    'sleep-rhythm', 'water-goal', 'mbti', 'enneagram', 'zodiac', 'learning-style', 'core-values',
    'strengths', 'growth-areas', 'curiosities', 'stress-coping', 'life-motto', 'hobbies',
    'travel-style', 'work-environment', 'social-battery', 'daily-routine'
  ];

  fields.forEach(f => {
    const el = document.getElementById(f);
    // map key from kebab-case (HTML ID) to camelCase (JS model key)
    const jsKey = f.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    if (el) {
      el.value = data[jsKey] || "";
    }
  });

  // Range val sync
  document.getElementById("fitness-val").innerText = data.fitnessLevel || 5;

  // Add arrays back
  if (data.skills) data.skills.forEach(s => addSkillRow(s.name, s.level, s.category));
  if (data.work) data.work.forEach(w => addWorkRow(w.company, w.role, w.dates, w.details));
  if (data.edu) data.edu.forEach(e => addEduRow(e.school, e.degree, e.dates, e.details));
  if (data.projects) data.projects.forEach(p => addProjectRow(p.name, p.link, p.desc));
  if (data.attachments) data.attachments.forEach(att => addAttachmentRow(att.name, att.type, att.data));

  updatePreview();
}

function loadDemoData() {
  const demo = {
    name: "Elena Rostova",
    tagline: "Biosensor Engineer & Deep Space Systems Designer",
    pronouns: "She / Her / Explorer",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256",
    bio: "Pioneering the intersection of carbon lifeforms and silicon systems. Building biological telemetry modules for interplanetary travel and deep orbital structures. Obsessed with human-machine integration and ecological symbiosis in closed-loop systems.",
    email: "elena.rostova@esa-corp.io",
    phone: "+41 (22) 893-1044",
    location: "Geneva, Switzerland (Remote Capable)",
    website: "https://rostova.tech",
    github: "github.com/elena-systems",
    linkedin: "linkedin.com/in/elena-rostova-bio",
    twitter: "twitter.com/elena_cybernetics",
    instagram: "",
    facebook: "facebook.com/elena.rostova",
    youtube: "youtube.com/c/elenacybernetics",
    tiktok: "",
    medium: "medium.com/@elena-systems",
    
    height: "176",
    weight: "64",
    bloodGroup: "O-",
    dietType: "Pescatarian & Intermittent Fasting (16/8)",
    eyeColor: "Amber",
    hairColor: "Dark Auburn",
    allergies: "Penicillin, Latex, Pine Pollen",
    medicalConditions: "Mild Altitude Asthma (managed via breathing techniques)",
    fitnessLevel: "8",
    activityLevel: "active",
    sleepRhythm: "wolf",
    waterGoal: "3.5",
    
    mbti: "INTJ",
    enneagram: "5w6 (The Investigator & Loyalist)",
    zodiac: "Scorpio",
    learningStyle: "kinesthetic",
    coreValues: "Autonomy, Infinite Curiosity, Integrity, Scientific Method",
    strengths: "Systems Architecture, Logic Synthesis, Hyperfocus, High Stress Tolerance",
    growthAreas: "Delegating Tasks, Over-engineering, Impatience with slow pipelines",
    curiosities: "Mycelial computing networks, Ancient Sumerian hydrology, Sub-glacial lake ecosystems",
    stressCoping: "3-hour isolated bouldering drills, crafting modular analog synthesizer soundscapes",
    
    lifeMotto: "\"The cosmos is within us. We are a way for the cosmos to know itself.\" - Carl Sagan",
    hobbies: "Bouldering, Analog Modular Synths, Astro-photography, Tea Fermentation",
    travelStyle: "Off-grid exploration, hiking Icelandic highlands, studying isolated architectural remnants",
    workEnvironment: "remote",
    socialBattery: "solitary",
    dailyRoutine: "08:00 Synthesis & Aerobic warmup | 09:00 Deep telemetry architecture block | 13:00 Laboratory sensor tests | 16:00 Async project review | 18:00 Synth patching & bouldering | 21:00 Research read on mycological computing.",
    
    skills: [
      { name: "Biosensor Hardware Design", level: 95, category: "technical" },
      { name: "Rust / Embedded Systems C", level: 90, category: "technical" },
      { name: "Neural Telemetry DSP", level: 85, category: "technical" },
      { name: "Systems Engineering", level: 92, category: "tools" },
      { name: "Eagle / KiCad PCB design", level: 88, category: "tools" },
      { name: "Critical Problem Solving", level: 95, category: "soft" },
      { name: "Asynchronous Leadership", level: 80, category: "soft" },
      { name: "Technical Draft Synthesis", level: 85, category: "creative" },
      { name: "Analog Sound Synthesis", level: 75, category: "creative" }
    ],
    work: [
      { company: "ESA Cybernetics Institute", role: "Principal Sensor Systems Architect", dates: "Jun 2023 - Present", details: "- Led telemetry development for the Bioshield-4 deep space habitat project.\n- Fabricated low-latency EEG/ECG wearable nodes running on low-power microcontrollers.\n- Implemented real-time noise reduction pipelines written in Rust, boosting transmission fidelity by 34%." },
      { company: "Biomed-Giga Corporation", role: "Embedded Firmware Engineer", dates: "Jan 2021 - May 2023", details: "- Authored safety-critical control loops for wearable micro-insulin pumps.\n- Established strict unit-testing suites reducing device recall incidents to absolute zero.\n- Handled high-density PCB layout routing and signal isolation optimizations." }
    ],
    edu: [
      { school: "ETH Zürich", degree: "M.S. Robotics and Neural Systems", dates: "2018 - 2020", details: "Thesis: High-bandwidth biotelemetry protocols for active prosthesis. Graduated with Honors." },
      { school: "Imperial College London", degree: "B.S. Electrical Engineering", dates: "2014 - 2018", details: "Specialization in Microelectronics. Recipient of Dean's Excellence Scholarship." }
    ],
    projects: [
      { name: "MycoLogic Core", link: "github.com/elena-systems/mycologic-core", desc: "Experimental driver interface linking Pleurotus djamor mycelial potentials to MIDI trigger systems." },
      { name: "AeroPulse BioShield", link: "github.com/elena-systems/aeropulse-firmware", desc: "RTOS based firmware for emergency multi-sensor environmental ventilation regulators in high carbon atmospheres." }
    ],
    attachments: []
  };

  populateForm(demo);
}

// JSON Exporter
function exportData() {
  const data = getFormData();
  const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", jsonString);
  const cleanName = (data.name || "anonymous").trim().toLowerCase().replace(/[^a-z0-9]/g, "-");
  downloadAnchor.setAttribute("download", `aura-dossier-${cleanName}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// JSON Importer
function triggerImport() {
  document.getElementById("import-file").click();
}

// Custom Importer
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      populateForm(data);
      alert("Dossier record import successful!");
    } catch (err) {
      alert("Error parsing JSON file. Ensure it is a valid AURA Dossier JSON file.");
      console.error(err);
    }
  };
  reader.readAsText(file);
  // Clear file input so it can be triggered again
  event.target.value = "";
}

// ==========================================
// 8. CUSTOM ACTION MODALS & CORE MECHANICS
// ==========================================

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("active");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("active");
}

// Reset Form Data Modal triggers
function openResetModal() {
  openModal("modal-reset");
}

function executePurge() {
  // Clear forms
  document.querySelectorAll("input, textarea").forEach(el => el.value = "");
  document.querySelectorAll("select").forEach(el => {
    el.selectedIndex = 0;
  });
  
  document.getElementById("skills-container").innerHTML = "";
  document.getElementById("work-container").innerHTML = "";
  document.getElementById("edu-container").innerHTML = "";
  document.getElementById("project-container").innerHTML = "";
  document.getElementById("attachments-container").innerHTML = "";
  
  // Set standard selectors default values
  document.getElementById("theme-select").value = "aurora";
  changeTheme("aurora");
  document.getElementById("fitness-level").value = "5";
  document.getElementById("fitness-val").innerText = "5";
  
  // Remove guest cached storage
  localStorage.removeItem("aura_dossier_data");
  
  // Reset preview
  updatePreview();
  closeModal("modal-reset");
  alert("Dossier data purged.");
}

function executeResetDemo() {
  loadDemoData();
  closeModal("modal-reset");
  alert("Demo data loaded.");
}

// Profile Picture File Upload
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
    updatePreview();
  };
  reader.readAsDataURL(file);
}

// Credentials Attachments
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
      updatePreview();
    };
    reader.readAsDataURL(file);
  });
  
  // Clear file input
  event.target.value = "";
}

function addAttachmentRow(name = "", type = "", dataString = "") {
  const container = document.getElementById("attachments-container");
  const div = document.createElement("div");
  div.className = "dynamic-item-row attachment-row";
  // Set custom data attributes to hold content
  div.setAttribute("data-name", name);
  div.setAttribute("data-type", type);
  div.setAttribute("data-content", dataString);
  
  let icon = "fa-file-lines";
  if (type.startsWith("image/")) icon = "fa-file-image";
  else if (type === "application/pdf") icon = "fa-file-pdf";
  else if (type.includes("word")) icon = "fa-file-word";

  div.innerHTML = `
    <button class="btn-remove-row" onclick="this.parentElement.remove(); updatePreview();"><i class="fa-solid fa-xmark"></i></button>
    <div style="display: flex; align-items: center; gap: 10px; padding: 10px; width: 100%;">
      <i class="fa-solid ${icon}" style="font-size: 20px; color: var(--accent-secondary);"></i>
      <span style="font-weight: 500; word-break: break-all; flex: 1;">${escapeHtml(name)}</span>
    </div>
  `;
  container.appendChild(div);
}

// Custom PDF presets and print executor
function openPDFModal() {
  openModal("modal-pdf");
}

function applyPDFPreset(preset) {
  // Reset active classes
  document.getElementById("btn-preset-all").classList.remove("active");
  document.getElementById("btn-preset-prof").classList.remove("active");
  document.getElementById("btn-preset-custom").classList.remove("active");
  
  const ids = [
    "pdf-sec-identity", "pdf-sec-skills", "pdf-sec-career", "pdf-sec-projects",
    "pdf-sec-vitality", "pdf-sec-mind", "pdf-sec-lifestyle", "pdf-sec-attachments"
  ];
  
  if (preset === "all") {
    document.getElementById("btn-preset-all").classList.add("active");
    ids.forEach(id => document.getElementById(id).checked = true);
  } else if (preset === "professional") {
    document.getElementById("btn-preset-prof").classList.add("active");
    document.getElementById("pdf-sec-identity").checked = true;
    document.getElementById("pdf-sec-skills").checked = true;
    document.getElementById("pdf-sec-career").checked = true;
    document.getElementById("pdf-sec-projects").checked = true;
    
    document.getElementById("pdf-sec-vitality").checked = false;
    document.getElementById("pdf-sec-mind").checked = false;
    document.getElementById("pdf-sec-lifestyle").checked = false;
    document.getElementById("pdf-sec-attachments").checked = false;
  } else {
    document.getElementById("btn-preset-custom").classList.add("active");
  }
}

function executePDFPrint() {
  const sections = {
    "pdf-sec-identity": document.querySelector(".dossier-header-card"),
    "pdf-sec-skills": document.querySelector("#prev-skills-matrix").closest(".dossier-subcard"),
    "pdf-sec-career": document.querySelector("#prev-timeline").closest(".dossier-subcard"),
    "pdf-sec-projects": document.querySelector("#prev-projects-grid").closest(".dossier-subcard"),
    "pdf-sec-vitality": document.querySelector("#prev-height").closest(".dossier-subcard"),
    "pdf-sec-mind": document.querySelector("#prev-learning").closest(".dossier-subcard"),
    "pdf-sec-lifestyle": document.querySelector(".outlook-card"),
    "pdf-sec-attachments": document.getElementById("prev-attachments-card")
  };
  
  // Apply force hide
  Object.keys(sections).forEach(id => {
    const isChecked = document.getElementById(id).checked;
    const element = sections[id];
    if (element) {
      if (!isChecked) {
        element.classList.add("print-force-hide");
      } else {
        element.classList.remove("print-force-hide");
      }
    }
  });

  // Monochrome option
  const isMonochrome = document.getElementById("pdf-opt-monochrome").checked;
  if (isMonochrome) {
    document.body.classList.add("print-monochrome");
  } else {
    document.body.classList.remove("print-monochrome");
  }
  
  // Close modal so it is not in the print output
  closeModal("modal-pdf");
  
  // Trigger print
  setTimeout(() => {
    window.print();
    
    // Clean up overrides after print triggers
    setTimeout(() => {
      Object.keys(sections).forEach(id => {
        const element = sections[id];
        if (element) element.classList.remove("print-force-hide");
      });
      document.body.classList.remove("print-monochrome");
    }, 1000);
  }, 300);
}

// Authentication & Multiple Profile Management
let currentUser = localStorage.getItem("aura_current_user") || null;
let currentProfileId = null;

function openAuthModal() {
  openModal("modal-auth");
}

function switchAuthTab(tab) {
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");
  const tabLogin = document.getElementById("auth-tab-login");
  const tabRegister = document.getElementById("auth-tab-register");
  
  if (tab === "login") {
    formLogin.style.display = "block";
    formRegister.style.display = "none";
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    document.getElementById("auth-title").innerHTML = `<i class="fa-solid fa-user-lock"></i> Login to Dossier`;
  } else {
    formLogin.style.display = "none";
    formRegister.style.display = "block";
    tabLogin.classList.remove("active");
    tabRegister.classList.add("active");
    document.getElementById("auth-title").innerHTML = `<i class="fa-solid fa-user-plus"></i> Create Dossier Account`;
  }
}

function handleLogin(event) {
  event.preventDefault();
  const usernameInput = document.getElementById("login-username").value.trim();
  const passwordInput = document.getElementById("login-password").value;
  const loginError = document.getElementById("login-error");
  
  if (!usernameInput || !passwordInput) return;
  
  const users = JSON.parse(localStorage.getItem("aura_users") || "{}");
  if (users[usernameInput] && users[usernameInput] === passwordInput) {
    // Authenticated
    currentUser = usernameInput;
    localStorage.setItem("aura_current_user", currentUser);
    loginError.style.display = "none";
    
    // Clear credentials fields
    document.getElementById("login-username").value = "";
    document.getElementById("login-password").value = "";
    
    closeModal("modal-auth");
    setupUserSession();
    alert(`Welcome back, ${currentUser}!`);
  } else {
    loginError.innerText = "Invalid username or password.";
    loginError.style.display = "block";
  }
}

function handleRegister(event) {
  event.preventDefault();
  const usernameInput = document.getElementById("register-username").value.trim();
  const passwordInput = document.getElementById("register-password").value;
  const registerError = document.getElementById("register-error");
  
  if (!usernameInput || !passwordInput) return;
  if (passwordInput.length < 4) {
    registerError.innerText = "Password must be at least 4 characters.";
    registerError.style.display = "block";
    return;
  }
  
  const users = JSON.parse(localStorage.getItem("aura_users") || "{}");
  if (users[usernameInput]) {
    registerError.innerText = "Username already taken.";
    registerError.style.display = "block";
    return;
  }
  
  // Register user
  users[usernameInput] = passwordInput;
  localStorage.setItem("aura_users", JSON.stringify(users));
  
  // Create first profile as default
  currentUser = usernameInput;
  localStorage.setItem("aura_current_user", currentUser);
  registerError.style.display = "none";
  
  // Clear fields
  document.getElementById("register-username").value = "";
  document.getElementById("register-password").value = "";
  
  // Create initial empty profile
  const profileId = "profile_" + Date.now();
  const initialProfile = {
    id: profileId,
    name: "Default Profile",
    data: getFormData() // current form state
  };
  
  const userProfiles = [initialProfile];
  localStorage.setItem(`aura_profiles_${currentUser}`, JSON.stringify(userProfiles));
  localStorage.setItem(`aura_current_profile_id_${currentUser}`, profileId);
  
  closeModal("modal-auth");
  setupUserSession();
  alert(`Account successfully created! Welcome ${currentUser}.`);
}

function continueAsGuest() {
  closeModal("modal-auth");
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem("aura_current_user");
  setupUserSession();
  alert("Logged out of session.");
}

function setupUserSession() {
  const authArea = document.getElementById("auth-control-area");
  const profileArea = document.getElementById("profile-select-area");
  const dropdown = document.getElementById("profile-select");
  
  if (currentUser) {
    authArea.style.display = "none";
    profileArea.style.display = "flex";
    
    // Load profiles dropdown
    const userProfiles = JSON.parse(localStorage.getItem(`aura_profiles_${currentUser}`) || "[]");
    dropdown.innerHTML = "";
    
    userProfiles.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.innerText = p.name;
      dropdown.appendChild(opt);
    });
    
    currentProfileId = localStorage.getItem(`aura_current_profile_id_${currentUser}`);
    if (currentProfileId && userProfiles.find(p => p.id === currentProfileId)) {
      dropdown.value = currentProfileId;
      // Load current profile data
      const activeProf = userProfiles.find(p => p.id === currentProfileId);
      populateForm(activeProf.data);
    } else if (userProfiles.length > 0) {
      currentProfileId = userProfiles[0].id;
      dropdown.value = currentProfileId;
      localStorage.setItem(`aura_current_profile_id_${currentUser}`, currentProfileId);
      populateForm(userProfiles[0].data);
    }
  } else {
    authArea.style.display = "block";
    profileArea.style.display = "none";
    currentProfileId = null;
    
    // Restore guest data
    const savedData = localStorage.getItem("aura_dossier_data");
    if (savedData) {
      try {
        populateForm(JSON.parse(savedData));
      } catch (e) {
        loadDemoData();
      }
    } else {
      loadDemoData();
    }
  }
}

function switchProfile(profileId) {
  if (!currentUser) return;
  
  currentProfileId = profileId;
  localStorage.setItem(`aura_current_profile_id_${currentUser}`, currentProfileId);
  
  const userProfiles = JSON.parse(localStorage.getItem(`aura_profiles_${currentUser}`) || "[]");
  const activeProf = userProfiles.find(p => p.id === currentProfileId);
  if (activeProf) {
    populateForm(activeProf.data);
  }
}

function saveCurrentProfile() {
  if (!currentUser || !currentProfileId) return;
  
  const userProfiles = JSON.parse(localStorage.getItem(`aura_profiles_${currentUser}`) || "[]");
  const profileIdx = userProfiles.findIndex(p => p.id === currentProfileId);
  
  if (profileIdx !== -1) {
    userProfiles[profileIdx].data = getFormData();
    localStorage.setItem(`aura_profiles_${currentUser}`, JSON.stringify(userProfiles));
    alert("Dossier profile saved successfully!");
  }
}

function createNewProfilePrompt() {
  if (!currentUser) return;
  
  const name = prompt("Enter a name for this new profile version (e.g. Software CV, Design Portfolio):");
  if (!name || !name.trim()) return;
  
  const userProfiles = JSON.parse(localStorage.getItem(`aura_profiles_${currentUser}`) || "[]");
  const newId = "profile_" + Date.now();
  
  const newProfile = {
    id: newId,
    name: name.trim(),
    data: getFormData() // copy current forms
  };
  
  userProfiles.push(newProfile);
  localStorage.setItem(`aura_profiles_${currentUser}`, JSON.stringify(userProfiles));
  localStorage.setItem(`aura_current_profile_id_${currentUser}`, newId);
  
  setupUserSession();
}

// Translations Database
const TRANSLATIONS = {
  en: {
    logo_main: "AURA",
    logo_sub: "Human Dossier & Resume Builder",
    lang_label: "Lang:",
    theme_label: "Theme:",
    btn_auth: "Login / Register",
    btn_load_demo: "Load Demo",
    btn_import: "Import JSON",
    btn_export: "Export JSON",
    btn_pdf: "Save / Print",
    btn_reset: "Reset",
    tab_identity: "Identity",
    tab_career: "Career",
    tab_vitality: "Vitality",
    tab_mind: "Mind & Soul",
    tab_lifestyle: "Lifestyle",
    
    // Editor headers
    head_identity: "Personal Identity",
    desc_identity: "Core parameters defining your digital and physical avatar.",
    head_professional: "Professional & Talents",
    desc_professional: "Track your career milestones, academic records, key projects, and expertise levels.",
    head_vitality: "Vitality & Medical Profile",
    desc_vitality: "Crucial metrics that outline your physical state, medical parameters, and vitality rhythm.",
    head_mind: "Mind & Soul Profile",
    desc_mind: "Personality profiling, values, and psychological blueprints defining how you process the world.",
    head_lifestyle: "Lifestyle, Habits & Outlook",
    desc_lifestyle: "Daily mechanics, worldview values, and environmental alignment factors.",
    
    // Preview Card Titles
    prev_manifesto: "Manifesto",
    prev_coordinates: "Coordinates",
    prev_cognitive: "Cognitive & Psychological",
    prev_vitality: "Vitality & Biologicals",
    prev_skills: "Skills Matrix",
    prev_timeline: "Chronicle (Work & Academics)",
    prev_projects: "Notable Creations",
    prev_lifestyle: "Lifestyle & Perspectives",
    prev_attachments: "Verified Credentials"
  },
  es: {
    logo_main: "AURA",
    logo_sub: "Archivo Humano y Constructor de CV",
    lang_label: "Idioma:",
    theme_label: "Tema:",
    btn_auth: "Iniciar Sesión / Registrarse",
    btn_load_demo: "Cargar Demo",
    btn_import: "Importar JSON",
    btn_export: "Exportar JSON",
    btn_pdf: "Guardar / Imprimir",
    btn_reset: "Reiniciar",
    tab_identity: "Identidad",
    tab_career: "Carrera",
    tab_vitality: "Vitalidad",
    tab_mind: "Mente y Alma",
    tab_lifestyle: "Estilo de vida",
    
    // Editor headers
    head_identity: "Identidad Personal",
    desc_identity: "Parámetros centrales que definen tu avatar físico y digital.",
    head_professional: "Profesional y Talentos",
    desc_professional: "Realice un seguimiento de sus logros profesionales, expedientes académicos, proyectos clave y niveles de experiencia.",
    head_vitality: "Perfil de Vitalidad y Médico",
    desc_vitality: "Métricas cruciales que describen tu estado físico, parámetros médicos y ritmo de vitalidad.",
    head_mind: "Perfil de Mente y Alma",
    desc_mind: "Perfil de personalidad, valores y esquemas psicológicos que definen cómo procesas el mundo.",
    head_lifestyle: "Estilo de vida, Hábitos y Perspectivas",
    desc_lifestyle: "Mecánica diaria, valores de visión del mundo y factores de alineación ambiental.",
    
    // Preview Card Titles
    prev_manifesto: "Manifiesto",
    prev_coordinates: "Coordenadas",
    prev_cognitive: "Cognitivo y Psicológico",
    prev_vitality: "Vitalidad y Biología",
    prev_skills: "Matriz de Habilidades",
    prev_timeline: "Crónica (Trabajo y Estudios)",
    prev_projects: "Creaciones Notables",
    prev_lifestyle: "Estilo de Vida y Perspectivas",
    prev_attachments: "Credenciales Verificadas"
  },
  fr: {
    logo_main: "AURA",
    logo_sub: "Dossier Humain & Créateur de CV",
    lang_label: "Langue:",
    theme_label: "Thème:",
    btn_auth: "Connexion / S'inscrire",
    btn_load_demo: "Charger la Démo",
    btn_import: "Importer JSON",
    btn_export: "Exporter JSON",
    btn_pdf: "Enregistrer / Imprimer",
    btn_reset: "Réinitialiser",
    tab_identity: "Identité",
    tab_career: "Carrière",
    tab_vitality: "Vitalité",
    tab_mind: "Esprit & Âme",
    tab_lifestyle: "Mode de vie",
    
    // Editor headers
    head_identity: "Identité Personnelle",
    desc_identity: "Paramètres de base définissant votre avatar numérique et physique.",
    head_professional: "Professionnel & Talents",
    desc_professional: "Suivez vos jalons de carrière, dossiers académiques, projets clés et niveaux d'expertise.",
    head_vitality: "Vitalité & Profil Médical",
    desc_vitality: "Métriques cruciales décrivant votre état physique, paramètres médicaux et rythme de vitalité.",
    head_mind: "Profil Esprit & Âme",
    desc_mind: "Profilage de la personnalité, valeurs et schémas psychologiques définissant votre façon de traiter le monde.",
    head_lifestyle: "Mode de vie, Habitudes & Perspectives",
    desc_lifestyle: "Mécanique quotidienne, valeurs de vision du monde et facteurs d'alignement environnemental.",
    
    // Preview Card Titles
    prev_manifesto: "Manifeste",
    prev_coordinates: "Coordonnées",
    prev_cognitive: "Cognitif & Psychologique",
    prev_vitality: "Vitalité & Données Biologiques",
    prev_skills: "Matrice des Compétences",
    prev_timeline: "Chronique (Emploi & Études)",
    prev_projects: "Créations Notables",
    prev_lifestyle: "Mode de Vie & Perspectives",
    prev_attachments: "Certificats Vérifiés"
  },
  hi: {
    logo_main: "AURA",
    logo_sub: "मानव डॉसियर और बायोडाटा बिल्डर",
    lang_label: "भाषा:",
    theme_label: "थीम:",
    btn_auth: "लॉगिन / रजिस्टर",
    btn_load_demo: "डेमो लोड करें",
    btn_import: "JSON आयात",
    btn_export: "JSON निर्यात",
    btn_pdf: "सहेजें / प्रिंट",
    btn_reset: "रीसेट करें",
    tab_identity: "पहचान",
    tab_career: "करियर",
    tab_vitality: "जीवन शक्ति",
    tab_mind: "मन और आत्मा",
    tab_lifestyle: "जीवन शैली",
    
    // Editor headers
    head_identity: "व्यक्तिगत पहचान",
    desc_identity: "आपके डिजिटल और शारीरिक अवतार को परिभाषित करने वाले मुख्य पैरामीटर।",
    head_professional: "पेशेवर और प्रतिभाएं",
    desc_professional: "अपने करियर के मील के पत्थर, शैक्षणिक रिकॉर्ड, प्रमुख परियोजनाओं और विशेषज्ञता स्तरों को ट्रैक करें।",
    head_vitality: "जीवन शक्ति और चिकित्सा प्रोफ़ाइल",
    desc_vitality: "महत्वपूर्ण मीट्रिक जो आपकी शारीरिक स्थिति, चिकित्सा मापदंडों और जीवन शक्ति की लय को दर्शाते हैं।",
    head_mind: "मन और आत्मा प्रोफ़ाइल",
    desc_mind: "व्यक्तित्व प्रोफाइलिंग, मूल्य, और मनोवैज्ञानिक खाके जो यह परिभाषित करते हैं कि आप दुनिया को कैसे समझते हैं।",
    head_lifestyle: "जीवनशैली, आदतें और दृष्टिकोण",
    desc_lifestyle: "दैनिक यांत्रिकी, विश्वदृष्टि मूल्य, और पर्यावरण संरेखण कारक।",
    
    // Preview Card Titles
    prev_manifesto: "घोषणापत्र (Manifesto)",
    prev_coordinates: "संपर्क सूत्र (Coordinates)",
    prev_cognitive: "संज्ञानात्मक और मनोवैज्ञानिक",
    prev_vitality: "जीवन शक्ति और जैविक",
    prev_skills: "योग्यता मैट्रिक्स",
    prev_timeline: "इतिहास (कार्य और शिक्षा)",
    prev_projects: "प्रमुख रचनाएँ",
    prev_lifestyle: "जीवन शैली और दृष्टिकोण",
    prev_attachments: "सत्यापित प्रमाणपत्र"
  }
};

function changeLanguage(lang) {
  localStorage.setItem("aura_dossier_lang", lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  
  // Set elements
  setTextSafe(".logo-main", t.logo_main);
  setTextSafe(".logo-sub", t.logo_sub);
  
  // Lang selector label
  const langLabel = document.querySelector("label[for='lang-select']");
  if (langLabel) langLabel.innerHTML = `<i class="fa-solid fa-language"></i> ${t.lang_label}`;
  
  // Theme selector label
  const themeLabel = document.querySelector("label[for='theme-select']");
  if (themeLabel) themeLabel.innerHTML = `<i class="fa-solid fa-palette"></i> ${t.theme_label}`;

  // Action Buttons
  const authBtn = document.getElementById("btn-auth");
  if (authBtn) authBtn.innerHTML = `<i class="fa-solid fa-user-lock"></i> ${t.btn_auth}`;
  
  const loadDemoBtn = document.getElementById("btn-load-demo");
  if (loadDemoBtn) loadDemoBtn.innerHTML = `<i class="fa-solid fa-database"></i> ${t.btn_load_demo}`;
  
  const importBtn = document.getElementById("btn-import-trigger");
  if (importBtn) importBtn.innerHTML = `<i class="fa-solid fa-file-import"></i> ${t.btn_import}`;
  
  const exportBtn = document.getElementById("btn-export");
  if (exportBtn) exportBtn.innerHTML = `<i class="fa-solid fa-file-export"></i> ${t.btn_export}`;
  
  const pdfBtn = document.getElementById("btn-pdf");
  if (pdfBtn) pdfBtn.innerHTML = `<i class="fa-solid fa-file-pdf"></i> ${t.btn_pdf}`;
  
  const resetBtn = document.getElementById("btn-reset");
  if (resetBtn) resetBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i> ${t.btn_reset}`;

  // Tabs (editor buttons)
  const tabLinks = document.querySelectorAll(".editor-tabs .tab-link");
  if (tabLinks.length >= 5) {
    tabLinks[0].innerHTML = `<i class="fa-solid fa-user"></i> ${t.tab_identity}`;
    tabLinks[1].innerHTML = `<i class="fa-solid fa-briefcase"></i> ${t.tab_career}`;
    tabLinks[2].innerHTML = `<i class="fa-solid fa-heart-pulse"></i> ${t.tab_vitality}`;
    tabLinks[3].innerHTML = `<i class="fa-solid fa-brain"></i> ${t.tab_mind}`;
    tabLinks[4].innerHTML = `<i class="fa-solid fa-sliders"></i> ${t.tab_lifestyle}`;
  }

  // Section Headers
  setSectionHeader("tab-identity", t.head_identity, t.desc_identity, "fa-user-astronaut");
  setSectionHeader("tab-professional", t.head_professional, t.desc_professional, "fa-briefcase");
  setSectionHeader("tab-vitality", t.head_vitality, t.desc_vitality, "fa-heart-pulse");
  setSectionHeader("tab-mind", t.head_mind, t.desc_mind, "fa-brain");
  setSectionHeader("tab-lifestyle", t.head_lifestyle, t.desc_lifestyle, "fa-sliders");

  // Preview headings
  setPreviewCardTitle("prev-manifesto", t.prev_manifesto, "fa-message");
  setPreviewCardTitle("prev-coordinates", t.prev_coordinates, "fa-location-arrow");
  setPreviewCardTitle("prev-cognitive", t.prev_cognitive, "fa-dna");
  setPreviewCardTitle("prev-vitality", t.prev_vitality, "fa-heart-pulse");
  setPreviewCardTitle("prev-skills", t.prev_skills, "fa-bolt");
  setPreviewCardTitle("prev-timeline", t.prev_timeline, "fa-timeline");
  setPreviewCardTitle("prev-projects", t.prev_projects, "fa-code-fork");
  setPreviewCardTitle("prev-lifestyle", t.prev_lifestyle, "fa-compass");
  setPreviewCardTitle("prev-attachments", t.prev_attachments, "fa-paperclip");
}

function setTextSafe(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.innerText = text;
}

function setSectionHeader(sectionId, title, desc, icon) {
  const sec = document.getElementById(sectionId);
  if (sec) {
    const h3 = sec.querySelector("h3");
    if (h3) h3.innerHTML = `<i class="fa-solid ${icon}"></i> ${title}`;
    const p = sec.querySelector(".section-desc");
    if (p) p.innerText = desc;
  }
}

function setPreviewCardTitle(cardOrSiblingId, title, icon) {
  let titleEl = null;
  const target = document.getElementById(cardOrSiblingId);
  if (target) {
    titleEl = target.querySelector(".card-title");
  } else {
    // Search elements with standard headings
    const headings = Array.from(document.querySelectorAll(".card-title"));
    titleEl = headings.find(h => h.innerHTML.includes(title) || h.textContent.includes(title));
  }
  if (titleEl) {
    titleEl.innerHTML = `<i class="fa-solid ${icon}"></i> ${title}`;
  }
}

// Tooltips Engine
const TOOLTIPS = {
  "avatar": "Upload an image or paste a URL to represent your visual identity.",
  "bio": "Write a powerful, concise personal statement outlining your core vision and focus.",
  "blood-group": "Essential biological marker for clinical/dossier completeness.",
  "diet-type": "Describe your nutrition philosophy (e.g. Vegetarian, Keto, intermittent fasting).",
  "fitness-level": "Rate your general physical health and exercise status from 1 to 10.",
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
  "daily-routine": "A text layout of your typical diurnal rhythm blocks.",
  "attachments": "Upload files (certificates, reference letters, images) to display in your dossier. Max 1MB each."
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
