/* ==========================================
   AURA INTERACTIVE DATABASE MANAGER (IndexedDB & SQLite Sync)
   ========================================== */

const DB_NAME = "aura_dossier_db";
const DB_VERSION = 2;

let dbInstance = null;
let isBackendOnline = false;

// Default Seed Profiles
const SEED_PROFILES = [
  {
    id: "profile_elena_rostova",
    userId: "guest",
    name: "Elena Rostova (Biosensor Engineer)",
    data: {
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
      passion: "Building carbon-silicon symbiotic computing interfaces and space habitats",
      targetJob: "Principal Symbiosis Systems Engineer",
      targetIndustries: "Biotechnology, Aerospace, Environmental Robotics",
      aiWorkPreference: "collaborative",
      
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
    }
  },
  {
    id: "profile_marcus_chen",
    userId: "guest",
    name: "Dr. Marcus Chen (Quantum Architect)",
    data: {
      name: "Dr. Marcus Chen",
      tagline: "Quantum Logic Synthesis Lead & Compiler Architect",
      pronouns: "He / Him / Code",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
      bio: "Forging compiler infrastructures that bridge classical programming paradigms and superconducting quantum computer frameworks. Architect of high-density topological error correction translation mechanisms.",
      email: "marcus.chen@quantum-logic.com",
      phone: "+1 (617) 502-3928",
      location: "Boston, USA (Hybrid)",
      website: "https://chen-quantum.io",
      github: "github.com/marcus-qubit",
      linkedin: "linkedin.com/in/marcus-chen-quantum",
      twitter: "twitter.com/marcus_qubit",
      instagram: "",
      facebook: "",
      youtube: "",
      tiktok: "",
      medium: "medium.com/@marcus-qubit",
      
      height: "182",
      weight: "75",
      bloodGroup: "A+",
      dietType: "Keto / Paleo-Hybrid Diet",
      eyeColor: "Black",
      hairColor: "Charcoal Black",
      allergies: "Shellfish, Gluten",
      medicalConditions: "None",
      fitnessLevel: "9",
      activityLevel: "athlete",
      sleepRhythm: "lion",
      waterGoal: "4.0",
      
      mbti: "INTP",
      enneagram: "5w4 (The Iconoclast)",
      zodiac: "Virgo",
      learningStyle: "visual",
      coreValues: "Precision, Logical Consistency, Intellectual Freedom, Discovery",
      strengths: "Abstract Algebra, Compiler Optimization, Hardware-Level Translation, Focus",
      growthAreas: "Empathy Expression, Impatience with legacy stacks, Over-simplification of complex socio-dynamics",
      curiosities: "Topological braid computation, Classical Go variants, Late Roman fortification systems",
      stressCoping: "Simulated speed-run chess, running sub-4 minute miles, solitary tea brewing",
      
      lifeMotto: "\"Nature isn't classical, dammit, and if you want to make a simulation of nature, you'd better make it quantum mechanical.\" - Richard Feynman",
      hobbies: "Chess, Distance Running, Go Board Game, Woodworking",
      travelStyle: "Sparse environments, quiet research retreats, remote mountain observatories",
      workEnvironment: "hybrid",
      socialBattery: "solitary",
      dailyRoutine: "05:00 Running & Stretching | 06:30 Tea & Math research study | 08:30 Compiler build verification | 13:00 Quantum processor calibration sync | 16:00 Solitary code synthesis | 19:00 Board game review & wood craft.",
      passion: "Mapping mathematical abstractions to physical realities and playing grandmaster chess",
      targetJob: "Quantum Compiler & Superconducting Logic Designer",
      targetIndustries: "Quantum Computing, Cryptography, High Performance Compute",
      aiWorkPreference: "resistant",
      
      skills: [
        { name: "Quantum Logic Synthesis", level: 98, category: "technical" },
        { name: "C++ Compiler Optimization", level: 95, category: "technical" },
        { name: "LLVM Backends", level: 90, category: "technical" },
        { name: "Qiskit / OpenQASM", level: 94, category: "tools" },
        { name: "LaTeX Scientific Draft", level: 85, category: "tools" },
        { name: "Logical Architecture", level: 96, category: "soft" },
        { name: "Complex Problem Analysis", level: 98, category: "soft" },
        { name: "Academic Drafting", level: 90, category: "creative" },
        { name: "Go Game Strategy", level: 85, category: "creative" }
      ],
      work: [
        { company: "Cerebrum Quantum Solutions", role: "Principal Compiler Engineer", dates: "Oct 2022 - Present", details: "- Designed and compiled code generators mapping high-level instructions onto 127-qubit superconducting chips.\n- Reduced quantum gate operation depths by 22% using advanced schedule optimizations.\n- Integrated topological error mitigation algorithms directly inside compiler middleware." },
        { company: "MIT Research Labs", role: "Quantum Software Fellow", dates: "Sep 2019 - Aug 2022", details: "- Developed open-source simulators for high-fidelity noisy intermediate-scale quantum devices.\n- Authored 4 papers in quantum circuit optimization architectures." }
      ],
      edu: [
        { school: "MIT", degree: "Ph.D. Computer Science & Quantum Information", dates: "2015 - 2019", details: "Thesis: Optimal gate decomposition under strict hardware constraints." },
        { school: "Stanford University", degree: "B.S. Mathematics & Computer Science", dates: "2011 - 2015", details: "Graduated with absolute highest distinction." }
      ],
      projects: [
        { name: "Q-Opt Compiler backend", link: "github.com/marcus-qubit/q-opt", desc: "LLVM-like optimization pass mapping logic directly to physical layout constraints." },
        { name: "Super-Sim 100", link: "github.com/marcus-qubit/super-sim-100", desc: "Highly parallel C++ simulator modeling noise distributions in topological arrays." }
      ],
      attachments: []
    }
  },
  {
    id: "profile_sarah_jenkins",
    userId: "guest",
    name: "Dr. Sarah Jenkins (Marine Ecologist)",
    data: {
      name: "Dr. Sarah Jenkins",
      tagline: "Director of Ecological Biosphere & Biosphere Telemetry Architect",
      pronouns: "She / Her / Scientist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256",
      bio: "Creating large-scale telemetry frameworks for marine reefs and synthetic coastal environments. Integrating biosensing networks to trace climate degradation and orchestrate bio-remediation protocols.",
      email: "s.jenkins@reef-reserve.org",
      phone: "+61 (02) 994-2831",
      location: "Sydney, Australia (Hybrid / Field Operations)",
      website: "https://reef-reserve.org",
      github: "github.com/sarah-reefs",
      linkedin: "linkedin.com/in/sarah-jenkins-eco",
      twitter: "twitter.com/sarah_ecology",
      instagram: "instagram.com/sarah.underwater",
      facebook: "",
      youtube: "",
      tiktok: "",
      medium: "medium.com/@sarah-reefs",
      
      height: "168",
      weight: "59",
      bloodGroup: "B-",
      dietType: "Vegan & Nutrient-Dense Whole Foods",
      eyeColor: "Emerald Green",
      hairColor: "Sandy Blonde",
      allergies: "Bee Stings",
      medicalConditions: "None",
      fitnessLevel: "9",
      activityLevel: "active",
      sleepRhythm: "bear",
      waterGoal: "3.2",
      
      mbti: "ENFJ",
      enneagram: "2w3 (The Host & Helper)",
      zodiac: "Pisces",
      learningStyle: "kinesthetic",
      coreValues: "Symbiosis, Preservation, Community Action, Transparency",
      strengths: "Ecological Mapping, Scientific Communication, Field Device Engineering, Public Relations",
      growthAreas: "Over-committing to projects, emotional drain from environmental loss, stubbornness",
      curiosities: "Symbiotic dinoflagellate genomics, ancient Polynesian voyaging, underwater acoustics",
      stressCoping: "Free diving down to 25 meters, macro underwater photography, sketch-booking",
      
      lifeMotto: "\"The sea, once it casts its spell, holds one in its net of wonder forever.\" - Jacques Cousteau",
      hobbies: "Scuba Diving, Free Diving, Scientific Sketching, Kayaking",
      travelStyle: "Coastal environments, coral atolls, remote marine reserves and field research outposts",
      workEnvironment: "office",
      socialBattery: "balanced",
      dailyRoutine: "06:30 Yoga & hydration | 07:30 Review sensor telemetry data sheets | 09:30 Boat launch and reef field monitoring | 14:00 Lab data entry & biosphere modelling | 17:00 Scientific paper draft review | 19:30 Dive gear prep & Sketch-book entry.",
      passion: "Saving deep marine coral structures and photographing underwater biosystems",
      targetJob: "Marine Biosphere Restoration Director",
      targetIndustries: "Marine Conservation, Environmental Telemetry, IoT Science",
      aiWorkPreference: "pure-human",
      
      skills: [
        { name: "Field Sensor Deployment", level: 96, category: "technical" },
        { name: "Oceanographic Telemetry Models", level: 90, category: "technical" },
        { name: "Environmental Impact Assessment", level: 94, category: "technical" },
        { name: "R-Language Data Analysis", level: 85, category: "tools" },
        { name: "Underwater Photogrammetry", level: 88, category: "tools" },
        { name: "Public Science Communication", level: 95, category: "soft" },
        { name: "Cross-Disciplinary Coordination", level: 92, category: "soft" },
        { name: "Scientific Visual Sketching", level: 80, category: "creative" },
        { name: "Ecological Restoration Planning", level: 90, category: "creative" }
      ],
      work: [
        { company: "Oceanic Biosphere Reserve Association", role: "Ecological Monitoring Director", dates: "Mar 2020 - Present", details: "- Spearheaded the CoralWatch IoT telemetry rollout mapping thermal thresholds across 12 monitoring zones.\n- Managed a team of 8 marine technicians, 4 research vessels, and 12 autonomous hydrophone rigs.\n- Co-authored bio-remediation protocols adopted by international reef conservation agreements." },
        { company: "Queensland Marine Research Center", role: "Marine Lab Field Specialist", dates: "Nov 2016 - Feb 2020", details: "- Designed robust waterproof sensor housings housing oxygen/salinity telemetry probes.\n- Conducted over 400 research dives gathering core algal sample matrices." }
      ],
      edu: [
        { school: "James Cook University", degree: "Ph.D. Marine Ecology & Biosystems", dates: "2012 - 2016", details: "Focus on thermal adaptation vectors in tropical zooxanthellae." },
        { school: "University of Sydney", degree: "B.S. Marine Biology", dates: "2008 - 2012", details: "First class honors." }
      ],
      projects: [
        { name: "Reef-Sense IoT", link: "github.com/sarah-reefs/reef-sense-iot", desc: "Low-power mesh firmware for distributed underwater temperature and light monitoring." },
        { name: "CoralDecide Model", link: "github.com/sarah-reefs/coral-decide", desc: "R-based predictive model assessing bleach recovery indices under high-alkalinity interventions." }
      ],
      attachments: []
    }
  }
];

// Check backend status
async function checkBackendStatus() {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const info = await res.json();
      isBackendOnline = (info.status === 'healthy');
    } else {
      isBackendOnline = false;
    }
  } catch (e) {
    isBackendOnline = false;
  }
  return isBackendOnline;
}

// Initialize Database Connection
function initDb() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB initialization error:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = async (event) => {
      dbInstance = event.target.result;
      await checkBackendStatus();
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store Users: key = username
      if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "username" });
      }

      // Store Profiles: key = id
      if (!db.objectStoreNames.contains("profiles")) {
        const profileStore = db.createObjectStore("profiles", { keyPath: "id" });
        profileStore.createIndex("userId", "userId", { unique: false });
      }

      console.log("IndexedDB stores configured.");
    };
  });
}

// Seed Initial Data if empty
function seedDefaultDb() {
  return new Promise((resolve, reject) => {
    initDb().then((db) => {
      const transaction = db.transaction(["profiles"], "readwrite");
      const store = transaction.objectStore("profiles");
      const countRequest = store.count();

      countRequest.onsuccess = async () => {
        if (countRequest.result === 0) {
          console.log("Seeding default profiles into IndexedDB...");
          
          let seededCount = 0;
          for (const profile of SEED_PROFILES) {
            const addReq = store.add(profile);
            addReq.onsuccess = async () => {
              seededCount++;
              if (seededCount === SEED_PROFILES.length) {
                // Also seed backend if online
                if (isBackendOnline) {
                  try {
                    for (const p of SEED_PROFILES) {
                      await fetch('/api/profiles', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(p)
                      });
                    }
                  } catch(e) {
                    console.error("Backend seeding error:", e);
                  }
                }
                resolve(true);
              }
            };
            addReq.onerror = (e) => {
              console.error("Error seeding profile:", e);
            };
          }
        } else {
          resolve(false);
        }
      };

      countRequest.onerror = () => {
        reject(countRequest.error);
      };
    });
  });
}

// Get Profiles with Backend Synchronization
function getProfiles(userId = "guest") {
  return new Promise((resolve, reject) => {
    initDb().then(async (db) => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`/api/profiles?userId=${encodeURIComponent(userId)}`);
          if (res.ok) {
            const profiles = await res.json();
            
            // Sync with local IndexedDB: Overwrite local copies with server copies
            const transaction = db.transaction(["profiles"], "readwrite");
            const store = transaction.objectStore("profiles");
            
            // Delete local profiles for this user that are not on backend
            const index = store.index("userId");
            const request = index.getAll(userId);
            request.onsuccess = () => {
              const localProfiles = request.result;
              localProfiles.forEach(lp => {
                if (!profiles.find(p => p.id === lp.id)) {
                  store.delete(lp.id);
                }
              });
            };

            // Write server profiles to IndexedDB
            profiles.forEach(p => {
              store.put(p);
            });
            
            transaction.oncomplete = () => {
              resolve(profiles);
            };
            transaction.onerror = () => {
              resolve(profiles);
            };
            return;
          }
        } catch (e) {
          console.warn("Backend profiles fetch failed, falling back to local storage:", e);
        }
      }

      // Offline or backend failed: read from IndexedDB
      const transaction = db.transaction(["profiles"], "readonly");
      const store = transaction.objectStore("profiles");
      const index = store.index("userId");
      const request = index.getAll(userId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  });
}

// Get Single Profile
function getProfile(profileId) {
  return new Promise((resolve, reject) => {
    initDb().then((db) => {
      const transaction = db.transaction(["profiles"], "readonly");
      const store = transaction.objectStore("profiles");
      const request = store.get(profileId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  });
}

// Save/Update Profile
function saveProfile(userId, profileId, name, data) {
  return new Promise((resolve, reject) => {
    initDb().then(async (db) => {
      const profile = { id: profileId, userId, name, data };

      // Write to IndexedDB first
      const transaction = db.transaction(["profiles"], "readwrite");
      const store = transaction.objectStore("profiles");
      store.put(profile);

      transaction.oncomplete = async () => {
        if (isBackendOnline) {
          try {
            const res = await fetch('/api/profiles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(profile)
            });
            if (!res.ok) {
              console.error("Backend save failed:", await res.text());
            }
          } catch(e) {
            console.error("Backend save network error:", e);
          }
        }
        resolve(profile);
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  });
}

// Delete Profile
function deleteProfile(profileId) {
  return new Promise((resolve, reject) => {
    initDb().then((db) => {
      const transaction = db.transaction(["profiles"], "readwrite");
      const store = transaction.objectStore("profiles");
      
      const delReq = store.delete(profileId);
      delReq.onsuccess = async () => {
        if (isBackendOnline) {
          try {
            const res = await fetch(`/api/profiles/${encodeURIComponent(profileId)}`, {
              method: 'DELETE'
            });
            if (!res.ok) {
              console.error("Backend delete failed:", await res.text());
            }
          } catch(e) {
            console.error("Backend delete network error:", e);
          }
        }
        resolve(true);
      };
      delReq.onerror = () => {
        reject(delReq.error);
      };
    });
  });
}

// Clear All User Profiles (Purge)
function clearUserProfiles(userId = "guest") {
  return new Promise((resolve, reject) => {
    initDb().then((db) => {
      const transaction = db.transaction(["profiles"], "readwrite");
      const store = transaction.objectStore("profiles");
      const index = store.index("userId");
      const request = index.openCursor(userId);

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          // Trigger backend clear
          if (isBackendOnline) {
            fetch('/api/profiles/clear-all', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId })
            }).catch(e => console.error("Backend profiles purge failed:", e));
          }
          resolve(true);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  });
}

// Register user
function registerUser(username, password) {
  return new Promise((resolve, reject) => {
    initDb().then(async (db) => {
      if (isBackendOnline) {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          
          if (!res.ok) {
            const errData = await res.json();
            reject(errData.error || "Registration failed.");
            return;
          }
          
          // If backend registration succeeds, cache locally
          const transaction = db.transaction(["users"], "readwrite");
          const store = transaction.objectStore("users");
          store.put({ username, password });
          transaction.oncomplete = () => resolve(true);
          transaction.onerror = () => reject("Failed to register locally.");
          return;
        } catch (e) {
          reject("Authentication server connection error.");
          return;
        }
      }

      // Offline registration fallback
      const transaction = db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");
      
      const checkReq = store.get(username);
      checkReq.onsuccess = () => {
        if (checkReq.result) {
          reject("Username already exists.");
          return;
        }

        const addReq = store.add({ username, password });
        addReq.onsuccess = () => {
          resolve(true);
        };
        addReq.onerror = () => {
          reject("Offline registration database error.");
        };
      };
      checkReq.onerror = () => {
        reject(checkReq.error);
      };
    });
  });
}

// Authenticate user
function authenticateUser(username, password) {
  return new Promise((resolve, reject) => {
    initDb().then(async (db) => {
      if (isBackendOnline) {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          
          if (res.status === 200) {
            // Success: update/put operator password locally as well for offline use
            const transaction = db.transaction(["users"], "readwrite");
            const store = transaction.objectStore("users");
            store.put({ username, password });
            resolve(true);
            return;
          } else if (res.status === 401) {
            resolve(false);
            return;
          }
        } catch (e) {
          console.warn("Backend auth failed, falling back to local credentials:", e);
        }
      }

      // Fallback local auth
      const transaction = db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      
      const request = store.get(username);
      request.onsuccess = () => {
        const user = request.result;
        if (user && user.password === password) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  });
}

// Export functions to window
window.AuraDB = {
  initDb,
  seedDefaultDb,
  getProfiles,
  getProfile,
  saveProfile,
  deleteProfile,
  clearUserProfiles,
  registerUser,
  authenticateUser,
  isBackendOnline: () => isBackendOnline,
  SEED_PROFILES
};
