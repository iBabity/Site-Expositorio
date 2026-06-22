const CLINIC_WHATSAPP = "5512991471529";
const APPOINTMENTS_KEY = "dermabio_appointments";

const exhibitions = [
  {
    id: "depilacao-laser",
    title: "Depilação a Laser",
    description: "Avaliação personalizada para pele lisinha, macia e com resultados duradouros.",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "limpeza-de-pele",
    title: "Limpeza de Pele",
    description: "Higienização profunda, renovação e cuidado para realçar a saúde da pele.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "bioestimulacao",
    title: "Bioestimulação",
    description: "Protocolos para firmeza, viço e melhora progressiva da qualidade da pele.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "harmonizacao-facial",
    title: "Harmonização Facial",
    description: "Planejamento facial com anamnese, biossegurança e naturalidade no resultado.",
    image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=900&q=80",
  },
];

const landingPanel = document.querySelector("#landingPanel");
const bookingPanel = document.querySelector("#bookingPanel");
const openBookingButton = document.querySelector("#openBookingButton");
const backToSiteButton = document.querySelector("#backToSiteButton");
const appointmentForm = document.querySelector("#appointmentForm");
const appointmentMessage = document.querySelector("#appointmentMessage");
const exhibitionList = document.querySelector("#exhibitionList");
const exhibitionSelect = document.querySelector("#exhibitionSelect");
const visitDate = document.querySelector("#visitDate");
const visitTime = document.querySelector("#visitTime");
const bookingConfirmation = document.querySelector("#bookingConfirmation");
const confirmationCode = document.querySelector("#confirmationCode");
const confirmationSummary = document.querySelector("#confirmationSummary");
const whatsappConfirmButton = document.querySelector("#whatsappConfirmButton");

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

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMinimumVisitDate() {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return toDateValue(tomorrow);
}

function getExhibitionTitle(exhibitionId) {
  return exhibitions.find((item) => item.id === exhibitionId)?.title || "Avaliação";
}

function generateConfirmationCode(dateValue, timeValue) {
  const suffix = crypto.randomUUID().slice(0, 4).toUpperCase();

  return `LR-${dateValue.replaceAll("-", "")}-${timeValue.replace(":", "")}-${suffix}`;
}

function buildWhatsAppMessage(appointment) {
  return [
    "Olá, gostaria de marcar essa avaliação. Teria disponibilidade de horário? Vi pelo site.",
    "",
    `Nome: ${appointment.visitorName}`,
    `Procedimento: ${getExhibitionTitle(appointment.exhibitionId)}`,
    `Data: ${formatDate(appointment.visitDate)}`,
    `Horário: ${appointment.visitTime}`,
    `WhatsApp: ${appointment.visitorPhone}`,
  ].join("\n");
}

function prepareWhatsAppLink(appointment) {
  whatsappConfirmButton.href = `https://wa.me/${CLINIC_WHATSAPP}?text=${encodeURIComponent(
    buildWhatsAppMessage(appointment),
  )}`;
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
          </div>
        </article>
      `,
    )
    .join("");

  exhibitionSelect.innerHTML = exhibitions
    .map((exhibition) => `<option value="${exhibition.id}">${exhibition.title}</option>`)
    .join("");
}

function showBooking() {
  landingPanel.classList.add("hidden");
  bookingPanel.classList.remove("hidden");
}

function showLanding() {
  bookingPanel.classList.add("hidden");
  landingPanel.classList.remove("hidden");
}

window.showBooking = showBooking;
window.showLanding = showLanding;

function hydrate() {
  renderExhibitions();
  visitDate.min = getMinimumVisitDate();
  visitDate.value = visitDate.min;
}

document.addEventListener("click", (event) => {
  if (event.target.closest("#openBookingButton")) {
    showBooking();
    return;
  }

  if (event.target.closest("#backToSiteButton")) {
    showLanding();
  }
});

appointmentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const appointment = {
    id: crypto.randomUUID(),
    visitorName: document.querySelector("#visitorName").value.trim(),
    visitorEmail: document.querySelector("#visitorEmail").value.trim().toLowerCase(),
    visitorPhone: document.querySelector("#visitorPhone").value.trim(),
    exhibitionId: exhibitionSelect.value,
    visitDate: visitDate.value,
    visitTime: visitTime.value,
    confirmationCode: generateConfirmationCode(visitDate.value, visitTime.value),
    status: "novo",
  };

  writeStorage(APPOINTMENTS_KEY, [appointment, ...getAppointments()]);
  setMessage(appointmentMessage, "Avaliacao registrada com sucesso.", true);
  confirmationCode.textContent = `Protocolo ${appointment.confirmationCode}`;
  confirmationSummary.textContent = `${getExhibitionTitle(appointment.exhibitionId)} em ${formatDate(
    appointment.visitDate,
  )} as ${appointment.visitTime}.`;
  prepareWhatsAppLink(appointment);
  bookingConfirmation.classList.remove("hidden");
  whatsappConfirmButton.classList.remove("hidden");
  appointmentForm.reset();
  visitDate.value = visitDate.min;
});

hydrate();
