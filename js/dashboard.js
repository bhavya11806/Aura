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

function executePDFPrint() {
  const isMonochrome = document.getElementById("pdf-opt-monochrome").checked;
  const printPersonal = document.getElementById("print-opt-personal").checked;
  const printProfessional = document.getElementById("print-opt-professional").checked;
  const printVitality = document.getElementById("print-opt-vitality").checked;
  const printCognitive = document.getElementById("print-opt-cognitive").checked;

  if (isMonochrome) {
    document.body.classList.add("print-monochrome");
  } else {
    document.body.classList.remove("print-monochrome");
  }

  // Force all dashboards display during print so selective hiding handles sections
  document.body.classList.add("print-all-dashboards");

  // Personal Profile
  if (!printPersonal) {
    document.body.classList.add("print-hide-personal");
  } else {
    document.body.classList.remove("print-hide-personal");
  }

  // Professional CV
  if (!printProfessional) {
    document.body.classList.add("print-hide-professional");
  } else {
    document.body.classList.remove("print-hide-professional");
  }

  // Vitality
  if (!printVitality) {
    document.body.classList.add("print-hide-vitality");
  } else {
    document.body.classList.remove("print-hide-vitality");
  }

  // Cognitive
  if (!printCognitive) {
    document.body.classList.add("print-hide-cognitive");
  } else {
    document.body.classList.remove("print-hide-cognitive");
  }

  // Close modal
  closeModal("modal-pdf");

  // Trigger print after modal transitions out
  setTimeout(() => {
    window.print();
    
    // Clean up print classes
    setTimeout(() => {
      document.body.classList.remove("print-monochrome");
      document.body.classList.remove("print-all-dashboards");
      document.body.classList.remove("print-hide-personal");
      document.body.classList.remove("print-hide-professional");
      document.body.classList.remove("print-hide-vitality");
      document.body.classList.remove("print-hide-cognitive");
    }, 1000);
  }, 400);
}
