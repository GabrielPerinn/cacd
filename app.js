import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_KEY = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ""
).trim();
const HAS_CLOUD_CONFIG = Boolean(SUPABASE_URL && SUPABASE_KEY);
const PREVIEW_MODE = new URLSearchParams(window.location.search).has("preview");
const supabase = HAS_CLOUD_CONFIG ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const today = new Date();
const todayKey = dateToKey(today);
const currentYear = today.getFullYear();

const starterState = {
  goals: [
    {
      id: "cacd-foundation",
      title: "Construir base do CACD",
      category: "CACD",
      horizon: "Longo prazo",
      strategy: "total",
      unit: "blocos estudados",
      current: 0,
      baseline: 0,
      target: 10,
      deadline: `${currentYear + 2}-12-15`,
      color: "#a78bfa",
      summary: "Preparação gradual, alinhada à graduação em Relações Internacionais.",
      milestones: [
        { title: "Mapear áreas e bibliografia-base", done: false },
        { title: "Ciclo de História e Política Internacional", done: false },
        { title: "Primeira bateria de questões", done: false }
      ],
      entries: []
    },
    {
      id: "ri-second-semester",
      title: "Consolidar o 2º semestre de R.I.",
      category: "Graduacao",
      horizon: "Medio prazo",
      strategy: "total",
      unit: "disciplinas em dia",
      current: 0,
      baseline: 0,
      target: 5,
      deadline: `${currentYear}-07-10`,
      color: "#c4b5fd",
      summary: "A base universitária bem construída dá profundidade à futura preparação.",
      milestones: [
        { title: "Cronograma acadêmico organizado", done: false },
        { title: "Fichar as leituras obrigatórias", done: false },
        { title: "Fechar o semestre com revisão final", done: false }
      ],
      entries: []
    },
    {
      id: "diplomatic-languages",
      title: "Idiomas para a carreira diplomática",
      category: "Idiomas",
      horizon: "Longo prazo",
      strategy: "total",
      unit: "sessões",
      current: 0,
      baseline: 0,
      target: 120,
      deadline: `${currentYear + 1}-12-15`,
      color: "#8b5cf6",
      summary: "Leitura, escrita e conversação voltadas a temas internacionais.",
      milestones: [
        { title: "Rotina semanal estabelecida", done: false },
        { title: "Redigir análise curta em idioma estrangeiro", done: false },
        { title: "Apresentação oral sobre conjuntura", done: false }
      ],
      entries: []
    },
    {
      id: "global-repertoire",
      title: "Fichamentos de política internacional",
      category: "Repertorio",
      horizon: "Medio prazo",
      strategy: "total",
      unit: "fichamentos",
      current: 0,
      baseline: 0,
      target: 24,
      deadline: `${currentYear}-12-12`,
      color: "#b68cff",
      summary: "Repertório organizado para compreender cenários, autores e posições brasileiras.",
      milestones: [
        { title: "Primeiros seis fichamentos", done: false },
        { title: "Revisar organizações internacionais", done: false },
        { title: "Completar dossiê anual", done: false }
      ],
      entries: []
    },
    {
      id: "personal-expression",
      title: "Escrita e oratória de alto nível",
      category: "Desenvolvimento",
      horizon: "Longo prazo",
      strategy: "total",
      unit: "práticas",
      current: 0,
      baseline: 0,
      target: 32,
      deadline: `${currentYear + 1}-06-30`,
      color: "#9275d8",
      summary: "Comunicação clara, repertório pessoal e segurança para expor ideias.",
      milestones: [
        { title: "Primeira redação revisada", done: false },
        { title: "Gravar exposição de cinco minutos", done: false },
        { title: "Participar de debate acadêmico", done: false }
      ],
      entries: []
    }
  ],
  routines: [
    { id: "routine-current-affairs", title: "Atualidades internacionais", frequency: "semana", target: 5, dates: [] },
    { id: "routine-language", title: "Revisão de idioma estrangeiro", frequency: "semana", target: 4, dates: [] },
    { id: "routine-writing", title: "Escrita analítica", frequency: "semana", target: 3, dates: [] },
    { id: "routine-wellbeing", title: "Treino físico e energia", frequency: "semana", target: 4, dates: [] }
  ]
};

let state = cloneStarterState();
let session = null;
let selectedGoalId = null;
let selectedCategory = "Todas";
let selectedHorizon = "Todos";
let searchTerm = "";
let authMode = "login";
let isSaving = false;
let sessionLoadPromise = null;
let toastTimer;
let displayedOverall = 0;

const elements = {
  authScreen: document.querySelector("#authScreen"),
  appShell: document.querySelector("#appShell"),
  authTabs: document.querySelector("#authTabs"),
  authForm: document.querySelector("#authForm"),
  authEyebrow: document.querySelector("#authEyebrow"),
  authTitle: document.querySelector("#authTitle"),
  authSubmit: document.querySelector("#authSubmit"),
  authFeedback: document.querySelector("#authFeedback"),
  resetPasswordButton: document.querySelector("#resetPasswordButton"),
  authEmailField: document.querySelector("#authEmailField"),
  passwordFieldLabel: document.querySelector("#passwordFieldLabel"),
  setupAlert: document.querySelector("#setupAlert"),
  cycleYear: document.querySelector("#cycleYear"),
  todayLabel: document.querySelector("#todayLabel"),
  shortDate: document.querySelector("#shortDate"),
  overallRing: document.querySelector("#overallRing"),
  overallProgress: document.querySelector("#overallProgress"),
  spotlightTitle: document.querySelector("#spotlightTitle"),
  spotlightBar: document.querySelector("#spotlightBar"),
  spotlightCaption: document.querySelector("#spotlightCaption"),
  activeGoals: document.querySelector("#activeGoals"),
  completedLabel: document.querySelector("#completedLabel"),
  nextReview: document.querySelector("#nextReview"),
  nextReviewTitle: document.querySelector("#nextReviewTitle"),
  routineDone: document.querySelector("#routineDone"),
  routineStatus: document.querySelector("#routineStatus"),
  totalUpdates: document.querySelector("#totalUpdates"),
  categoryNav: document.querySelector("#categoryNav"),
  horizonTabs: document.querySelector("#horizonTabs"),
  goalSearch: document.querySelector("#goalSearch"),
  goalList: document.querySelector("#goalList"),
  routineList: document.querySelector("#routineList"),
  deadlineList: document.querySelector("#deadlineList"),
  drawerBackdrop: document.querySelector("#drawerBackdrop"),
  detailDrawer: document.querySelector("#detailDrawer"),
  goalDetails: document.querySelector("#goalDetails"),
  closeDrawer: document.querySelector("#closeDrawer"),
  goalButton: document.querySelector("#goalButton"),
  routineButton: document.querySelector("#routineButton"),
  restoreButton: document.querySelector("#restoreButton"),
  goalModal: document.querySelector("#goalModal"),
  routineModal: document.querySelector("#routineModal"),
  restoreModal: document.querySelector("#restoreModal"),
  confirmRestore: document.querySelector("#confirmRestore"),
  newGoalForm: document.querySelector("#newGoalForm"),
  newRoutineForm: document.querySelector("#newRoutineForm"),
  syncPill: document.querySelector("#syncPill"),
  syncLabel: document.querySelector("#syncLabel"),
  accountButton: document.querySelector("#accountButton"),
  userInitial: document.querySelector("#userInitial"),
  userEmail: document.querySelector("#userEmail"),
  toast: document.querySelector("#toast")
};

function cloneStarterState() {
  return structuredClone(starterState);
}

function validState(value) {
  return value && Array.isArray(value.goals) && Array.isArray(value.routines);
}

function dateToKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(key) {
  return new Date(`${key}T12:00:00`);
}

function formatDate(key, options = { day: "2-digit", month: "short" }) {
  return new Intl.DateTimeFormat("pt-BR", options).format(parseDate(key));
}

function number(value) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function progressFor(goal) {
  if (goal.strategy === "target") {
    const fullDistance = goal.target - goal.baseline;
    const distanceCovered = goal.current - goal.baseline;
    if (fullDistance === 0) return 100;
    return Math.max(0, Math.min(100, Math.round((distanceCovered / fullDistance) * 100)));
  }
  if (goal.target === 0) return goal.current > 0 ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round((goal.current / goal.target) * 100)));
}

function valueLabel(goal) {
  if (goal.strategy === "target") {
    return `${number(goal.current)} ${goal.unit} / alvo ${number(goal.target)} ${goal.unit}`;
  }
  return `${number(goal.current)} de ${number(goal.target)} ${goal.unit}`;
}

function iconFor(category) {
  return { CACD: "C", Graduacao: "RI", Idiomas: "I", Repertorio: "R", Desenvolvimento: "D" }[category] || "*";
}

function categoryLabel(category) {
  return { Graduacao: "Graduação", Repertorio: "Repertório" }[category] || category;
}

function horizonLabel(horizon) {
  return horizon === "Medio prazo" ? "Médio prazo" : horizon;
}

function daysUntil(key) {
  return Math.ceil((parseDate(key).getTime() - parseDate(todayKey).getTime()) / 86400000);
}

function setSyncStatus(status, label) {
  elements.syncPill.dataset.state = status;
  elements.syncLabel.textContent = label;
}

function showToast(message, tone = "default") {
  clearTimeout(toastTimer);
  elements.toast.dataset.tone = tone;
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 3000);
}

function animateCounter(element, from, to, suffix = "") {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || from === to) {
    element.textContent = `${to}${suffix}`;
    return;
  }
  const duration = 700;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - progress) ** 3;
    element.textContent = `${Math.round(from + (to - from) * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function animateProgressTracks() {
  requestAnimationFrame(() => {
    document.querySelectorAll("[data-fill]").forEach((track) => {
      track.style.width = `${track.dataset.fill}%`;
    });
  });
}

function renderDateLabels() {
  elements.cycleYear.textContent = currentYear;
  elements.todayLabel.textContent = `${new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  }).format(today).toUpperCase()} · R.I. / CACD`;
  elements.shortDate.textContent = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(today);
}

function renderCategoryCounts() {
  ["Todas", "CACD", "Graduacao", "Idiomas", "Repertorio", "Desenvolvimento"].forEach((category) => {
    const count = category === "Todas" ? state.goals.length : state.goals.filter((goal) => goal.category === category).length;
    const target = document.querySelector(`#count${category}`);
    if (target) target.textContent = count;
  });
}

function renderOverview(animate = true) {
  const percentages = state.goals.map(progressFor);
  const overall = percentages.length ? Math.round(percentages.reduce((sum, item) => sum + item, 0) / percentages.length) : 0;
  const completed = percentages.filter((item) => item === 100).length;
  const spotlight = [...state.goals].sort((a, b) => progressFor(b) - progressFor(a))[0];
  const next = [...state.goals]
    .filter((goal) => daysUntil(goal.deadline) >= 0)
    .sort((a, b) => parseDate(a.deadline) - parseDate(b.deadline))[0];
  const checkedToday = state.routines.filter((routine) => routine.dates.includes(todayKey)).length;

  const fromOverall = animate ? displayedOverall : overall;
  elements.overallRing.style.setProperty("--progress", `${fromOverall * 3.6}deg`);
  requestAnimationFrame(() => elements.overallRing.style.setProperty("--progress", `${overall * 3.6}deg`));
  animateCounter(elements.overallProgress, fromOverall, overall, "%");
  displayedOverall = overall;
  elements.activeGoals.textContent = state.goals.length;
  elements.completedLabel.textContent = `${completed} concluída${completed === 1 ? "" : "s"}`;
  elements.routineDone.textContent = `${checkedToday}/${state.routines.length}`;
  elements.routineStatus.textContent = checkedToday === state.routines.length && state.routines.length ? "Dia completo" : "check-ins de hoje";
  elements.totalUpdates.textContent = state.goals.reduce((total, goal) => total + goal.entries.length, 0);

  if (spotlight) {
    const spotlightProgress = progressFor(spotlight);
    elements.spotlightTitle.textContent = spotlight.title;
    elements.spotlightBar.style.width = "0%";
    elements.spotlightBar.dataset.fill = spotlightProgress;
    elements.spotlightCaption.textContent = `${spotlightProgress}% concluído - ${valueLabel(spotlight)}`;
  } else {
    elements.spotlightTitle.textContent = "-";
    elements.spotlightBar.style.width = "0%";
    elements.spotlightCaption.textContent = "Crie seu primeiro objetivo.";
  }

  elements.nextReview.textContent = next ? formatDate(next.deadline) : "--";
  elements.nextReviewTitle.textContent = next ? next.title : "sem prazo";
}

function filteredGoals() {
  return state.goals.filter((goal) => {
    const categoryMatches = selectedCategory === "Todas" || goal.category === selectedCategory;
    const horizonMatches = selectedHorizon === "Todos" || goal.horizon === selectedHorizon;
    const searchMatches = goal.title.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatches && horizonMatches && searchMatches;
  });
}

function renderGoals() {
  const goals = filteredGoals();
  if (!goals.length) {
    elements.goalList.innerHTML = '<div class="empty-state">Nenhum objetivo encontrado para este filtro.</div>';
    return;
  }
  elements.goalList.innerHTML = goals
    .map((goal) => {
      const progress = progressFor(goal);
      return `
        <article class="goal-card" style="--goal-color: ${goal.color}">
          <div class="goal-ident">
            <span class="goal-symbol">${escapeHtml(iconFor(goal.category))}</span>
            <div>
              <h3>${escapeHtml(goal.title)}</h3>
              <p>${escapeHtml(horizonLabel(goal.horizon))} - até ${escapeHtml(formatDate(goal.deadline, {
                day: "2-digit", month: "short", year: "numeric"
              }))}</p>
            </div>
          </div>
          <div class="goal-track">
            <div class="progress-label"><span>${escapeHtml(valueLabel(goal))}</span></div>
            <div class="track"><span data-fill="${progress}" style="width: 0%"></span></div>
          </div>
          <div class="goal-percent">
            <strong>${progress}%</strong>
            <button class="open-goal" data-open-goal="${goal.id}" type="button">Atualizar</button>
          </div>
        </article>`;
    })
    .join("");
}

function datesInPeriod(routine) {
  const start = new Date(today);
  if (routine.frequency === "mes") {
    return routine.dates.filter((key) => {
      const date = parseDate(key);
      return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    });
  }
  const weekDay = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - weekDay);
  start.setHours(0, 0, 0, 0);
  return routine.dates.filter((key) => parseDate(key) >= start && parseDate(key) <= today);
}

function renderRoutines() {
  if (!state.routines.length) {
    elements.routineList.innerHTML = '<div class="empty-state">Crie uma rotina para acompanhar seus dias.</div>';
    return;
  }
  elements.routineList.innerHTML = state.routines
    .map((routine) => {
      const checked = routine.dates.includes(todayKey);
      const count = datesInPeriod(routine).length;
      return `
        <article class="routine-item ${checked ? "has-checkin" : ""}">
          <button class="routine-toggle ${checked ? "is-done" : ""}" data-toggle-routine="${routine.id}" type="button"
            aria-label="${checked ? "Remover check-in" : "Registrar check-in"}: ${escapeHtml(routine.title)}"></button>
          <div class="routine-info">
            <strong>${escapeHtml(routine.title)}</strong>
            <span>${count} de ${routine.target} ${routine.frequency === "mes" ? "neste mês" : "nesta semana"}</span>
          </div>
          <span class="routine-streak">${checked ? "feito" : `${count}/${routine.target}`}</span>
        </article>`;
    })
    .join("");
}

function renderDeadlines() {
  const goals = [...state.goals].sort((a, b) => parseDate(a.deadline) - parseDate(b.deadline)).slice(0, 4);
  elements.deadlineList.innerHTML = goals.length
    ? goals
        .map((goal) => {
          const date = parseDate(goal.deadline);
          const remaining = daysUntil(goal.deadline);
          const label = remaining < 0 ? "encerrado" : remaining === 0 ? "hoje" : `${remaining} dias restantes`;
          return `
            <article class="deadline-item">
              <div class="deadline-date">${String(date.getDate()).padStart(2, "0")}
                <small>${date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase()}</small>
              </div>
              <div><strong>${escapeHtml(goal.title)}</strong><p>${escapeHtml(label)} - ${progressFor(goal)}% concluído</p></div>
            </article>`;
        })
        .join("")
    : '<div class="empty-state">Seus prazos aparecerão aqui.</div>';
}

function renderDrawer() {
  const goal = state.goals.find((item) => item.id === selectedGoalId);
  if (!goal) return;
  const progress = progressFor(goal);
  const history = goal.entries
    .map((entry, index) => ({ ...entry, index }))
    .sort((a, b) => parseDate(b.date) - parseDate(a.date) || b.index - a.index);
  elements.goalDetails.innerHTML = `
    <header class="drawer-header" style="--goal-color: ${goal.color}">
      <span class="tag">${escapeHtml(categoryLabel(goal.category))} / ${escapeHtml(horizonLabel(goal.horizon))}</span>
      <h2>${escapeHtml(goal.title)}</h2>
      <p>${escapeHtml(goal.summary || "Registre cada passo relevante deste objetivo.")}</p>
    </header>
    <section class="drawer-meter">
      <div class="drawer-meter-head"><p>${escapeHtml(valueLabel(goal))}</p><strong>${progress}%</strong></div>
      <div class="track" style="--goal-color: ${goal.color}"><span data-fill="${progress}" style="width: 0%"></span></div>
    </section>
    <section class="detail-block">
      <h3>Registrar evolução</h3>
      <form class="update-form" id="updateGoalForm">
        <label>Valor atual<input name="value" type="number" step="0.1" required value="${goal.current}" /></label>
        <label>Data<input name="date" type="date" required value="${todayKey}" /></label>
        <label>Nota do registro<input name="note" required placeholder="O que avançou nesta etapa?" /></label>
        <button class="primary-button" type="submit">Salvar atualização</button>
      </form>
    </section>
    <section class="detail-block">
      <h3>Marcos intermediários</h3>
      <div class="milestone-list">
        ${goal.milestones.map((milestone, index) => `
          <button type="button" class="milestone ${milestone.done ? "is-done" : ""}" data-toggle-milestone="${index}">
            <span></span>${escapeHtml(milestone.title)}
          </button>`).join("")}
      </div>
    </section>
    <section class="detail-block">
      <h3>Histórico</h3>
      <div class="history-list">
        ${history.length ? history.map((entry) => `
          <article class="history-item">
            <span class="history-dot"></span>
            <div>
              <strong>${escapeHtml(formatDate(entry.date, { day: "2-digit", month: "long", year: "numeric" }))} -
                <span>${escapeHtml(number(entry.value))} ${escapeHtml(goal.unit)}</span></strong>
              <p>${escapeHtml(entry.note)}</p>
            </div>
          </article>`).join("") : '<p class="empty-state">Comece registrando sua primeira evolução.</p>'}
      </div>
    </section>`;
}

function renderAll(animate = true) {
  renderDateLabels();
  renderCategoryCounts();
  renderOverview(animate);
  renderGoals();
  renderRoutines();
  renderDeadlines();
  if (selectedGoalId) renderDrawer();
  animateProgressTracks();
}

function openDrawer(id) {
  selectedGoalId = id;
  renderDrawer();
  animateProgressTracks();
  elements.detailDrawer.classList.add("is-visible");
  elements.drawerBackdrop.classList.add("is-visible");
  elements.detailDrawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  elements.detailDrawer.classList.remove("is-visible");
  elements.drawerBackdrop.classList.remove("is-visible");
  elements.detailDrawer.setAttribute("aria-hidden", "true");
  selectedGoalId = null;
}

function resetFilters() {
  selectedCategory = "Todas";
  selectedHorizon = "Todos";
  searchTerm = "";
  elements.goalSearch.value = "";
  elements.categoryNav.querySelectorAll("[data-category]").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.category === selectedCategory);
  });
  elements.horizonTabs.querySelectorAll("[data-horizon]").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.horizon === selectedHorizon);
  });
}

async function saveRemoteState() {
  if (PREVIEW_MODE) {
    setSyncStatus("preview", "Prévia");
    return;
  }
  if (!supabase || !session?.user) throw new Error("Sessão indisponível.");
  const { error } = await supabase
    .from("user_plans")
    .upsert({ user_id: session.user.id, state }, { onConflict: "user_id" });
  if (error) throw error;
  setSyncStatus("saved", "Salvo na nuvem");
}

async function mutateState(mutation, successMessage) {
  if (isSaving) return;
  const previous = structuredClone(state);
  mutation();
  renderAll();
  isSaving = true;
  setSyncStatus("saving", "Salvando");
  try {
    await saveRemoteState();
    showToast(PREVIEW_MODE ? "Alteração apenas na pré-visualização." : successMessage);
  } catch (error) {
    state = previous;
    renderAll();
    setSyncStatus("error", "Não salvo");
    showToast("Não foi possível salvar. Verifique sua conexão.", "error");
    console.error(error);
  } finally {
    isSaving = false;
  }
}

async function loadRemotePlan() {
  setSyncStatus("saving", "Carregando");
  const { data, error } = await supabase
    .from("user_plans")
    .select("state")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) throw error;
  state = validState(data?.state) ? data.state : cloneStarterState();
  if (!data) await saveRemoteState();
  setSyncStatus("saved", "Salvo na nuvem");
}

function setAccountHeader() {
  const email = session?.user?.email || "pré-visualização";
  elements.userInitial.textContent = email.charAt(0).toUpperCase();
  elements.userEmail.textContent = email;
}

function showApp() {
  elements.authScreen.classList.add("is-hidden");
  elements.appShell.classList.remove("is-hidden");
  document.body.classList.add("has-session");
  setAccountHeader();
  renderAll(false);
}

function showAuth() {
  elements.appShell.classList.add("is-hidden");
  elements.authScreen.classList.remove("is-hidden");
  document.body.classList.remove("has-session");
  closeDrawer();
}

function setAuthFeedback(message, error = false) {
  elements.authFeedback.textContent = message;
  elements.authFeedback.classList.toggle("is-error", error);
}

function setAuthMode(mode) {
  authMode = mode;
  const registering = mode === "register";
  const recovering = mode === "recovery";
  elements.authTabs.classList.toggle("is-hidden", recovering);
  elements.authTabs.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.authMode === mode);
  });
  elements.authEyebrow.textContent = recovering ? "RECUPERAÇÃO SEGURA" : registering ? "COMECE EM ZERO" : "BEM-VINDO DE VOLTA";
  elements.authTitle.textContent = recovering ? "Defina nova senha" : registering ? "Criar sua conta" : "Acessar sua jornada";
  elements.authSubmit.textContent = recovering ? "Salvar nova senha" : registering ? "Criar conta segura" : "Entrar";
  elements.authEmailField.classList.toggle("is-hidden", recovering);
  elements.authForm.elements.email.required = !recovering;
  elements.passwordFieldLabel.textContent = recovering ? "Nova senha" : "Senha";
  elements.resetPasswordButton.classList.toggle("is-hidden", registering || recovering);
  elements.authForm.elements.password.autocomplete = registering || recovering ? "new-password" : "current-password";
  setAuthFeedback("");
}

async function enterSession(nextSession) {
  if (sessionLoadPromise) return sessionLoadPromise;
  sessionLoadPromise = (async () => {
    session = nextSession;
    try {
      await loadRemotePlan();
      resetFilters();
      showApp();
    } catch (error) {
      showAuth();
      setAuthFeedback("Não foi possível carregar seus dados. Confira a configuração do banco.", true);
      console.error(error);
    } finally {
      sessionLoadPromise = null;
    }
  })();
  return sessionLoadPromise;
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  if (!supabase) {
    setAuthFeedback("A sincronização ainda não foi configurada neste ambiente.", true);
    return;
  }
  const email = elements.authForm.elements.email.value.trim();
  const password = elements.authForm.elements.password.value;
  elements.authSubmit.disabled = true;
  setAuthFeedback("Processando...");
  try {
    if (authMode === "recovery") {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setAuthFeedback("Senha atualizada. Abrindo sua jornada...");
      const { data } = await supabase.auth.getSession();
      if (data.session) await enterSession(data.session);
    } else if (authMode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}` }
      });
      if (error) throw error;
      if (data.session) {
        await enterSession(data.session);
      } else {
        setAuthFeedback("Conta criada. Confirme o link enviado ao seu e-mail para entrar.");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await enterSession(data.session);
    }
  } catch (error) {
    setAuthFeedback(error.message || "Não foi possível autenticar.", true);
  } finally {
    elements.authSubmit.disabled = false;
  }
}

async function sendPasswordReset() {
  if (!supabase) return setAuthFeedback("Configure a sincronização para recuperar sua senha.", true);
  const email = elements.authForm.elements.email.value.trim();
  if (!email) return setAuthFeedback("Informe seu e-mail antes de recuperar a senha.", true);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${window.location.pathname}`
  });
  setAuthFeedback(error ? error.message : "Enviamos o link de recuperação para seu e-mail.", Boolean(error));
}

function addGoal(form) {
  const data = new FormData(form);
  const title = data.get("title").trim();
  const current = Number(data.get("current"));
  const milestones = data.get("milestones").split(",").map((item) => item.trim()).filter(Boolean).map((titleValue) => ({
    title: titleValue,
    done: false
  }));
  return mutateState(() => {
    state.goals.unshift({
      id: `goal-${crypto.randomUUID()}`,
      title,
      category: data.get("category"),
      horizon: data.get("horizon"),
      strategy: data.get("strategy"),
      unit: data.get("unit").trim(),
      current,
      baseline: data.get("strategy") === "target" ? current : 0,
      target: Number(data.get("target")),
      deadline: data.get("deadline"),
      color: data.get("color"),
      summary: "Objetivo pessoal pronto para registrar avanços.",
      milestones: milestones.length ? milestones : [{ title: "Primeiro registro de progresso", done: false }],
      entries: current ? [{ date: todayKey, value: current, note: "Valor inicial informado." }] : []
    });
    elements.goalModal.close();
    form.reset();
  }, `Objetivo criado: ${title}`);
}

function addRoutine(form) {
  const data = new FormData(form);
  const title = data.get("title").trim();
  return mutateState(() => {
    state.routines.unshift({
      id: `routine-${crypto.randomUUID()}`,
      title,
      frequency: data.get("frequency"),
      target: Number(data.get("target")),
      dates: []
    });
    elements.routineModal.close();
    form.reset();
  }, `Rotina criada: ${title}`);
}

function updateGoal(form) {
  const data = new FormData(form);
  return mutateState(() => {
    const goal = state.goals.find((item) => item.id === selectedGoalId);
    goal.current = Number(data.get("value"));
    goal.entries.push({ value: goal.current, date: data.get("date"), note: data.get("note").trim() });
  }, "Evolução salva na sua conta.");
}

function toggleMilestone(index) {
  return mutateState(() => {
    const goal = state.goals.find((item) => item.id === selectedGoalId);
    goal.milestones[index].done = !goal.milestones[index].done;
  }, "Marco atualizado.");
}

function toggleRoutine(id) {
  return mutateState(() => {
    const routine = state.routines.find((item) => item.id === id);
    const index = routine.dates.indexOf(todayKey);
    if (index >= 0) routine.dates.splice(index, 1);
    else routine.dates.push(todayKey);
  }, "Check-in salvo.");
}

elements.authTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-auth-mode]");
  if (button) setAuthMode(button.dataset.authMode);
});
elements.authForm.addEventListener("submit", handleAuthSubmit);
elements.resetPasswordButton.addEventListener("click", sendPasswordReset);
elements.categoryNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  selectedCategory = button.dataset.category;
  elements.categoryNav.querySelectorAll("[data-category]").forEach((item) => item.classList.toggle("is-active", item === button));
  renderGoals();
  animateProgressTracks();
});
elements.horizonTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-horizon]");
  if (!button) return;
  selectedHorizon = button.dataset.horizon;
  elements.horizonTabs.querySelectorAll("[data-horizon]").forEach((item) => item.classList.toggle("is-active", item === button));
  renderGoals();
  animateProgressTracks();
});
elements.goalSearch.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim();
  renderGoals();
  animateProgressTracks();
});
elements.goalList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-goal]");
  if (button) openDrawer(button.dataset.openGoal);
});
elements.routineList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-toggle-routine]");
  if (button) void toggleRoutine(button.dataset.toggleRoutine);
});
elements.goalDetails.addEventListener("submit", (event) => {
  if (event.target.id === "updateGoalForm") {
    event.preventDefault();
    void updateGoal(event.target);
  }
});
elements.goalDetails.addEventListener("click", (event) => {
  const button = event.target.closest("[data-toggle-milestone]");
  if (button) void toggleMilestone(Number(button.dataset.toggleMilestone));
});
elements.goalButton.addEventListener("click", () => {
  elements.newGoalForm.elements.deadline.value = `${currentYear}-12-31`;
  elements.goalModal.showModal();
});
elements.routineButton.addEventListener("click", () => elements.routineModal.showModal());
elements.newGoalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  void addGoal(event.target);
});
elements.newRoutineForm.addEventListener("submit", (event) => {
  event.preventDefault();
  void addRoutine(event.target);
});
document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => document.querySelector(`#${button.dataset.closeModal}`).close());
});
elements.closeDrawer.addEventListener("click", closeDrawer);
elements.drawerBackdrop.addEventListener("click", closeDrawer);
elements.restoreButton.addEventListener("click", () => elements.restoreModal.showModal());
elements.confirmRestore.addEventListener("click", () => {
  void mutateState(() => {
    state = cloneStarterState();
    resetFilters();
    closeDrawer();
    elements.restoreModal.close();
  }, "Seu progresso foi zerado.");
});
elements.accountButton.addEventListener("click", async () => {
  if (PREVIEW_MODE) return window.location.assign(window.location.pathname);
  await supabase.auth.signOut();
  session = null;
  state = cloneStarterState();
  showAuth();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
});
window.addEventListener("offline", () => setSyncStatus("error", "Sem conexão"));

async function initialize() {
  setAuthMode("login");
  if (PREVIEW_MODE) {
    setSyncStatus("preview", "Prévia");
    showApp();
    return;
  }
  if (!supabase) {
    elements.setupAlert.classList.remove("is-hidden");
    elements.authSubmit.disabled = true;
    setAuthFeedback("Adicione as credenciais do Supabase para publicar o app.", true);
    return;
  }
  supabase.auth.onAuthStateChange((event, nextSession) => {
    if (event === "SIGNED_OUT") {
      session = null;
      showAuth();
      setAuthMode("login");
    } else if (event === "PASSWORD_RECOVERY" && nextSession) {
      session = nextSession;
      showAuth();
      setAuthMode("recovery");
    } else if (event === "SIGNED_IN" && nextSession && !session) {
      void enterSession(nextSession);
    }
  });
  const { data } = await supabase.auth.getSession();
  if (data.session && authMode !== "recovery" && !session) await enterSession(data.session);
}

void initialize();
