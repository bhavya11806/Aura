/* ==========================================
   AURA DASHBOARD PAGE LOGIC
   ========================================== */

let currentProfileData = null;
let currentUser = "guest";

const MBTI_TRAITS = {
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

const CHRONOTYPE_INFO = {
  lion: { name: "Lion (Early Riser)", desc: "Productive morning peak. High alertness early, exhausts in early evening.", icon: "fa-solid fa-sun", progress: 85 },
  bear: { name: "Bear (Solar Tracker)", desc: "Follows sun cycles. Peak performance mid-day, reliable daily stamina.", icon: "fa-solid fa-cloud-sun", progress: 65 },
  wolf: { name: "Wolf (Night Owl)", desc: "Creative late-night peak. Slow morning starts, high nocturnal focus.", icon: "fa-solid fa-moon", progress: 45 },
  dolphin: { name: "Dolphin (Light Sleeper)", desc: "Unpredictable rhythm. High night alertness, lighter sleep cycles.", icon: "fa-solid fa-wave-square", progress: 30 }
};

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize Theme
  const savedTheme = localStorage.getItem("aura_dossier_theme") || "aura-light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // 2. Initialize Database and Load Profile
  try {
    await AuraDB.initDb();
    currentUser = localStorage.getItem("aura_current_user") || "guest";
    
    // Read active profile ID
    let activeProfileId = localStorage.getItem(`aura_active_profile_id_${currentUser}`);
    
    // Fetch profiles
    const profiles = await AuraDB.getProfiles(currentUser);
    let activeProfile = profiles.find(p => p.id === activeProfileId);
    
    if (!activeProfile && profiles.length > 0) {
      activeProfile = profiles[0];
      localStorage.setItem(`aura_active_profile_id_${currentUser}`, activeProfile.id);
    }
    
    if (activeProfile) {
      currentProfileData = activeProfile;
      renderHeaderBadge(activeProfile);
      renderDashboard(activeProfile.data);
    } else {
      alert("No active profile data found. Please compile a dossier.");
      location.href = "editor.html";
    }

  } catch (err) {
    console.error("Dashboard failed to initialize:", err);
  }

  // 3. Tab Switches setup
  document.querySelectorAll(".dash-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      const targetSec = e.currentTarget.getAttribute("data-dashboard");
      switchDashboardTab(targetSec);
    });
  });
});

function renderHeaderBadge(profile) {
  const badge = document.getElementById("active-profile-badge");
  document.getElementById("header-avatar").src = profile.data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256";
  document.getElementById("header-profile-name").innerText = profile.data.name || "Unnamed";
  badge.style.display = "flex";
}

function switchDashboardTab(tabName) {
  // Tab headers
  document.querySelectorAll(".dash-tab").forEach(btn => {
    if (btn.getAttribute("data-dashboard") === tabName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Sections
  document.querySelectorAll(".dashboard-section").forEach(sec => {
    if (sec.id === `dash-${tabName}`) {
      sec.classList.add("active");
    } else {
      sec.classList.remove("active");
    }
  });
}

function renderDashboard(data) {
  // Title Ribbon
  document.getElementById("dossier-title-name").innerText = data.name || "Anonymous Record";
  document.getElementById("dossier-title-tagline").innerText = data.tagline || "Title / Tagline Undefined";

  // ==========================================
  // RENDER PROFESSIONAL DASHBOARD
  // ==========================================
  document.getElementById("prof-avatar").src = data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256";
  document.getElementById("prof-name").innerText = data.name || "Anonymous";
  
  if (data.pronouns) {
    document.getElementById("prof-pronouns").innerText = data.pronouns;
    document.getElementById("prof-pronouns").style.display = "inline-block";
  } else {
    document.getElementById("prof-pronouns").style.display = "none";
  }
  
  document.getElementById("prof-tagline").innerText = data.tagline || "Title Undefined";
  document.getElementById("prof-bio").innerText = data.bio || "No personal statement or manifesto has been logged for this profile.";

  // Coordinates
  renderCoordinateRow("coord-email-row", "coord-email", data.email);
  renderCoordinateRow("coord-phone-row", "coord-phone", data.phone);
  renderCoordinateRow("coord-location-row", "coord-location", data.location);
  
  const webLink = document.getElementById("coord-website");
  if (data.website) {
    webLink.innerText = data.website.replace(/^https?:\/\//, "");
    webLink.href = data.website.startsWith("http") ? data.website : "https://" + data.website;
    document.getElementById("coord-website-row").style.display = "flex";
  } else {
    document.getElementById("coord-website-row").style.display = "none";
  }

  // Social Links
  const socialsGrid = document.getElementById("coord-socials");
  socialsGrid.innerHTML = "";
  appendSocialBadge(socialsGrid, data.github, "fa-brands fa-github", "GitHub", "https://github.com/");
  appendSocialBadge(socialsGrid, data.linkedin, "fa-brands fa-linkedin", "LinkedIn", "https://linkedin.com/in/");
  appendSocialBadge(socialsGrid, data.twitter, "fa-brands fa-x-twitter", "Twitter/X", "https://twitter.com/");
  appendSocialBadge(socialsGrid, data.instagram, "fa-brands fa-instagram", "Instagram", "https://instagram.com/");
  appendSocialBadge(socialsGrid, data.facebook, "fa-brands fa-facebook", "Facebook", "https://facebook.com/");
  appendSocialBadge(socialsGrid, data.youtube, "fa-brands fa-youtube", "YouTube", "https://youtube.com/");
  appendSocialBadge(socialsGrid, data.tiktok, "fa-brands fa-tiktok", "TikTok", "https://tiktok.com/@");
  appendSocialBadge(socialsGrid, data.medium, "fa-brands fa-medium", "Medium", "https://medium.com/@");

  // Skills
  const skillsMatrix = document.getElementById("skills-matrix");
  skillsMatrix.innerHTML = "";
  if (data.skills && data.skills.length > 0) {
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
    skillsMatrix.innerHTML = `<p class="empty-notice">No skills logged in this matrix.</p>`;
  }

  // Timeline (Work & Edu Combined)
  const timeline = document.getElementById("timeline");
  timeline.innerHTML = "";
  const hasWork = data.work && data.work.length > 0;
  const hasEdu = data.edu && data.edu.length > 0;

  if (hasWork || hasEdu) {
    let listItems = [];
    if (hasWork) {
      data.work.forEach(w => listItems.push({ type: 'work', title: w.role, subtitle: w.company, dates: w.dates, details: w.details }));
    }
    if (hasEdu) {
      data.edu.forEach(e => listItems.push({ type: 'edu', title: e.degree, subtitle: e.school, dates: e.dates, details: e.details }));
    }

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
    timeline.innerHTML = `<p class="empty-notice">No history logs compiled.</p>`;
  }

  // Creations (Projects)
  const projectsGrid = document.getElementById("projects-grid");
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
    projectsGrid.innerHTML = `<p class="empty-notice">No creations registered.</p>`;
  }

  // Verified Credentials (Attachments)
  const attCard = document.getElementById("attachments-preview-card");
  const attList = document.getElementById("attachments-preview-list");
  attList.innerHTML = "";
  if (data.attachments && data.attachments.length > 0) {
    attCard.style.display = "block";
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
      `;
      attList.appendChild(card);
    });
  } else {
    attCard.style.display = "none";
  }

  // ==========================================
  // RENDER VITALITY DASHBOARD
  // ==========================================
  document.getElementById("vital-height").innerText = data.height ? `${data.height} cm` : "N/A";
  document.getElementById("vital-weight").innerText = data.weight ? `${data.weight} kg` : "N/A";
  document.getElementById("vital-blood").innerText = data.bloodGroup || "N/A";
  document.getElementById("vital-water").innerText = data.waterGoal ? `${data.waterGoal} Liters` : "N/A";

  const dietBox = document.getElementById("vital-diet-box");
  if (data.dietType) {
    document.getElementById("vital-diet").innerText = data.dietType;
    dietBox.style.display = "block";
  } else {
    dietBox.style.display = "none";
  }

  // BMI calculation
  const hVal = parseFloat(data.height);
  const wVal = parseFloat(data.weight);
  const bmiScoreEl = document.getElementById("bmi-score");
  const bmiStatusEl = document.getElementById("bmi-status");
  const pointer = document.getElementById("bmi-pointer");

  if (hVal > 0 && wVal > 0) {
    const bmi = wVal / ((hVal / 100) ** 2);
    bmiScoreEl.innerText = bmi.toFixed(1);
    
    let status = "Normal";
    let pct = 50; // default middle
    
    if (bmi < 18.5) {
      status = "Underweight";
      pct = Math.max(5, (bmi / 18.5) * 25);
    } else if (bmi >= 18.5 && bmi < 25) {
      status = "Normal Rhythms";
      pct = 25 + ((bmi - 18.5) / 6.5) * 25;
    } else if (bmi >= 25 && bmi < 30) {
      status = "Overweight Alert";
      pct = 50 + ((bmi - 25) / 5) * 25;
    } else {
      status = "Obesity Warning";
      pct = 75 + Math.min(20, ((bmi - 30) / 10) * 20);
    }

    bmiStatusEl.innerText = status;
    pointer.style.left = `${pct}%`;
  } else {
    bmiScoreEl.innerText = "N/A";
    bmiStatusEl.innerText = "Biological metrics incomplete";
    pointer.style.left = "0%";
  }

  // Sleep Rhythm Chronotype
  const rhythmType = data.sleepRhythm || "bear";
  const rhythmConfig = CHRONOTYPE_INFO[rhythmType];
  if (rhythmConfig) {
    document.getElementById("chronotype-name").innerText = rhythmConfig.name;
    document.getElementById("chronotype-desc").innerText = rhythmConfig.desc;
    document.getElementById("chronotype-icon").innerHTML = `<i class="${rhythmConfig.icon}"></i>`;
    document.getElementById("rhythm-fill-label").innerText = `${rhythmConfig.progress}% Capacity`;
    document.getElementById("rhythm-progress-bar").style.width = `${rhythmConfig.progress}%`;
  }

  // Fitness Dial Gauge
  const fitLvl = parseInt(data.fitnessLevel) || 5;
  const intensityMap = {
    sedentary: "Sedentary / Rest State",
    light: "Light Physical Load",
    active: "Active Physical Rhythms",
    athlete: "Athletic / Heavy Output"
  };
  document.getElementById("fitness-gauge-value").textContent = fitLvl;
  document.getElementById("fitness-level-desc").textContent = intensityMap[data.activityLevel] || "Activity Profile Normal";
  
  // Radial Gauge fill calculation
  const circle = document.getElementById("fitness-gauge-fill");
  if (circle) {
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (fitLvl / 10) * circumference;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
  }

  // Medical Alert Box Show/Hide
  const alertCard = document.getElementById("vitality-alerts-card");
  const allergyBanner = document.getElementById("allergy-alert");
  const conditionBanner = document.getElementById("condition-alert");
  
  let showParentAlert = false;

  if (data.allergies && data.allergies.trim()) {
    allergyBanner.style.display = "flex";
    document.getElementById("allergy-list").innerText = data.allergies;
    showParentAlert = true;
  } else {
    allergyBanner.style.display = "none";
  }

  if (data.medicalConditions && data.medicalConditions.trim()) {
    conditionBanner.style.display = "flex";
    document.getElementById("condition-list").innerText = data.medicalConditions;
    showParentAlert = true;
  } else {
    conditionBanner.style.display = "none";
  }

  alertCard.style.display = showParentAlert ? "block" : "none";

  // ==========================================
  // RENDER COGNITIVE DASHBOARD
  // ==========================================
  const mbtiCode = data.mbti || "INTJ";
  const mbtiCfg = MBTI_TRAITS[mbtiCode] || MBTI_TRAITS.INTJ;
  document.getElementById("mbti-code").innerText = mbtiCode;
  document.getElementById("mbti-title").innerText = mbtiCfg.title;
  
  // Update trait bars
  document.getElementById("mbti-i-e").style.width = `${mbtiCfg.traits.ie}%`;
  document.getElementById("mbti-n-s").style.width = `${mbtiCfg.traits.ns}%`;
  document.getElementById("mbti-t-f").style.width = `${mbtiCfg.traits.tf}%`;
  document.getElementById("mbti-j-p").style.width = `${mbtiCfg.traits.jp}%`;

  // General indicators
  toggleCognitiveRow("cog-enneagram-row", "cog-enneagram", data.enneagram);
  
  const learningNames = { visual: "Visual Spatial representation", auditory: "Auditory Lectures & Synthesis", readwrite: "Text & Read/Write list systems", kinesthetic: "Kinesthetic Trial & Error / Hands-on" };
  document.getElementById("cog-learning").innerText = data.learningStyle ? learningNames[data.learningStyle] : "Read & Write";
  
  toggleCognitiveRow("cog-zodiac-row", "cog-zodiac", data.zodiac);
  toggleCognitiveRow("cog-coping-row", "cog-coping", data.stressCoping);

  // Tag clouds
  renderTagCloud("cog-values-box", "cog-values", data.coreValues);
  renderTagCloud("cog-strengths-box", "cog-strengths", data.strengths);
  renderTagCloud("cog-growth-box", "cog-growth", data.growthAreas);
  renderTagCloud("cog-curiosities-box", "cog-curiosities", data.curiosities);

  // Motto & Lifestyles
  const mottoBox = document.getElementById("cog-motto-box");
  if (data.lifeMotto && data.lifeMotto.trim()) {
    document.getElementById("cog-motto").innerText = data.lifeMotto;
    mottoBox.style.display = "block";
  } else {
    mottoBox.style.display = "none";
  }

  const hobbiesBox = document.getElementById("cog-hobbies-box");
  if (data.hobbies && data.hobbies.trim()) {
    document.getElementById("cog-hobbies").innerText = data.hobbies;
    hobbiesBox.style.display = "block";
  } else {
    hobbiesBox.style.display = "none";
  }

  const travelBox = document.getElementById("cog-travel-box");
  if (data.travelStyle && data.travelStyle.trim()) {
    document.getElementById("cog-travel").innerText = data.travelStyle;
    travelBox.style.display = "block";
  } else {
    travelBox.style.display = "none";
  }

  const envLabels = { remote: "Remote / Asynchronous Focus", hybrid: "Hybrid Co-working & Focus", office: "Office Collaborative Sync" };
  const batteryLabels = { solitary: "Solitary Blocks (Quiet focus)", balanced: "Balanced Hybrid Collaboration", outgoing: "Synergistic Brainstorms (Thrives sync)" };
  
  document.getElementById("cog-work-env").innerText = envLabels[data.workEnvironment] || "Remote";
  document.getElementById("cog-collab").innerText = batteryLabels[data.socialBattery] || "Balanced";

  const routineBox = document.getElementById("cog-routine-box");
  if (data.dailyRoutine && data.dailyRoutine.trim()) {
    document.getElementById("cog-routine").innerText = data.dailyRoutine;
    routineBox.style.display = "block";
  } else {
    routineBox.style.display = "none";
  }

  // Render Career Compass metrics
  renderCareerCompass(data);
}

// Helpers
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderCoordinateRow(rowId, spanId, val) {
  const row = document.getElementById(rowId);
  if (val && val.trim()) {
    document.getElementById(spanId).innerText = val;
    row.style.display = "flex";
  } else {
    row.style.display = "none";
  }
}

function toggleCognitiveRow(rowId, valId, val) {
  const row = document.getElementById(rowId);
  if (val && val.trim()) {
    document.getElementById(valId).innerText = val;
    row.style.display = "flex";
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
        span.className = "tag-item";
        span.innerText = trimmed;
        list.appendChild(span);
      }
    });
  } else {
    box.style.display = "none";
  }
}

// Print and Modal Logic
function openModal(id) {
  document.getElementById(id).classList.add("active");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

function openPDFModal() {
  openModal("modal-pdf");
}

function togglePrintTypeOptions(type) {
  const layoutContainer = document.getElementById("resume-layout-options-container");
  const checklistContainer = document.getElementById("dossier-items-selection");
  if (type === "resume") {
    if (layoutContainer) layoutContainer.style.display = "flex";
    if (checklistContainer) checklistContainer.style.display = "none";
  } else if (type === "report") {
    if (layoutContainer) layoutContainer.style.display = "none";
    if (checklistContainer) checklistContainer.style.display = "none";
  } else { // dossier
    if (layoutContainer) layoutContainer.style.display = "none";
    if (checklistContainer) checklistContainer.style.display = "flex";
  }
}

function executePDFPrint() {
  const docType = document.getElementById("pdf-document-type").value;
  const layout = document.getElementById("pdf-resume-layout").value;
  const isMonochrome = document.getElementById("pdf-opt-monochrome").checked;

  // Clean up any existing print classes first
  document.body.className = document.body.className.replace(/\bprint-\S+/g, "").trim();

  if (isMonochrome) {
    document.body.classList.add("print-monochrome");
  }

  // Force print classes based on type
  document.body.classList.add("print-active");
  document.body.classList.add(`print-type-${docType}`);

  if (docType === "resume") {
    document.body.classList.add(`print-resume-${layout}`);
    // Hide everything except CV
    document.body.classList.add("print-hide-vitality");
    document.body.classList.add("print-hide-cognitive");
    document.body.classList.add("print-hide-career");
  } else if (docType === "report") {
    // Hide CV and Vitality
    document.body.classList.add("print-hide-professional");
    document.body.classList.add("print-hide-vitality");
  } else { // dossier
    const printPersonal = document.getElementById("print-opt-personal").checked;
    const printProfessional = document.getElementById("print-opt-professional").checked;
    const printVitality = document.getElementById("print-opt-vitality").checked;
    const printCognitive = document.getElementById("print-opt-cognitive").checked;
    const printCareer = document.getElementById("print-opt-career").checked;

    if (!printPersonal) document.body.classList.add("print-hide-personal");
    if (!printProfessional) document.body.classList.add("print-hide-professional");
    if (!printVitality) document.body.classList.add("print-hide-vitality");
    if (!printCognitive) document.body.classList.add("print-hide-cognitive");
    if (!printCareer) document.body.classList.add("print-hide-career");
  }

  // Close modal
  closeModal("modal-pdf");

  // Trigger print after modal transitions out
  setTimeout(() => {
    window.print();
    
    // Clean up print classes
    setTimeout(() => {
      document.body.classList.remove("print-active");
      document.body.classList.remove("print-monochrome");
      document.body.classList.remove(`print-type-${docType}`);
      document.body.classList.remove(`print-resume-${layout}`);
      document.body.classList.remove("print-hide-personal");
      document.body.classList.remove("print-hide-professional");
      document.body.classList.remove("print-hide-vitality");
      document.body.classList.remove("print-hide-cognitive");
      document.body.classList.remove("print-hide-career");
    }, 1000);
  }, 400);
}

// ==========================================
// AURA CAREER COMPASS & JOB ENGINE LOGIC
// ==========================================
function calculateAlignmentScore(data) {
  if (!data.passion || !data.targetJob) return 30; // base score if undefined
  
  let score = 45;
  const passionLower = data.passion.toLowerCase();
  const jobLower = data.targetJob.toLowerCase();
  
  // 1. check word overlap between passion and job
  const passionWords = passionLower.split(/\s+/).filter(w => w.length > 3);
  const jobWords = jobLower.split(/\s+/).filter(w => w.length > 3);
  
  let matches = 0;
  passionWords.forEach(pw => {
    if (jobLower.includes(pw)) matches++;
  });
  score += Math.min(matches * 15, 30);
  
  // 2. check skills overlap with target job
  if (data.skills && data.skills.length > 0) {
    let skillMatch = 0;
    data.skills.forEach(s => {
      const name = s.name.toLowerCase();
      if (jobLower.includes(name) || name.split(" ").some(w => w.length > 3 && jobLower.includes(w))) {
        skillMatch++;
      }
    });
    score += Math.min(skillMatch * 10, 20);
  }
  
  // 3. check experience overlap
  if (data.work && data.work.length > 0) {
    let workMatch = false;
    data.work.forEach(w => {
      const role = w.role.toLowerCase();
      if (role.includes(jobLower) || jobLower.includes(role)) workMatch = true;
    });
    if (workMatch) score += 10;
  }
  
  return Math.min(score, 100);
}

function renderCareerCompass(data) {
  // Update texts
  document.getElementById("dashboard-passion-display").innerText = data.passion || "No core passion logged. Use the Compiler to define what drives you.";
  document.getElementById("dashboard-target-job-display").innerText = data.targetJob || "No target profession defined. Enter your goals in the Compiler.";

  // Calculate Alignment
  const score = calculateAlignmentScore(data);
  const scoreText = document.getElementById("alignment-score-text");
  const gaugeFill = document.getElementById("alignment-gauge-fill");
  const statusTitle = document.getElementById("alignment-status-title");
  const expText = document.getElementById("alignment-explanation-text");

  scoreText.textContent = `${score}%`;
  
  const radius = 40; // SVG circle radius
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  gaugeFill.style.strokeDasharray = `${circumference} ${circumference}`;
  gaugeFill.style.strokeDashoffset = offset;

  if (score < 40) {
    statusTitle.innerText = "Separate Trajectories";
    statusTitle.style.color = "var(--accent-tertiary)";
    expText.innerText = "Your target career and core passions diverge significantly. You may feel unfulfilled or bored in your current trajectory. Consider integrating passion-led projects into your workload.";
  } else if (score < 75) {
    statusTitle.innerText = "Emerging Harmony";
    statusTitle.style.color = "var(--accent-secondary)";
    expText.innerText = "There is clear overlap between your goals and your passions. You are on the right track, but require deliberate actions and skill upgrades to blend them into a single role.";
  } else {
    statusTitle.innerText = "Synergistic Resonance";
    statusTitle.style.color = "#10b981"; // Emerald Green
    expText.innerText = "Excellent! Your career goals are closely unified with your core passions. This alignment yields high job satisfaction and professional energy.";
  }

  // Strengths & Weaknesses lists
  const strengthsList = document.getElementById("career-strengths-list");
  strengthsList.innerHTML = "";
  if (data.strengths && data.strengths.trim()) {
    data.strengths.split(",").forEach(s => {
      const li = document.createElement("li");
      li.innerText = s.trim();
      strengthsList.appendChild(li);
    });
  } else {
    strengthsList.innerHTML = "<li>Autonomy & System Logic</li>";
  }

  const weaknessesList = document.getElementById("career-weaknesses-list");
  weaknessesList.innerHTML = "";
  if (data.growthAreas && data.growthAreas.trim()) {
    data.growthAreas.split(",").forEach(w => {
      const li = document.createElement("li");
      li.innerText = w.trim();
      weaknessesList.appendChild(li);
    });
  } else {
    weaknessesList.innerHTML = "<li>Tendency to overcomplicate tasks</li>";
  }

  // Advice banner
  const adviceBanner = document.getElementById("career-advice-banner");
  adviceBanner.innerHTML = "";
  const mainStrength = data.strengths ? data.strengths.split(",")[0].trim() : "System Architecture";
  const mainWeakness = data.growthAreas ? data.growthAreas.split(",")[0].trim() : "over-engineering";
  
  adviceBanner.innerHTML = `
    <i class="fa-solid fa-lightbulb" style="color: var(--accent-secondary); font-size: 16px;"></i>
    <div>
      <strong>Career Action Insight:</strong> Leverage your strength in <strong>${escapeHtml(mainStrength)}</strong> to address your growth area in <strong>${escapeHtml(mainWeakness)}</strong>. For instance, build structured templates to prevent task-creep.
    </div>
  `;

  // AI Job Suggestions
  const jobsContainer = document.getElementById("jobs-suggestion-container");
  jobsContainer.innerHTML = "";

  const jobSuggestions = getJobSuggestionsForProfile(data);
  jobSuggestions.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card glass-panel hover-grow";
    card.innerHTML = `
      <div class="job-header">
        <span class="match-badge">${job.match}% Match</span>
        <span class="safety-badge"><i class="fa-solid fa-shield-halved"></i> ${job.safety}</span>
      </div>
      <h4>${escapeHtml(job.title)}</h4>
      <p class="job-desc">${escapeHtml(job.desc)}</p>
      <div class="job-footer">
        <span><i class="fa-solid fa-industry"></i> ${escapeHtml(job.sector)}</span>
      </div>
    `;
    jobsContainer.appendChild(card);
  });

  // Skills Upgrade Roadmap
  const roadmapContainer = document.getElementById("skills-roadmap-container");
  roadmapContainer.innerHTML = "";

  const steps = getRoadmapStepsForProfile(data);
  steps.forEach((step, idx) => {
    const item = document.createElement("div");
    item.className = "roadmap-step-item";
    item.innerHTML = `
      <div class="step-badge">${idx + 1}</div>
      <div class="step-content">
        <h4>${escapeHtml(step.title)}</h4>
        <p>${escapeHtml(step.desc)}</p>
      </div>
    `;
    roadmapContainer.appendChild(item);
  });
}

function getJobSuggestionsForProfile(data) {
  const isTechnical = (data.skills && data.skills.some(s => s.category === "technical" || s.category === "tools"));
  const isEco = (data.bio && (data.bio.toLowerCase().includes("eco") || data.bio.toLowerCase().includes("reef") || data.bio.toLowerCase().includes("sea")));
  
  if (isEco) {
    return [
      {
        title: "Autonomous Biosphere Telemetry Architect",
        match: 94,
        safety: "High AI Resistance",
        desc: "Designing and deploying waterproof sensor arrays on marine reefs. Resistant to AI automation because it requires physical navigation, hardware configuration, and live field measurements.",
        sector: "Eco-Tech & Marine Conservation"
      },
      {
        title: "Closed-Loop Ecological System Officer",
        match: 86,
        safety: "Strong Human Imperative",
        desc: "Overseeing synthetic coastal environments. Combines live physical diagnostics, biological laboratory sample prep, and public advocacy.",
        sector: "Biosphere Operations"
      },
      {
        title: "AI-Co-piloted Restoration Specialist",
        match: 78,
        safety: "Collaborative Safety",
        desc: "Leverages satellite models to predict reef bleaching thresholds and coordinates physical restoration drives.",
        sector: "Environmental Agencies"
      }
    ];
  } else if (isTechnical) {
    return [
      {
        title: "AI-Resistant Systems Architect",
        match: 92,
        safety: "High AI Resistance",
        desc: "Developing low-latency custom firmware and embedded safety loops. Protected against AI tools because it requires manual hardware wiring, oscilloscope checks, and low-level C/Rust integrations.",
        sector: "Embedded & Hardware Systems"
      },
      {
        title: "Symbiotic Carbon-Silicon Compiler Specialist",
        match: 85,
        safety: "Emerging Domain",
        desc: "Designing logic compilers that bridge quantum chips and molecular biological inputs. Requires deep reasoning and physical validation.",
        sector: "Quantum & Bio-Computing"
      },
      {
        title: "Human-in-the-Loop DSP Engineer",
        match: 78,
        safety: "Critical Infrastructure",
        desc: "Optimizing telemetry signals from neural biosensors. Immune to pure software threats due to regulatory safety constraints and strict physical calibration requirements.",
        sector: "Biomedical Engineering"
      }
    ];
  } else {
    return [
      {
        title: "AI-Insulated Project Consultant",
        match: 88,
        safety: "High Reasoning Safety",
        desc: "Advises clients on complex hardware setups and human organizational structures. Protected by the high demand for face-to-face negotiations and cross-disciplinary reasoning.",
        sector: "Management & Tech Advisory"
      },
      {
        title: "Human Operations & Cognitive Specialist",
        match: 82,
        safety: "Pure Human Focus",
        desc: "Coordinates workplace environments using physical/vitality telemetry. Requires deep empathy, interpersonal communication, and tactile setup.",
        sector: "Human Resources & Wellness"
      },
      {
        title: "AI-Collaborative Product Integrator",
        match: 75,
        safety: "Hybrid Adaptability",
        desc: "Coordinates development pipelines between human developers and generative coding models, maintaining semantic code review.",
        sector: "Software Operations"
      }
    ];
  }
}

function getRoadmapStepsForProfile(data) {
  const target = data.targetJob || "your target career";
  const upgradeStr = data.skillUpgrade ? data.skillUpgrade.split(",")[0].trim() : "";
  const currentSkills = data.skills && data.skills.length > 0 ? data.skills.slice(0, 2).map(s => s.name).join(" & ") : "your current skills";
  
  return [
    {
      title: "Establish Core AI-Resistant Specialization",
      desc: `Lock in your existing skills in ${currentSkills}. Bring these to master-level (>90% level) so they cannot be easily replaced by automated models.`
    },
    {
      title: `Bridge Passion to Profession`,
      desc: `Build projects that combine your passion (${data.passion || 'your dreams'}) and your target job (${target}). Publish verified code or design schematics.`
    },
    {
      title: `Target Automation-Safe Skills`,
      desc: upgradeStr ? `Master "${upgradeStr}" immediately. Focus on physical installations, edge compute, or human coordination where AI lacks a physical interface.` : "Develop skills in Edge computing, real-world deployment, or public communication. These form an absolute defense against generative AI."
    },
    {
      title: "Consolidate Professional Dossier",
      desc: `Generate and print your Professional Resume and Career assessment reports. Present them to industry experts to obtain mentoring in your target sectors.`
    }
  ];
}

// Chatbot UI handlers
function appendChatMessage(sender, text) {
  const chatBody = document.getElementById("chat-messages-container");
  if (!chatBody) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-msg ${sender}-msg`;
  msgDiv.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
  chatBody.appendChild(msgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function triggerAIConsultation(type) {
  if (!currentProfileData) return;
  const data = currentProfileData.data;
  
  appendChatMessage("user", `Execute query: ${type === 'resume' ? 'Evaluate Resume Safety' : type === 'passion' ? 'Analyze Passion Bridge' : 'Initiate Interview Prep'}`);

  // Show typing indicator
  appendChatMessage("system", "AURA Intelligence thinking...");
  
  setTimeout(() => {
    // Remove last message (typing indicator)
    const chatBody = document.getElementById("chat-messages-container");
    if (chatBody && chatBody.lastChild) {
      chatBody.removeChild(chatBody.lastChild);
    }
    
    let responseText = "";
    if (type === 'resume') {
      const skillsCount = data.skills ? data.skills.length : 0;
      const mainSkill = data.skills && data.skills.length > 0 ? data.skills[0].name : "your main domain";
      responseText = `### AURA Resume Assessment Report for ${data.name || 'Operator'}
      
**AI-Disruption Safety Score:** 84/100 (Strong Insulation)
**Critical Evaluation:**
1. **Strengths:** Your biography details highly reasoning-heavy tasks. Embedded skills like *${mainSkill}* are exceptionally secure because standard LLMs cannot debug live physical hardware cycles or configure analog telemetry boards.
2. **Weaknesses:** Your resume lists ${skillsCount} skills. Some soft skills or achievements are worded standardly. AI resume scrapers might flag them as boilerplate.
3. **Enhancement Suggestion:** In your Chronicle under James Cook or ESA, replace passive sentences with active action verbs: 'Fabricated sensor mesh nodes...', 'Optimized logic operations written in Rust, reducing latency by 22%'. Highlight exact, quantifiable constraints.`;
    } else if (type === 'passion') {
      responseText = `### Passion-to-Profession Alignment Assessment
      
**Passion:** "${data.passion || 'Not specified'}"
**Target Job:** "${data.targetJob || 'Not specified'}"

**Bridging Blueprint:**
To successfully convert your passion into a secure, thriving career:
1. **Interface Creation:** Create a portfolio project that maps your current technical skills directly to your passion. For example, if you love modular synthesizers and biosensors, design an open-source driver bridging plant-potentials to MIDI notes.
2. **Market Sector Positioning:** Target companies working in the overlap. In your case, focus on *${data.targetIndustries || 'specialized sectors'}* that value deep systems thinking.
3. **Insider Strategy:** Do not apply to generic entry portals (where AI filters operate). Instead, publish technical summaries on Medium/GitHub, and reach out directly to technical leads.`;
    } else {
      const job = data.targetJob || "Principal Systems Engineer";
      responseText = `### AURA Mock Interview Simulator
      
*I am setting up an interview for the position of **${job}**.*

**Question 1 (Technical Reasoning):**
"In your work, you mentioned dealing with complex data and system limits. Can you explain a scenario where you had to debug an unexpected telemetry failure or compiler optimization bug? How did you isolate the hardware constraints from software faults?"

**Question 2 (Collaboration & Friction):**
"Since you prefer a **${data.workEnvironment || 'remote'}** environment with a **${data.socialBattery || 'solitary'}** style, how do you handle critical pipeline blockers that require urgent, synchronized alignment with a large cross-functional team? Provide an example of how you lead asynchronously."

*Reply in the chat box below to test your answers!*`;
    }
    
    appendChatMessage("system", responseText);
  }, 1000);
}

function handleAIChatSubmit(e) {
  e.preventDefault();
  const inputEl = document.getElementById("chat-user-input");
  const query = inputEl.value.trim();
  if (!query) return;
  
  appendChatMessage("user", query);
  inputEl.value = "";
  
  // Show typing indicator
  appendChatMessage("system", "AURA Agent formulating reply...");
  
  setTimeout(() => {
    const chatBody = document.getElementById("chat-messages-container");
    if (chatBody && chatBody.lastChild) {
      chatBody.removeChild(chatBody.lastChild);
    }
    
    let reply = "";
    const lowerQuery = query.toLowerCase();
    const data = currentProfileData ? currentProfileData.data : {};
    
    if (lowerQuery.includes("hi") || lowerQuery.includes("hello") || lowerQuery.includes("hey")) {
      reply = `Hello! How can I help you today? I can evaluate your resume, suggest skill upgrades, or guide you on aligning your passion with your profession.`;
    } else if (lowerQuery.includes("resume") || lowerQuery.includes("cv") || lowerQuery.includes("improve")) {
      reply = `To improve your resume, I suggest:
      1. Action verbs in your Chronicle (e.g., 'Engineered', 'Optimized').
      2. Grouping skills clearly by category.
      3. Adding your core Passion to show personality. You can download or print your customized resume by clicking the **Print / PDF** button and selecting "Professional CV / Resume" layout.`;
    } else if (lowerQuery.includes("job") || lowerQuery.includes("suggestion") || lowerQuery.includes("find")) {
      reply = `Based on your profile, the best matched AI-resistant roles are:
      1. **${getJobSuggestionsForProfile(data)[0].title}** (${getJobSuggestionsForProfile(data)[0].match}% match)
      2. **${getJobSuggestionsForProfile(data)[1].title}** (${getJobSuggestionsForProfile(data)[1].match}% match)
      You should focus on physical-hardware or highly logical roles which are secure from standard AI text models.`;
    } else if (lowerQuery.includes("passion") || lowerQuery.includes("boring") || lowerQuery.includes("love")) {
      reply = `If your passion (${data.passion || 'what you love'}) differs from your current job, you can bridge the gap by:
      - Creating a side project combining the two.
      - Acquiring skills in *${data.skillUpgrade || 'target sectors'}*.
      - Gradually positioning yourself in niche markets like *${data.targetIndustries || 'related industries'}*.`;
    } else {
      reply = `Thank you for your response! I have analyzed: "${escapeHtml(query)}". 
      
For a role as **${data.targetJob || 'Systems Lead'}**, your answer demonstrates excellent reasoning. Remember to always quantify your achievements (e.g., 'reduced overhead by 15%') and detail your physical validation steps when talking to interviewers. Let me know if you would like me to ask another question!`;
    }
    
    appendChatMessage("system", reply);
  }, 1000);
}
