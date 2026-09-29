/* ═══════════════════════════════════════════════════════════════
   RUBRIC DESIGN TOOL — rubric-app.js
   CFE @ American University
═══════════════════════════════════════════════════════════════ */

/* ── STATE ──────────────────────────────────────────────────── */
const state = {
  currentPage: 'welcome',
  completedSteps: [],
  step1: {
    school: '', program: '', courseLevel: '',
    assignmentName: '', assignmentType: '', customType: '', closestMatch: ''
  },
  step2: {
    prompt: '', aiPolicy: '',
    checklistOverrides: {}, checklistScores: {}
  },
  step3: { successVision: '', aToBGap: '' },
  step4: { commonMistakes: '', gradingFrustrations: '' },
  step5: { criteria: [] },
  step6: {
    method: '',        // 'weighted' | 'points' | 'weighted_points' | 'descriptive'
    weights: {}        // criterionId → number (percentage)
  },
  step7: {
    levelScheme: '',
    levelNames: [],
    levelPoints: {}    // levelName → number
  },
  step8: { descriptors: {} },
  step9: {}
};

/* ── DATA: SCHOOLS ──────────────────────────────────────────── */
const schoolData = {
  cas:  { label: 'College of Arts & Sciences (CAS)', programs: ['Anthropology','Art History','Biology','Chemistry','Communication Studies','Computer Science','Economics','Environmental Science','Film & Media Arts','Foreign Languages','Graphic Design','History','International Studies','Justice, Law & Criminology','Literature','Mathematics & Statistics','Music','Philosophy & Religion','Physics','Political Science','Psychology','Public Health','Sociology','Theater','Women\'s, Gender & Sexuality Studies'] },
  kogod:{ label: 'Kogod School of Business', programs: ['Accounting','Business Administration','Finance','Information Technology','International Business','Management','Marketing','Real Estate'] },
  soc:  { label: 'School of Communication (SOC)', programs: ['Communication Studies','Film & Media Arts','Journalism','Political Communication','Public Communication','Strategic Communication'] },
  sis:  { label: 'School of International Service (SIS)', programs: ['Development Management','Environmental Policy','Global Governance, Politics & Security','Global Media','International Affairs','International Communication','International Development','International Economic Relations','Peace & Conflict Resolution','U.S. Foreign Policy'] },
  spa:  { label: 'School of Public Affairs (SPA)', programs: ['Criminal Justice','Government','Justice & Law','Key Executive Leadership','Organization Development','Political Science','Public Administration','Public Policy'] },
  wce:  { label: 'Washington College of Law (WCL)', programs: ['Law','Legal Studies','Tax & Estate Planning'] },
  soep: { label: 'School of Education (SOE)', programs: ['Curriculum & Instruction','Educational Leadership','Elementary Education','Secondary Education','Special Education','TESOL & Bilingual Education'] }
};

/* ── DATA: ASSIGNMENT TYPES ─────────────────────────────────── */
const assignmentTypes = [
  { id:'essay',        label:'Essay / Research Paper',      icon:'✍️',  description:'Argumentative, analytical, or research-driven written work',              criteriaHints:['thesis','argumentation','evidence','organization','citations','style'] },
  { id:'case_study',   label:'Case Study',                   icon:'🔍',  description:'Analysis of a real or hypothetical scenario using course concepts',       criteriaHints:['problem identification','analysis','application of theory','recommendations','evidence'] },
  { id:'project',      label:'Project / Design Work',        icon:'🛠️',  description:'Multi-step applied project with a tangible deliverable',                  criteriaHints:['concept development','execution','creativity','process','reflection','presentation','submission'] },
  { id:'presentation', label:'Presentation / Speech',        icon:'🎤',  description:'Oral or multimedia presentation to an audience',                          criteriaHints:['content','organization','delivery','visuals','engagement','time management'] },
  { id:'discussion',   label:'Discussion / Participation',   icon:'💬',  description:'In-class or online dialogue, seminar contributions',                      criteriaHints:['preparation','contribution quality','listening','synthesis','frequency'] },
  { id:'lab',          label:'Lab Report / Field Work',      icon:'🔬',  description:'Experimental, observational, or field-based reporting',                   criteriaHints:['methodology','data collection','analysis','conclusion','documentation','safety','submission'] },
  { id:'portfolio',    label:'Portfolio',                    icon:'📁',  description:'Curated collection of work demonstrating growth over time',                criteriaHints:['reflection','breadth','depth','growth','selection rationale','presentation','submission'] },
  { id:'creative',     label:'Creative Work',                icon:'🎨',  description:'Original artistic, literary, or multimedia creation',                     criteriaHints:['originality','technique','concept development','execution','artist statement'] },
  { id:'problem_set',  label:'Problem Set / Exam',           icon:'🧮',  description:'Quantitative, coding, or structured problem-solving',                     criteriaHints:['accuracy','methodology','communication of reasoning'] },
  { id:'reflection',   label:'Reflection / Journal',         icon:'📔',  description:'Personal reflective writing connecting experience to learning',            criteriaHints:['depth of reflection','connection to course','critical thinking','voice','consistency'] },
  { id:'service',      label:'Service Learning / Internship',icon:'🤝',  description:'Community-engaged learning or professional field experience',              criteriaHints:['engagement (service)','connection to learning outcomes','professionalism','reflection','submission'] },
  { id:'custom',       label:'Other / Custom',               icon:'✏️',  description:"My assignment doesn't fit these categories exactly",                      criteriaHints:[] }
];

const closestMatchOptions = assignmentTypes.filter(t => t.id !== 'custom');

/* ── DATA: CRITERIA LIBRARY ─────────────────────────────────── */
const criteriaLibrary = {
  thesis:                     { name:'Thesis / Central Argument',           description:'States a clear, specific, arguable claim that guides the entire work' },
  argumentation:              { name:'Argumentation & Reasoning',           description:'Develops a logical line of reasoning with well-supported claims' },
  evidence:                   { name:'Use of Evidence',                     description:'Selects, integrates, and analyzes appropriate sources or data' },
  organization:               { name:'Organization & Structure',            description:'Presents ideas in a coherent, purposeful sequence with clear transitions' },
  citations:                  { name:'Citation & Academic Integrity',       description:'Formats and applies citations correctly and consistently' },
  style:                      { name:'Writing Style & Clarity',             description:'Communicates ideas clearly using appropriate academic register' },
  'problem identification':   { name:'Problem Identification',              description:'Accurately identifies and frames the core problem or challenge' },
  analysis:                   { name:'Analysis & Critical Thinking',        description:'Applies course concepts to examine and interpret the situation deeply' },
  'application of theory':    { name:'Application of Theory',              description:'Correctly applies relevant frameworks, models, or disciplinary concepts' },
  recommendations:            { name:'Recommendations',                     description:'Proposes feasible, well-reasoned solutions grounded in the analysis' },
  'concept development':      { name:'Concept Development',                 description:'Develops a focused, original concept or design rationale' },
  execution:                  { name:'Execution & Craft',                   description:'Demonstrates technical skill and attention to detail in the final product' },
  creativity:                 { name:'Creativity & Originality',            description:'Shows inventive thinking and personal voice beyond the expected' },
  process:                    { name:'Process & Iteration',                 description:'Documents a thoughtful, iterative development process' },
  reflection:                 { name:'Reflection & Self-Assessment',        description:'Critically examines own learning, choices, and growth' },
  presentation:               { name:'Presentation & Visual Design',        description:'Communicates visually and verbally with clarity and professionalism' },
  content:                    { name:'Content & Knowledge',                 description:'Demonstrates accurate, thorough understanding of the subject matter' },
  delivery:                   { name:'Delivery & Speaking Skills',          description:'Speaks clearly, with appropriate pace, tone, and confidence' },
  visuals:                    { name:'Visual Aids',                         description:'Uses slides or materials that enhance rather than distract from the message' },
  engagement:                 { name:'Audience Engagement',                 description:'Connects with the audience through eye contact, questions, or interaction' },
  'time management':          { name:'Time Management',                     description:'Respects time limits while covering key material adequately' },
  preparation:                { name:'Preparation',                         description:'Comes to discussion having completed and thought about assigned readings' },
  'contribution quality':     { name:'Quality of Contributions',            description:'Offers substantive, well-reasoned comments that advance discussion' },
  listening:                  { name:'Active Listening & Responsiveness',   description:'Responds thoughtfully to peers rather than repeating prior points' },
  synthesis:                  { name:'Synthesis',                           description:'Connects multiple ideas or texts to build a richer understanding' },
  frequency:                  { name:'Frequency of Participation',          description:'Contributes regularly and equitably across sessions' },
  methodology:                { name:'Methodology / Procedure',             description:'Follows appropriate methods with accuracy and documentation' },
  'data collection':          { name:'Data Collection & Recording',         description:'Gathers data carefully, accurately, and in an organized format' },
  conclusion:                 { name:'Conclusions & Interpretation',        description:'Draws warranted conclusions from data; acknowledges limitations' },
  documentation:              { name:'Documentation',                       description:'Maintains complete, clear, and reproducible records' },
  safety:                     { name:'Safety & Lab Protocols',              description:'Demonstrates awareness and compliance with safety standards' },
  breadth:                    { name:'Breadth of Work',                     description:'Includes a range of work that represents the scope of learning' },
  depth:                      { name:'Depth & Complexity',                  description:'Selected pieces show sophisticated engagement with ideas or skills' },
  growth:                     { name:'Evidence of Growth',                  description:'Demonstrates measurable development from earlier to later work' },
  'selection rationale':      { name:'Selection Rationale',                 description:'Justifies the inclusion of each piece with clear reasoning' },
  originality:                { name:'Originality & Voice',                 description:"Creates work that is distinctly the student's own with a recognizable perspective" },
  technique:                  { name:'Technique & Craft',                   description:'Demonstrates command of medium-specific skills and tools' },
  'artist statement':         { name:'Artist / Creator Statement',          description:'Reflects meaningfully on intent, process, and outcome' },
  accuracy:                   { name:'Accuracy & Correctness',              description:'Produces correct answers using valid procedures' },
  'communication of reasoning':{ name:'Communication of Reasoning',        description:'Shows work and explains thought process clearly' },
  'depth of reflection':      { name:'Depth of Reflection',                 description:'Moves beyond surface description to genuine critical examination' },
  'connection to course':     { name:'Connection to Course Concepts',       description:'Links personal experience to theories, readings, or key ideas' },
  'critical thinking':        { name:'Critical Thinking',                   description:'Questions assumptions and explores multiple perspectives' },
  voice:                      { name:'Voice & Authenticity',                description:'Writes with a genuine, personal perspective that feels honest' },
  consistency:                { name:'Consistency & Completeness',          description:'Submits entries regularly and addresses required prompts fully' },
  'engagement (service)':     { name:'Engagement & Professionalism',        description:'Participates actively and respectfully in the community context' },
  'connection to learning outcomes':{ name:'Connection to Learning Outcomes', description:'Links field activities to course goals and academic content' },
  professionalism:            { name:'Professionalism',                     description:'Behaves appropriately, meets commitments, and communicates professionally' },
  submission:                 { name:'Submission & Professionalism',        description:'All required files submitted in correct formats, correctly named, and on time' }
};

const disciplineModifiers = {
  cas:  ['critical thinking','synthesis','analysis'],
  kogod:['recommendations','professionalism','data collection'],
  soc:  ['creativity','voice','engagement'],
  sis:  ['application of theory','critical thinking','recommendations'],
  spa:  ['analysis','recommendations','professionalism'],
  wce:  ['argumentation','citations','analysis'],
  soep: ['reflection','depth of reflection','connection to course']
};

/* ── DATA: PERFORMANCE LEVEL SCHEMES ────────────────────────── */
const levelSchemes = [
  { id:'4point',  label:'4-Point Scale',  names:['Excellent','Proficient','Developing','Beginning'],                       note:'Most widely used; maps cleanly to A/B/C/D grade bands' },
  { id:'5point',  label:'5-Point Scale',  names:['Exemplary','Accomplished','Developing','Beginning','Insufficient'],      note:'Adds granularity for complex tasks; aligns with A/B/C/D/F' },
  { id:'3point',  label:'3-Point Scale',  names:['Meets Expectations','Approaching Expectations','Below Expectations'],    note:'Faster to grade; best for simpler or early-semester tasks' },
  { id:'custom',  label:'Custom Labels',  names:[],                                                                         note:'Enter your own level names below' }
];

/* ── DATA: SCORING METHODS ───────────────────────────────────── */
const scoringMethods = [
  {
    id: 'weighted_points',
    label: 'Weighted Criteria + Points',
    icon: '⚖️',
    description: 'Each criterion has a percentage weight AND each level has a point value. Best for complex assignments where some criteria matter more than others.',
    recommended: true
  },
  {
    id: 'weighted',
    label: 'Weighted Criteria Only',
    icon: '📊',
    description: 'Each criterion has a percentage weight (must total 100%). No point values per level — weight alone determines contribution to grade.',
    recommended: false
  },
  {
    id: 'points',
    label: 'Points per Level Only',
    icon: '🔢',
    description: 'Each performance level has a point value. All criteria count equally. Good for straightforward assignments with equal-weight criteria.',
    recommended: false
  },
  {
    id: 'descriptive',
    label: 'Descriptive Only',
    icon: '📝',
    description: 'No numbers attached. Rubric is used purely for feedback and guidance, not scoring. Common in studio, creative, and early-draft contexts.',
    recommended: false
  }
];

/* ── NAVIGATION ─────────────────────────────────────────────── */
const pageOrder = ['welcome','step1','step2','step3','step4','step5','step6','step7','step8','step9'];

function showPage(pageId) {
  const idx = pageOrder.indexOf(pageId);
  if (pageId !== 'welcome') {
    const prev = pageOrder[idx - 1];
    if (prev && prev !== 'welcome' && !state.completedSteps.includes(prev) && !state.completedSteps.includes(pageId)) {
      showToast('Please complete the previous step first.', 'warn');
      return;
    }
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (navItem) navItem.classList.add('active');
  state.currentPage = pageId;
  window.scrollTo(0, 0);
  updateProgress();
}

function updateNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    const page = item.dataset.page;
    if (page === 'welcome') { item.classList.remove('disabled'); return; }
    const idx = pageOrder.indexOf(page);
    const prev = pageOrder[idx - 1];
    if (state.completedSteps.includes(page)) {
      item.classList.remove('disabled');
      item.classList.add('done');
    } else if (prev === 'welcome' || state.completedSteps.includes(prev)) {
      item.classList.remove('disabled');
    } else {
      item.classList.add('disabled');
    }
    const chk = item.querySelector('.nav-check');
    if (chk) chk.style.display = state.completedSteps.includes(page) ? 'inline' : 'none';
  });
}

function updateProgress() {
  const total = pageOrder.length - 1;
  const done  = state.completedSteps.length;
  const pct   = Math.round((done / total) * 100);
  const bar   = document.getElementById('progressFill');
  const label = document.getElementById('progressPct');
  if (bar)   bar.style.width = pct + '%';
  if (label) label.textContent = pct + '%';
}

function markStepComplete(pageId) {
  if (!state.completedSteps.includes(pageId)) state.completedSteps.push(pageId);
  updateNav();
  updateProgress();
}

/* ── THEME ──────────────────────────────────────────────────── */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.dataset.theme === 'dark';
  html.dataset.theme = isDark ? 'light' : 'dark';
  document.getElementById('themeIcon').textContent  = isDark ? '🌙' : '☀️';
  document.getElementById('themeLabel').textContent = isDark ? 'Dark Mode' : 'Light Mode';
  localStorage.setItem('rubric-theme', html.dataset.theme);
}

function loadTheme() {
  const saved = localStorage.getItem('rubric-theme');
  if (saved) {
    document.documentElement.dataset.theme = saved;
    document.getElementById('themeIcon').textContent  = saved === 'dark' ? '☀️' : '🌙';
    document.getElementById('themeLabel').textContent = saved === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
}

/* ── TOAST ──────────────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ── SAVE / LOAD ─────────────────────────────────────────────── */
function saveProgress() {
  const data = { version: 2, savedAt: new Date().toISOString(), state };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  const name = (state.step1.assignmentName || 'rubric').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  a.download = `rubric_${name}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Progress saved!', 'success');
}

function loadProgress(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.state) throw new Error('Invalid file');
      Object.assign(state, data.state);
      restoreUI();
      showToast('Progress loaded!', 'success');
    } catch { showToast('Could not load file.', 'error'); }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function restoreUI() {
  setVal('schoolSelect', state.step1.school);
  populatePrograms();
  setVal('programSelect', state.step1.program);
  setVal('courseLevel', state.step1.courseLevel);
  setVal('assignmentName', state.step1.assignmentName);
  renderTypeGrid();
  if (state.step1.assignmentType === 'custom') {
    document.getElementById('customTypeWrap').style.display = 'block';
    setVal('customTypeName', state.step1.customType);
    setVal('customTypeMatch', state.step1.closestMatch);
  }
  setVal('assignmentPrompt', state.step2.prompt);
  setVal('aiPolicyStatement', state.step2.aiPolicy);
  if (state.step2.prompt) analyzePrompt();
  setVal('successVision', state.step3.successVision);
  setVal('aToBGap', state.step3.aToBGap);
  setVal('commonMistakes', state.step4.commonMistakes);
  setVal('gradingFrustrations', state.step4.gradingFrustrations);
  renderCriteriaList();
  renderScoringMethodGrid();
  if (state.step6.method) {
    selectScoringMethod(state.step6.method, true);
    renderWeightsList();
  }
  renderLevelSchemes();
  if (state.step7.levelScheme) selectLevelScheme(state.step7.levelScheme, true);
  renderRubricGrid();
  renderRubricPreview();
  updateNav();
  updateProgress();
  showPage(state.currentPage);
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.value = val;
}

function startTool() {
  markStepComplete('welcome');
  showPage('step1');
}

/* ════════════════════════════════════════════════════════════
   STEP 1 — ASSIGNMENT CONTEXT
════════════════════════════════════════════════════════════ */

function populateSchoolSelect() {
  const sel = document.getElementById('schoolSelect');
  sel.innerHTML = '<option value="">Select your school / college</option>';
  Object.entries(schoolData).forEach(([key, val]) => {
    const opt = document.createElement('option');
    opt.value = key; opt.textContent = val.label;
    sel.appendChild(opt);
  });
}

function onSchoolChange() {
  state.step1.school = document.getElementById('schoolSelect').value;
  populatePrograms();
}

function populatePrograms() {
  const school = state.step1.school;
  const sel = document.getElementById('programSelect');
  sel.innerHTML = '<option value="">Select your program / department</option>';
  const programs = (schoolData[school] || {}).programs || [];
  programs.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p; opt.textContent = p;
    sel.appendChild(opt);
  });
  sel.disabled = !programs.length;
}

function renderTypeGrid() {
  const grid = document.getElementById('typeGrid');
  if (!grid) return;
  grid.innerHTML = '';
  assignmentTypes.forEach(type => {
    const card = document.createElement('div');
    card.className = 'type-card' + (state.step1.assignmentType === type.id ? ' selected' : '');
    card.dataset.type = type.id;
    card.onclick = () => selectType(type.id);
    card.innerHTML = `<div class="type-icon">${type.icon}</div><div class="type-label">${type.label}</div><div class="type-desc">${type.description}</div>`;
    grid.appendChild(card);
  });
}

function selectType(typeId) {
  state.step1.assignmentType = typeId;
  document.querySelectorAll('.type-card').forEach(c => c.classList.toggle('selected', c.dataset.type === typeId));
  const wrap = document.getElementById('customTypeWrap');
  if (wrap) wrap.style.display = typeId === 'custom' ? 'block' : 'none';
}

function populateClosestMatch() {
  const sel = document.getElementById('customTypeMatch');
  if (!sel) return;
  sel.innerHTML = '<option value="">— closest match —</option>';
  closestMatchOptions.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id; opt.textContent = t.label;
    sel.appendChild(opt);
  });
}

function completeStep1() {
  const name = document.getElementById('assignmentName').value.trim();
  const type = state.step1.assignmentType;
  if (!name) { showToast('Please enter an assignment name.', 'warn'); return; }
  if (!type) { showToast('Please select an assignment type.', 'warn'); return; }
  if (type === 'custom') {
    const ct = document.getElementById('customTypeName').value.trim();
    if (!ct) { showToast('Please describe your custom assignment type.', 'warn'); return; }
    state.step1.customType  = ct;
    state.step1.closestMatch = document.getElementById('customTypeMatch').value;
  }
  state.step1.school        = document.getElementById('schoolSelect').value;
  state.step1.program       = document.getElementById('programSelect').value;
  state.step1.courseLevel   = document.getElementById('courseLevel').value;
  state.step1.assignmentName = name;
  markStepComplete('step1');
  showPage('step2');
  showToast('Step 1 complete!', 'success');
}

/* ════════════════════════════════════════════════════════════
   STEP 2 — ASSIGNMENT PROMPT
════════════════════════════════════════════════════════════ */

const checklistItems = [
  { id:'deliverable', label:'Clear deliverable',            detail:'Students know exactly what they need to submit or produce.',                                     test: t => /\b(submit|create|write|produce|develop|design|record|present|turn in|deliver)\b/i.test(t) },
  { id:'purpose',     label:'Purpose or context stated',    detail:'The prompt explains why this assignment matters or who the audience is.',                         test: t => /\b(audience|purpose|context|why|in order to|so that|because|for|stakeholder|client|public)\b/i.test(t) },
  { id:'length',      label:'Scope or length specified',    detail:'Length, time, word count, or other scope signals are present.',                                   test: t => /\b(\d+\s*(pages?|words?|minutes?|slides?|sources?)|at least|no more than|approximately|between \d+ and \d+)\b/i.test(t) },
  { id:'outcome',     label:'Connected to learning outcome',detail:'The prompt references a skill, concept, or course goal students are demonstrating.',              test: t => /\b(demonstrate|apply|analyze|evaluate|synthesize|understand|use|practice|show|explore|examine|consider|reflect|assess)\b/i.test(t) },
  { id:'format',      label:'Format or structure guidance', detail:'Students know how to organize or format their work.',                                              test: t => /\b(format|structure|section|heading|outline|introduction|conclusion|body|paragraph|slide|figure|table|apa|mla|chicago|citation|style|pdf)\b/i.test(t) },
  { id:'ai_policy',   label:'AI usage policy included',     detail:'The prompt addresses whether and how AI tools may be used.',                                       test: t => /\b(ai|artificial intelligence|chatgpt|gpt|copilot|claude|gemini|llm|generative|ai.?tool|ai.?assist|ai.?policy|ai usage)\b/i.test(t) },
  { id:'criteria',    label:'Criteria or expectations hinted',detail:'The prompt mentions what quality or success looks like.',                                        test: t => /\b(criteria|rubric|grade|expect|standard|well.?written|clear|strong|effective|original|thorough|complete|quality|excellent|exemplary)\b/i.test(t) }
];

function analyzePrompt() {
  const text = document.getElementById('assignmentPrompt').value;
  state.step2.prompt = text;
  const list = document.getElementById('promptChecklist');
  if (!list) return;
  list.innerHTML = '';
  let passCount = 0;

  checklistItems.forEach(item => {
    const override = state.step2.checklistOverrides[item.id];
    const passed   = override !== undefined ? override : (text.length > 20 && item.test(text));
    if (passed) passCount++;
    state.step2.checklistScores[item.id] = passed;

    const row = document.createElement('div');
    row.className = `check-item ${passed ? 'pass' : (text.length > 30 ? 'fail' : 'warn')}`;
    row.dataset.id = item.id;
    row.innerHTML = `
      <span class="check-icon">${passed ? '✓' : '✗'}</span>
      <div class="check-content">
        <span class="check-label">${item.label}</span>
        <span class="check-detail">${item.detail}</span>
      </div>
      <button class="check-override" title="Toggle manually" onclick="toggleOverride('${item.id}')">
        ${override !== undefined ? 'Reset to Auto' : (passed ? 'Mark ✗' : 'Mark ✓')}
      </button>`;
    list.appendChild(row);
  });

  const alertEl = document.getElementById('promptAlert');
  if (alertEl) {
    const failCount = checklistItems.length - passCount;
    if (text.length < 30) { alertEl.style.display = 'none'; return; }
    if (failCount >= 3) {
      alertEl.style.display = 'block';
      alertEl.innerHTML = `<strong>Consider revising your assignment prompt first.</strong><br>${failCount} of ${checklistItems.length} quality signals are missing. A well-constructed prompt leads to better student work — and a better rubric. Research shows prompt clarity is one of the strongest predictors of rubric validity (Andrade, 2019). You can still proceed, but your rubric may need more manual refinement.`;
    } else if (failCount === 2) {
      alertEl.style.display = 'block';
      alertEl.innerHTML = `<strong>A couple of areas to consider.</strong><br>2 quality signals are missing. Adding them now will make your rubric more targeted.`;
    } else { alertEl.style.display = 'none'; }
  }
}

function toggleOverride(itemId) {
  const current  = state.step2.checklistScores[itemId];
  const existing = state.step2.checklistOverrides[itemId];
  if (existing !== undefined) delete state.step2.checklistOverrides[itemId];
  else state.step2.checklistOverrides[itemId] = !current;
  analyzePrompt();
}

function completeStep2() {
  const prompt = document.getElementById('assignmentPrompt').value.trim();
  if (prompt.length < 20) { showToast('Please paste your assignment prompt (or a draft).', 'warn'); return; }
  state.step2.prompt    = prompt;
  state.step2.aiPolicy  = document.getElementById('aiPolicyStatement').value.trim();
  markStepComplete('step2');
  showPage('step3');
  showToast('Step 2 complete!', 'success');
}

/* ════════════════════════════════════════════════════════════
   STEP 3 — SUCCESS VISION
════════════════════════════════════════════════════════════ */

function completeStep3() {
  const vision = document.getElementById('successVision').value.trim();
  if (vision.length < 20) { showToast('Please describe what an excellent submission looks like.', 'warn'); return; }
  state.step3.successVision = vision;
  state.step3.aToBGap       = document.getElementById('aToBGap').value.trim();
  markStepComplete('step3');
  showPage('step4');
  showToast('Step 3 complete!', 'success');
}

/* ════════════════════════════════════════════════════════════
   STEP 4 — WHAT GOES WRONG
════════════════════════════════════════════════════════════ */

function completeStep4() {
  const mistakes = document.getElementById('commonMistakes').value.trim();
  if (mistakes.length < 10) { showToast('Please describe at least one common student mistake.', 'warn'); return; }
  state.step4.commonMistakes       = mistakes;
  state.step4.gradingFrustrations  = document.getElementById('gradingFrustrations').value.trim();
  markStepComplete('step4');
  buildSuggestedCriteria();
  showPage('step5');
  showToast('Step 4 complete!', 'success');
}

/* ════════════════════════════════════════════════════════════
   STEP 5 — CRITERIA
════════════════════════════════════════════════════════════ */

function buildSuggestedCriteria() {
  if (state.step5.criteria.length > 0) return;
  const typeId  = state.step1.assignmentType === 'custom' ? state.step1.closestMatch : state.step1.assignmentType;
  const typeObj = assignmentTypes.find(t => t.id === typeId);
  const school  = state.step1.school;

  let hints = typeObj ? [...typeObj.criteriaHints] : [];
  (disciplineModifiers[school] || []).forEach(e => { if (!hints.includes(e)) hints.push(e); });

  const userText = (state.step3.successVision + ' ' + state.step4.commonMistakes).toLowerCase();
  Object.keys(criteriaLibrary).forEach(key => {
    if (key.split(/\s+/).some(w => userText.includes(w)) && !hints.includes(key)) hints.push(key);
  });

  const seen = new Set();
  state.step5.criteria = hints
    .filter(h => { if (criteriaLibrary[h] && !seen.has(h)) { seen.add(h); return true; } return false; })
    .slice(0, 7)
    .map((key, i) => ({
      id: 'c' + (i + 1),
      name: criteriaLibrary[key].name,
      description: criteriaLibrary[key].description,
      source: 'suggested',
      weight: ''
    }));

  renderCriteriaList();
}

function renderCriteriaList() {
  const list = document.getElementById('criteriaList');
  if (!list) return;
  list.innerHTML = '';

  state.step5.criteria.forEach((c, idx) => {
    const row = document.createElement('div');
    row.className = `criterion-row ${c.source}`;
    row.dataset.id = c.id;
    row.innerHTML = `
      <div class="criterion-num">${idx + 1}</div>
      <div class="criterion-fields">
        <input type="text" class="criterion-name" value="${escHtml(c.name)}" placeholder="Criterion name"
          oninput="updateCriterion('${c.id}','name',this.value)">
        <textarea class="criterion-desc" rows="2" placeholder="What does this criterion measure?"
          oninput="updateCriterion('${c.id}','description',this.value)">${escHtml(c.description)}</textarea>
      </div>
      <div class="criterion-actions">
        ${c.source === 'suggested' ? '<span class="suggested-badge">suggested</span>' : ''}
        <button class="icon-btn" title="Move up"   onclick="moveCriterion('${c.id}',-1)">↑</button>
        <button class="icon-btn" title="Move down" onclick="moveCriterion('${c.id}',1)">↓</button>
        <button class="icon-btn danger" title="Remove" onclick="removeCriterion('${c.id}')">✕</button>
      </div>`;
    list.appendChild(row);
  });

  const nudge = document.getElementById('criteriaCountNudge');
  if (nudge) {
    const n = state.step5.criteria.length;
    if (n < 3) {
      nudge.textContent = `${n} ${n===1?'criterion':'criteria'} — consider adding more. Most effective rubrics have 4–6 criteria.`;
      nudge.className = 'nudge warn';
    } else if (n <= 6) {
      nudge.textContent = `${n} criteria — great range. Research supports 4–6 for maximum clarity and grading efficiency.`;
      nudge.className = 'nudge pass';
    } else {
      nudge.textContent = `${n} criteria — getting complex. More than 6–7 can slow grading and overwhelm students. Consider combining related items.`;
      nudge.className = 'nudge warn';
    }
  }
}

function updateCriterion(id, field, value) {
  const c = state.step5.criteria.find(c => c.id === id);
  if (c) c[field] = value;
}

function moveCriterion(id, dir) {
  const idx = state.step5.criteria.findIndex(c => c.id === id);
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= state.step5.criteria.length) return;
  [state.step5.criteria[idx], state.step5.criteria[newIdx]] = [state.step5.criteria[newIdx], state.step5.criteria[idx]];
  renderCriteriaList();
}

function removeCriterion(id) {
  state.step5.criteria = state.step5.criteria.filter(c => c.id !== id);
  renderCriteriaList();
}

function addCustomCriterion() { addCriterion(); }
function addCriterion() {
  const newId = 'c' + Date.now();
  state.step5.criteria.push({ id: newId, name: '', description: '', source: 'custom', weight: '' });
  renderCriteriaList();
  setTimeout(() => {
    const rows = document.querySelectorAll('.criterion-row');
    if (rows.length) rows[rows.length - 1].querySelector('.criterion-name').focus();
  }, 50);
}

function completeStep5() {
  document.querySelectorAll('.criterion-row').forEach(row => {
    const id = row.dataset.id;
    const c  = state.step5.criteria.find(c => c.id === id);
    if (c) {
      c.name        = row.querySelector('.criterion-name').value.trim();
      c.description = row.querySelector('.criterion-desc').value.trim();
    }
  });
  const valid = state.step5.criteria.filter(c => c.name.trim());
  if (valid.length < 2) { showToast('Please add at least 2 criteria.', 'warn'); return; }
  state.step5.criteria = valid;
  markStepComplete('step5');
  renderScoringMethodGrid();
  renderWeightsList();
  showPage('step6');
  showToast('Step 5 complete!', 'success');
}

/* ════════════════════════════════════════════════════════════
   STEP 6 — SCORING APPROACH
════════════════════════════════════════════════════════════ */

function renderScoringMethodGrid() {
  const grid = document.getElementById('scoringMethodGrid');
  if (!grid) return;
  grid.innerHTML = '';
  scoringMethods.forEach(m => {
    const card = document.createElement('div');
    card.className = 'type-card' + (state.step6.method === m.id ? ' selected' : '');
    card.dataset.method = m.id;
    card.onclick = () => selectScoringMethod(m.id);
    card.innerHTML = `
      <div class="type-icon">${m.icon}</div>
      <div class="type-label">${m.label}${m.recommended ? ' <span class="recommended-badge">Recommended</span>' : ''}</div>
      <div class="type-desc">${m.description}</div>`;
    grid.appendChild(card);
  });
}

function selectScoringMethod(methodId, silent) {
  state.step6.method = methodId;
  document.querySelectorAll('#scoringMethodGrid .type-card').forEach(c =>
    c.classList.toggle('selected', c.dataset.method === methodId));

  const showWeights = methodId === 'weighted' || methodId === 'weighted_points';
  const showPoints  = methodId === 'points'   || methodId === 'weighted_points';

  document.getElementById('weightingSetup').style.display = showWeights ? 'block' : 'none';
  document.getElementById('pointsSetup').style.display    = showPoints  ? 'block' : 'none';

  if (showWeights && !silent) renderWeightsList();
}

function renderWeightsList() {
  const container = document.getElementById('weightsList');
  if (!container) return;
  container.innerHTML = '';

  state.step5.criteria.forEach(c => {
    if (state.step6.weights[c.id] === undefined) state.step6.weights[c.id] = '';
    const row = document.createElement('div');
    row.className = 'weight-row';
    row.innerHTML = `
      <span class="weight-label">${escHtml(c.name)}</span>
      <div class="weight-input-wrap">
        <input type="number" class="weight-input" min="0" max="100" value="${state.step6.weights[c.id]}"
          placeholder="0"
          oninput="updateWeight('${c.id}', this.value)">
        <span class="weight-pct-symbol">%</span>
      </div>`;
    container.appendChild(row);
  });
  updateWeightsTotal();
}

function updateWeight(criterionId, value) {
  state.step6.weights[criterionId] = value === '' ? '' : parseFloat(value) || 0;
  updateWeightsTotal();
}

function updateWeightsTotal() {
  const total = state.step5.criteria.reduce((sum, c) => {
    const w = parseFloat(state.step6.weights[c.id]) || 0;
    return sum + w;
  }, 0);
  const totalEl = document.getElementById('weightsTotal');
  const hintEl  = document.getElementById('weightsTotalHint');
  if (totalEl) {
    totalEl.textContent = total + '%';
    totalEl.className = 'weights-total-num' + (total === 100 ? ' valid' : ' invalid');
  }
  if (hintEl) {
    if (total === 100)       { hintEl.textContent = '✓ Weights total 100%'; hintEl.className = 'weights-hint pass'; }
    else if (total > 100)    { hintEl.textContent = `Total is ${total}% — reduce by ${total - 100}%`; hintEl.className = 'weights-hint warn'; }
    else if (total > 0)      { hintEl.textContent = `Total is ${total}% — add ${100 - total}% more to reach 100%`; hintEl.className = 'weights-hint warn'; }
    else                     { hintEl.textContent = ''; }
  }
}

function completeStep6() {
  const method = state.step6.method;
  if (!method) { showToast('Please choose a scoring approach.', 'warn'); return; }

  if (method === 'weighted' || method === 'weighted_points') {
    const total = state.step5.criteria.reduce((sum, c) => sum + (parseFloat(state.step6.weights[c.id]) || 0), 0);
    if (Math.round(total) !== 100) {
      showToast(`Weights must total 100% — currently ${total}%.`, 'warn');
      return;
    }
  }

  markStepComplete('step6');
  renderLevelSchemes();
  showPage('step7');
  showToast('Step 6 complete!', 'success');
}

/* ════════════════════════════════════════════════════════════
   STEP 7 — PERFORMANCE LEVELS
════════════════════════════════════════════════════════════ */

function renderLevelSchemes() {
  const grid = document.getElementById('levelSchemeGrid');
  if (!grid) return;
  grid.innerHTML = '';
  levelSchemes.forEach(scheme => {
    const card = document.createElement('div');
    card.className = 'level-scheme-card' + (state.step7.levelScheme === scheme.id ? ' selected' : '');
    card.dataset.scheme = scheme.id;
    card.onclick = () => selectLevelScheme(scheme.id);
    card.innerHTML = `
      <div class="scheme-label">${scheme.label}</div>
      <div class="scheme-names">${scheme.names.length ? scheme.names.join(' · ') : 'Enter your own labels below'}</div>
      <div class="scheme-note">${scheme.note}</div>`;
    grid.appendChild(card);
  });
}

function selectLevelScheme(schemeId, silent) {
  state.step7.levelScheme = schemeId;
  document.querySelectorAll('.level-scheme-card').forEach(c =>
    c.classList.toggle('selected', c.dataset.scheme === schemeId));

  const scheme = levelSchemes.find(s => s.id === schemeId);
  const wrap   = document.getElementById('levelNamesWrap');
  if (!wrap) return;

  if (schemeId === 'custom') {
    wrap.style.display = 'block';
    if (!silent || !state.step7.levelNames.length) state.step7.levelNames = ['','','',''];
    renderLevelNameInputs();
  } else {
    wrap.style.display = 'none';
    state.step7.levelNames = [...scheme.names];
  }

  renderPointValueInputs();
}

function renderLevelNameInputs() {
  const container = document.getElementById('levelNamesWrap');
  if (!container) return;
  container.innerHTML = '';
  state.step7.levelNames.forEach((name, i) => {
    const div = document.createElement('div');
    div.className = 'level-name-item';
    div.innerHTML = `
      <label>Level ${i + 1}</label>
      <input type="text" value="${escHtml(name)}" placeholder="e.g. Exemplary"
        oninput="state.step7.levelNames[${i}] = this.value; renderPointValueInputs();">
      ${i > 1 ? `<button class="icon-btn danger" onclick="removeLevelName(${i})">✕</button>` : ''}`;
    container.appendChild(div);
  });
}

function addLevelName() {
  state.step7.levelNames.push('');
  renderLevelNameInputs();
}

function removeLevelName(i) {
  state.step7.levelNames.splice(i, 1);
  renderLevelNameInputs();
}

function renderPointValueInputs() {
  const method = state.step6.method;
  if (method !== 'points' && method !== 'weighted_points') return;

  const wrap = document.getElementById('levelNamesCard');
  if (!wrap) return;

  let pointsWrap = document.getElementById('levelPointsWrap');
  if (!pointsWrap) {
    pointsWrap = document.createElement('div');
    pointsWrap.id = 'levelPointsWrap';
    pointsWrap.className = 'activity-card';
    pointsWrap.style.marginTop = '1rem';
    wrap.parentNode.insertBefore(pointsWrap, wrap.nextSibling);
  }

  const levels = state.step7.levelNames.filter(Boolean);
  if (!levels.length) { pointsWrap.style.display = 'none'; return; }

  levels.forEach(l => { if (state.step7.levelPoints[l] === undefined) state.step7.levelPoints[l] = ''; });

  pointsWrap.style.display = 'block';
  pointsWrap.innerHTML = `
    <span class="step-eyebrow">Point Values per Level</span>
    <p class="step-body">Assign a point value to each performance level. Typically the top level equals the maximum points for the criterion.</p>
    <div class="level-points-list">
      ${levels.map(l => `
        <div class="weight-row">
          <span class="weight-label">${escHtml(l)}</span>
          <div class="weight-input-wrap">
            <input type="number" class="weight-input" min="0" value="${state.step7.levelPoints[l] || ''}"
              placeholder="0" oninput="state.step7.levelPoints['${escHtml(l)}'] = this.value">
            <span class="weight-pct-symbol">pts</span>
          </div>
        </div>`).join('')}
    </div>`;
}

function completeStep7() {
  if (!state.step7.levelScheme) { showToast('Please choose a performance level scheme.', 'warn'); return; }
  if (state.step7.levelScheme === 'custom') {
    const names = state.step7.levelNames.map(n => n.trim()).filter(Boolean);
    if (names.length < 2) { showToast('Please enter at least 2 level names.', 'warn'); return; }
    state.step7.levelNames = names;
  }
  markStepComplete('step7');
  generateDraftDescriptors();
  renderRubricGrid();
  showPage('step8');
  showToast('Step 7 complete!', 'success');
}

/* ════════════════════════════════════════════════════════════
   STEP 8 — DESCRIPTORS
════════════════════════════════════════════════════════════ */

/* ── Text helpers ─────────────────────────────────────────── */

function extractSentences(text) {
  if (!text) return [];
  return text.replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);
}

function criterionKeywords(criterion) {
  const raw = (criterion.name + ' ' + criterion.description).toLowerCase();
  const stop = new Set(['the','and','or','a','an','of','in','to','for','is','are','with','that',
    'this','their','from','by','on','at','as','be','it','its','what','how','when','not','but',
    'they','each','which','does','has','have','been','will','its','own','more','most','rather']);
  return [...new Set(raw.split(/\W+/).filter(w => w.length > 3 && !stop.has(w)))];
}

function scoreRelevance(sentence, keywords) {
  const lower = sentence.toLowerCase();
  return keywords.reduce((n, kw) => n + (lower.includes(kw) ? 1 : 0), 0);
}

function bestSentences(sentences, keywords, count) {
  return sentences
    .map(s => ({ s, score: scoreRelevance(s, keywords) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(x => x.s);
}

/* Strip anecdotal / illustrative content from a sentence before use in a rubric cell.
   Removes quoted examples, "like X" constructions, parenthetical asides, etc.
   Returns null if what remains is too short to be useful. */
function cleanForRubric(sentence) {
  let s = sentence
    // Remove inline quoted examples: "a wellness brand", 'streetwear label', etc.
    .replace(/"[^"]{1,80}"/g, '')
    .replace(/'[^']{1,80}'/g, '')
    // Remove "like X or Y" / "such as X" / "for example X" tails
    .replace(/\s*(?:like|such as|for example|e\.g\.|including)[^.!?;—]*/gi, '')
    // Remove em-dash asides: — something something
    .replace(/\s*—[^—.!?]*(?=$|[.!?])/g, '')
    // Remove parenthetical asides
    .replace(/\([^)]{0,120}\)/g, '')
    // Tidy up
    .replace(/,\s*\./g, '.')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[,—\s]+/, '')
    .trim();

  // If what's left is too short or just a fragment, discard it
  if (s.length < 25) return null;
  return s;
}

/* Convert instructor-voice complaint language to student-facing descriptor language */
function reframeToDescriptor(sentence) {
  const cleaned = cleanForRubric(sentence);
  if (!cleaned) return null;
  return cleaned
    .replace(/\ba students?\b/gi, 'a student')
    .replace(/\bthe students?\b/gi, 'the student')
    .replace(/\bstudents\b/gi, 'Students')
    .replace(/\bwhen a student\b/gi, 'when the student')
    .replace(/\byou can tell\b/gi, 'it is evident')
    .replace(/\byou can see\b/gi, 'evidence shows')
    .replace(/\balmost always\b/gi, 'typically')
    .replace(/\bI see\b/gi, '')
    .replace(/\bI find\b/gi, '')
    .replace(/\bwhen grading\b/gi, '')
    .replace(/\bfrustrates me\b/gi, 'represents a gap')
    .replace(/\bthe thing is\b/gi, '')
    .replace(/\bthe other thing is\b/gi, 'Additionally,')
    .replace(/\bthe other thing\b/gi, 'Additionally,')
    .replace(/,\s*,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[,.\s]+/, '')
    .trim();
}

/* ── Draft generation ────────────────────────────────────── */

function generateDraftDescriptors() {
  const criteria     = state.step5.criteria;
  const levels       = state.step7.levelNames;
  const successText  = state.step3.successVision + ' ' + state.step3.aToBGap;
  const mistakeText  = state.step4.commonMistakes + ' ' + state.step4.gradingFrustrations;

  const successSentences = extractSentences(successText);
  const mistakeSentences = extractSentences(mistakeText);

  criteria.forEach(c => {
    if (!state.step8.descriptors[c.id]) state.step8.descriptors[c.id] = {};
    const kw = criterionKeywords(c);

    levels.forEach((level, idx) => {
      if (state.step8.descriptors[c.id][level]) return; // don't overwrite

      const isTop    = idx === 0;
      const isBottom = idx === levels.length - 1;
      const totalMid = levels.length - 2;
      const midPos   = idx - 1; // 0-indexed within middle levels

      // Position within middle: first = upper, last = lower, between = middle
      const isUpperMid  = !isTop && !isBottom && midPos === 0;
      const isLowerMid  = !isTop && !isBottom && midPos === totalMid - 1 && totalMid > 1;
      const isMiddleMid = !isTop && !isBottom && !isUpperMid && !isLowerMid;

      // Only use a sentence if it scores 2+ keywords — avoids cross-criterion contamination.
      // Also strips anecdotal examples via reframeToDescriptor before returning.
      const RELEVANCE_THRESHOLD = 2;
      function goodHits(sentences, count) {
        return sentences
          .map(s => ({ s, score: scoreRelevance(s, kw) }))
          .filter(x => x.score >= RELEVANCE_THRESHOLD)
          .sort((a, b) => b.score - a.score)
          .map(x => reframeToDescriptor(x.s))
          .filter(s => s !== null && s.length >= 25)
          .slice(0, count);
      }

      let draft = '';

      // Wrap a user-sourced excerpt in sentinels so the grid can flag it for editing.
      // Format: «SOURCE|text» where SOURCE is 'success' or 'mistake'.
      function tag(source, text) { return `«${source}|${text}»`; }

      if (isTop) {
        const hits = goodHits(successSentences, 2);
        if (hits.length >= 2) {
          draft = tag('success', hits[0]) + ' ' + tag('success', hits[1]);
        } else if (hits.length === 1) {
          draft = tag('success', hits[0]) + ` Work at this level reflects full command of ${c.name.toLowerCase()} — every decision is intentional and clearly connected to the assignment goals.`;
        } else {
          draft = `Work at this level reflects full command of ${c.name.toLowerCase()}. ${c.description}. Every decision is intentional, well-executed, and clearly connected to the assignment goals.`;
        }

      } else if (isBottom) {
        const hits = goodHits(mistakeSentences, 2);
        if (hits.length >= 1) {
          draft = `Work at this level does not yet demonstrate ${c.name.toLowerCase()}. ` + hits.map(h => tag('mistake', h)).join(' ');
        } else {
          draft = `Work at this level does not yet demonstrate ${c.name.toLowerCase()}. Key elements are missing, incomplete, or significantly below expectations.`;
        }

      } else if (isUpperMid) {
        const hit = goodHits(successSentences, 1)[0];
        if (hit) {
          draft = `Largely demonstrates ${c.name.toLowerCase()} with only minor gaps. ${tag('success', hit)} The work is strong overall but one or two aspects fall short of the highest level.`;
        } else {
          draft = `Largely demonstrates ${c.name.toLowerCase()} in most areas. Work is competent and meets most expectations, but lacks the consistency or depth of exemplary work.`;
        }

      } else if (isMiddleMid) {
        const successHit = goodHits(successSentences, 1)[0];
        const mistakeHit = goodHits(mistakeSentences, 1)[0];
        if (successHit || mistakeHit) {
          draft = `Meets some expectations for ${c.name.toLowerCase()} but with uneven results. `;
          if (mistakeHit) draft += tag('mistake', mistakeHit) + ' ';
          draft += `Further development is needed to demonstrate ${c.name.toLowerCase()} consistently.`;
        } else {
          draft = `Meets some expectations for ${c.name.toLowerCase()} but with uneven results. Some elements are present, but application is inconsistent. Further development is needed.`;
        }

      } else if (isLowerMid) {
        const hit = goodHits(mistakeSentences, 1)[0];
        if (hit) {
          draft = `Shows emerging ${c.name.toLowerCase()} but with noticeable gaps. ${tag('mistake', hit)} More development is needed to meet expectations consistently.`;
        } else {
          draft = `Shows partial ${c.name.toLowerCase()}. Some required elements are present, but key aspects remain underdeveloped or inconsistent.`;
        }
      }

      // Clean up
      draft = draft.replace(/\.\s*\./g, '.').replace(/\s{2,}/g, ' ').trim();
      if (draft.length > 550) draft = draft.slice(0, 550).replace(/\s+\S*$/, '') + '…';
      state.step8.descriptors[c.id][level] = draft;
    });
  });
}

/* ── Draft excerpt sentinel helpers ─────────────────────────── */

function parseSentinels(text) {
  const matches = [];
  const re = /«(success|mistake)\|([^»]+)»/g;
  let m;
  while ((m = re.exec(text)) !== null) matches.push({ source: m[1], text: m[2] });
  return matches;
}

function stripSentinels(text) {
  return text.replace(/«(?:success|mistake)\|([^»]+)»/g, '$1').replace(/\s{2,}/g, ' ').trim();
}

function hasSentinels(text) { return /«(?:success|mistake)\|/.test(text); }

function draftExcerptCount() {
  let count = 0;
  const criteria = state.step5.criteria;
  const levels   = state.step7.levelNames;
  criteria.forEach(c => {
    levels.forEach(l => {
      const val = (state.step8.descriptors[c.id] || {})[l] || '';
      if (hasSentinels(val)) count++;
    });
  });
  return count;
}

function updateDraftCounter() {
  const el = document.getElementById('draftExcerptCount');
  if (!el) return;
  const n = draftExcerptCount();
  if (n === 0) {
    el.textContent = '';
    el.classList.remove('has-drafts');
  } else {
    el.textContent = `${n} cell${n === 1 ? '' : 's'} need your voice`;
    el.classList.add('has-drafts');
  }
}

/* ── Rubric grid renderer ────────────────────────────────────── */

function renderRubricGrid() {
  const grid = document.getElementById('rubricGrid');
  if (!grid) return;

  const criteria = state.step5.criteria;
  const levels   = state.step7.levelNames;
  if (!criteria.length || !levels.length) return;

  criteria.forEach(c => {
    if (!state.step8.descriptors[c.id]) state.step8.descriptors[c.id] = {};
    levels.forEach(l => { if (!state.step8.descriptors[c.id][l]) state.step8.descriptors[c.id][l] = ''; });
  });

  const method = state.step6.method;
  const showPts = method === 'points' || method === 'weighted_points';

  let html = '<thead><tr><th>Criterion</th>';
  levels.forEach(l => {
    const pts = showPts && state.step7.levelPoints[l] ? ` (${state.step7.levelPoints[l]}pts)` : '';
    html += `<th>${escHtml(l)}${pts}</th>`;
  });
  html += '</tr></thead><tbody>';

  criteria.forEach(c => {
    const wt = (method === 'weighted' || method === 'weighted_points') && state.step6.weights[c.id]
      ? `<div class="criterion-weight-badge">${state.step6.weights[c.id]}%</div>` : '';
    html += `<tr><td class="criterion-cell"><strong>${escHtml(c.name)}</strong>${wt}${c.description ? `<div class="criterion-cell-desc">${escHtml(c.description)}</div>` : ''}</td>`;
    levels.forEach(l => {
      const raw = state.step8.descriptors[c.id][l] || '';
      const excerpts = parseSentinels(raw);
      const displayVal = stripSentinels(raw);
      let banner = '';
      if (excerpts.length > 0) {
        const sourceLabel = excerpts[0].source === 'success'
          ? 'from your "What does success look like?" notes'
          : 'from your "What goes wrong?" notes';
        const chips = excerpts.map(e =>
          `<span class="excerpt-chip">${escHtml(e.text)}</span>`
        ).join('');
        banner = `<div class="draft-excerpt-banner">
          <span class="draft-excerpt-icon">✎</span>
          <div class="draft-excerpt-body">
            <strong>Your words</strong> ${escHtml(sourceLabel)} — rewrite in student voice:
            <div class="excerpt-chips">${chips}</div>
          </div>
        </div>`;
      }
      html += `<td class="${excerpts.length ? 'has-draft-excerpt' : ''}">
        ${banner}<textarea class="descriptor-input" rows="5"
        placeholder="Describe what '${escHtml(l)}' looks like for this criterion…"
        oninput="updateDescriptor('${c.id}','${escHtml(l)}',this.value)"
        >${escHtml(displayVal)}</textarea></td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';
  grid.innerHTML = html;
  updateDraftCounter();
}

function updateDescriptor(criterionId, level, value) {
  if (!state.step8.descriptors[criterionId]) state.step8.descriptors[criterionId] = {};
  // Editing a cell clears its sentinels — the faculty has taken over authorship.
  state.step8.descriptors[criterionId][level] = value;
  // Remove highlight from this cell immediately on first edit.
  const cell = event && event.target && event.target.closest('td');
  if (cell) {
    cell.classList.remove('has-draft-excerpt');
    const banner = cell.querySelector('.draft-excerpt-banner');
    if (banner) banner.remove();
  }
  updateDraftCounter();
}

function completeStep8() {
  const criteria = state.step5.criteria;
  const levels   = state.step7.levelNames;
  if (!levels.length) return;

  const topLevel = levels[0];
  const botLevel = levels[levels.length - 1];
  let missing = false;
  criteria.forEach(c => {
    const desc = state.step8.descriptors[c.id] || {};
    if (!desc[topLevel] || !desc[botLevel]) missing = true;
  });
  if (missing) {
    showToast(`Please fill in at least the "${topLevel}" and "${botLevel}" descriptors for every criterion.`, 'warn');
    return;
  }

  markStepComplete('step8');
  renderRubricPreview();
  showPage('step9');
  showToast('Step 8 complete! Your rubric is ready.', 'success');
}

/* ════════════════════════════════════════════════════════════
   STEP 9 — PREVIEW & EXPORT
════════════════════════════════════════════════════════════ */

function renderRubricPreview() {
  const preview = document.getElementById('rubricPreview');
  if (!preview) return;

  const criteria = state.step5.criteria;
  const levels   = state.step7.levelNames;
  if (!criteria.length || !levels.length) {
    preview.innerHTML = '<tr><td>Complete Steps 5–8 to see your rubric preview.</td></tr>';
    return;
  }

  const method   = state.step6.method;
  const showWt   = method === 'weighted' || method === 'weighted_points';
  const showPts  = method === 'points'   || method === 'weighted_points';

  const printMeta = document.getElementById('printMeta');
  if (printMeta) printMeta.textContent = `Rubric: ${state.step1.assignmentName || 'Untitled Assignment'}`;

  let html = '<thead><tr>';
  html += '<th class="criterion-col">Criterion</th>';
  if (showWt) html += '<th class="weight-col">Weight</th>';
  levels.forEach(l => {
    const pts = showPts && state.step7.levelPoints[l] ? ` (${state.step7.levelPoints[l]}pts)` : '';
    html += `<th>${escHtml(l)}${pts}</th>`;
  });
  html += '</tr></thead><tbody>';

  criteria.forEach(c => {
    html += `<tr><td class="criterion-col"><strong>${escHtml(c.name)}</strong>${c.description ? `<div class="preview-criterion-desc">${escHtml(c.description)}</div>` : ''}</td>`;
    if (showWt) html += `<td class="weight-col">${state.step6.weights[c.id] ? state.step6.weights[c.id] + '%' : '—'}</td>`;
    levels.forEach(l => {
      const raw  = (state.step8.descriptors[c.id] || {})[l] || '—';
      const text = stripSentinels(raw);
      html += `<td>${escHtml(text).replace(/\n/g, '<br>')}</td>`;
    });
    html += '</tr>';
  });

  // Draft warning banner above preview table
  const draftCount = draftExcerptCount();
  const previewWarn = document.getElementById('previewDraftWarn');
  if (previewWarn) {
    if (draftCount > 0) {
      previewWarn.textContent = `${draftCount} cell${draftCount === 1 ? '' : 's'} still contain your unedited notes — go back to Step 8 to rewrite them in student voice before exporting.`;
      previewWarn.style.display = 'block';
    } else {
      previewWarn.style.display = 'none';
    }
  }

  if (showPts && showWt) {
    const maxScore = criteria.reduce((sum, c) => {
      const topPts = parseFloat(state.step7.levelPoints[levels[0]]) || 0;
      const wt     = (parseFloat(state.step6.weights[c.id]) || 0) / 100;
      return sum + (topPts * wt);
    }, 0);
    if (maxScore > 0) {
      html += `<tr class="total-row"><td colspan="${2 + levels.length}"><strong>Maximum Score: ${maxScore} points</strong></td></tr>`;
    }
  }

  html += '</tbody>';
  preview.innerHTML = html;
}

function copyRubricHTML() {
  const preview = document.getElementById('rubricPreview');
  if (!preview) return;
  const html = `<table border="1" cellpadding="6" cellspacing="0">${preview.innerHTML}</table>`;
  if (navigator.clipboard && navigator.clipboard.write) {
    navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type:'text/html' }) })])
      .then(() => showToast('Rubric HTML copied!', 'success'))
      .catch(() => fallbackCopy(preview.innerText));
  } else { fallbackCopy(preview.innerText); }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('Rubric text copied!', 'success');
}

function printRubric() { window.print(); }

/* ── HELPERS ────────────────────────────────────────────────── */
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── INIT ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  populateSchoolSelect();
  renderTypeGrid();
  populateClosestMatch();
  renderLevelSchemes();
  renderScoringMethodGrid();
  updateNav();
  updateProgress();
  showPage('welcome');
});
