const USERS_KEY = "dermabio_users";
const SESSION_KEY = "dermabio_session";
const APPOINTMENTS_KEY = "dermabio_appointments";

const exhibitions = [
  {
    id: "depilacao-laser",
    title: "Depilação a Laser",
    room: "Sala Laser",
    period: "Mai - Jul 2026",
    description: "Avaliação personalizada para pele lisinha, macia e com resultados duradouros.",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "limpeza-de-pele",
    title: "Limpeza de Pele",
    room: "Sala Facial",
    period: "Jun - Ago 2026",
    description: "Higienização profunda, renovação e cuidado para realçar a saúde da pele.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "bioestimulacao",
    title: "Bioestimulação",
    room: "Studio Corpo",
    period: "Toda sexta",
    description: "Protocolos para firmeza, viço e melhora progressiva da qualidade da pele.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "harmonizacao-facial",
    title: "Harmonização Facial",
    room: "Hub Biomed",
    period: "Jul - Set 2026",
    description: "Planejamento facial com anamnese, biossegurança e naturalidade no resultado.",
    image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=900&q=80",
  },
];

const defaultUsers = [
  {
    name: "Administrador",
    email: "admin@expo.com",
    password: "123456",
  },
];

const authPanel = document.querySelector("#authPanel");
const landingPanel = document.querySelector("#landingPanel");
const dashboard = document.querySelector("#dashboard");
const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const appointmentForm = document.querySelector("#appointmentForm");
const openAuthButton = document.querySelector("#openAuthButton");
const loginMessage = document.querySelector("#loginMessage");
const registerMessage = document.querySelector("#registerMessage");
const appointmentMessage = document.querySelector("#appointmentMessage");
const currentUser = document.querySelector("#currentUser");
const logoutButton = document.querySelector("#logoutButton");
const exhibitionList = document.querySelector("#exhibitionList");
const exhibitionSelect = document.querySelector("#exhibitionSelect");
const appointmentTable = document.querySelector("#appointmentTable");
const emptyState = document.querySelector("#emptyState");
const totalAppointments = document.querySelector("#totalAppointments");
const visitDate = document.querySelector("#visitDate");

function readStorage(key, fallback) {
  const saved = localStorage.getItem(key);

  if (!saved) {
    return fallback;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  const users = readStorage(USERS_KEY, []);

  if (users.length === 0) {
    writeStorage(USERS_KEY, defaultUsers);
    return defaultUsers;
  }

  return users;
}

function getAppointments() {
  return readStorage(APPOINTMENTS_KEY, []);
}

function setMessage(element, message, isSuccess = false) {
  element.textContent = message;
  element.classList.toggle("success", isSuccess);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function renderExhibitions() {
  exhibitionList.innerHTML = exhibitions
    .map(
      (exhibition) => `
        <article class="exhibition-card">
          <img src="${exhibition.image}" alt="${exhibition.title}" />
          <div>
            <h3>${exhibition.title}</h3>
            <p>${exhibition.description}</p>
            <span class="tag">${exhibition.room} | ${exhibition.period}</span>
          </div>
        </article>
      `,
    )
    .join("");

  exhibitionSelect.innerHTML = exhibitions
    .map((exhibition) => `<option value="${exhibition.id}">${exhibition.title}</option>`)
    .join("");
}

function renderAppointments() {
  const appointments = getAppointments();
  totalAppointments.textContent = String(appointments.length);
  emptyState.classList.toggle("hidden", appointments.length > 0);

  appointmentTable.innerHTML = appointments
    .map((appointment) => {
      const exhibition = exhibitions.find((item) => item.id === appointment.exhibitionId);

      return `
        <tr>
          <td>${appointment.visitorName}<br /><small>${appointment.visitorEmail}</small></td>
          <td>${exhibition?.title || "Experiencia"}</td>
          <td>${formatDate(appointment.visitDate)}</td>
          <td>${appointment.visitTime}</td>
          <td>${appointment.partySize}</td>
          <td><button class="delete-button" type="button" data-id="${appointment.id}">Remover</button></td>
        </tr>
      `;
    })
    .join("");
}

function showDashboard(user) {
  landingPanel.classList.add("hidden");
  authPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");
  currentUser.textContent = user.name;
  renderAppointments();
}

function showLogin() {
  landingPanel.classList.add("hidden");
  dashboard.classList.add("hidden");
  authPanel.classList.remove("hidden");
}

function showLanding() {
  dashboard.classList.add("hidden");
  authPanel.classList.add("hidden");
  landingPanel.classList.remove("hidden");
}

function startSession(user) {
  writeStorage(SESSION_KEY, { email: user.email });
  showDashboard(user);
}

function hydrateSession() {
  renderExhibitions();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  visitDate.min = tomorrow.toISOString().slice(0, 10);
  visitDate.value = visitDate.min;

  const session = readStorage(SESSION_KEY, null);
  const user = session ? getUsers().find((item) => item.email === session.email) : null;

  if (user) {
    showDashboard(user);
  } else {
    showLanding();
  }
}

openAuthButton.addEventListener("click", showLogin);

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#loginEmail").value.trim().toLowerCase();
  const password = document.querySelector("#loginPassword").value;
  const user = getUsers().find((item) => item.email === email && item.password === password);

  if (!user) {
    setMessage(loginMessage, "E-mail ou senha incorretos.");
    return;
  }

  setMessage(loginMessage, "Login realizado com sucesso.", true);
  loginForm.reset();
  startSession(user);
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#registerName").value.trim();
  const email = document.querySelector("#registerEmail").value.trim().toLowerCase();
  const password = document.querySelector("#registerPassword").value;
  const users = getUsers();

  if (users.some((user) => user.email === email)) {
    setMessage(registerMessage, "Este e-mail ja esta cadastrado.");
    return;
  }

  const user = { name, email, password };
  writeStorage(USERS_KEY, [...users, user]);
  setMessage(registerMessage, "Cadastro criado. Entrando no painel...", true);
  registerForm.reset();
  startSession(user);
});

appointmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const appointments = getAppointments();
  const partySize = Number(document.querySelector("#partySize").value);
  const visitDateValue = document.querySelector("#visitDate").value;
  const visitTime = document.querySelector("#visitTime").value;
  const exhibitionId = document.querySelector("#exhibitionSelect").value;

  const peopleAtTime = appointments
    .filter(
      (appointment) =>
        appointment.visitDate === visitDateValue &&
        appointment.visitTime === visitTime &&
        appointment.exhibitionId === exhibitionId,
    )
    .reduce((total, appointment) => total + Number(appointment.partySize), 0);

  if (peopleAtTime + partySize > 30) {
    setMessage(appointmentMessage, "Este horario ultrapassa o limite de 30 pessoas.");
    return;
  }

  const appointment = {
    id: crypto.randomUUID(),
    visitorName: document.querySelector("#visitorName").value.trim(),
    visitorEmail: document.querySelector("#visitorEmail").value.trim().toLowerCase(),
    exhibitionId,
    visitDate: visitDateValue,
    visitTime,
    partySize,
  };

  writeStorage(APPOINTMENTS_KEY, [appointment, ...appointments]);
  appointmentForm.reset();
  visitDate.value = visitDate.min;
  setMessage(appointmentMessage, "Avaliacao registrada com sucesso.", true);
  renderAppointments();
});

appointmentTable.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-button");

  if (!button) {
    return;
  }

  const appointments = getAppointments().filter((appointment) => appointment.id !== button.dataset.id);
  writeStorage(APPOINTMENTS_KEY, appointments);
  renderAppointments();
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  showLogin();
});

hydrateSession();
