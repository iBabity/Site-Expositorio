const CLINIC_WHATSAPP = "5512991471529";
const APPOINTMENTS_KEY = "dermabio_appointments";

const exhibitions = [
  {
    id: "depilacao-laser",
    title: "Depilação a Laser",
    description: "Avaliação personalizada para pele lisinha, macia e com resultados duradouros.",
    image: "assets/depilacao-laser.jpg",
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
    image: "assets/bioestimulador-v2.jpg",
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
    status: "novo",
  };

  writeStorage(APPOINTMENTS_KEY, [appointment, ...getAppointments()]);
  setMessage(appointmentMessage, "Avaliacao registrada com sucesso.", true);
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

const educationSlides = Array.from(document.querySelectorAll(".education-slide"));
const carouselStatus = document.querySelector("#carouselStatus");
let currentEducationSlide = 0;
function showEducationSlide(index) {
  currentEducationSlide = (index + educationSlides.length) % educationSlides.length;
  educationSlides.forEach((slide, i) => { slide.hidden = i !== currentEducationSlide; });
  carouselStatus.textContent = `${currentEducationSlide + 1} / ${educationSlides.length}`;
}
document.querySelector("#carouselPrevious").addEventListener("click", () => showEducationSlide(currentEducationSlide - 1));
document.querySelector("#carouselNext").addEventListener("click", () => showEducationSlide(currentEducationSlide + 1));

// Each card controls its own silent video, so the gallery can grow independently.
document.querySelectorAll(".video-card").forEach((card) => {
  const video = card.querySelector(".procedure-video");
  const button = card.querySelector(".video-play");
  const updateButton = () => {
    const playing = !video.paused && !video.ended;
    button.innerHTML = playing ? "❚❚ <span>Pausar</span>" : "▶ <span>Reproduzir</span>";
    button.setAttribute("aria-pressed", String(playing));
    button.setAttribute("aria-label", playing ? "Pausar vídeo do atendimento" : "Reproduzir vídeo do atendimento");
  };
  video.muted = true;
  video.addEventListener("volumechange", () => { if (!video.muted) video.muted = true; });
  video.addEventListener("play", updateButton);
  video.addEventListener("pause", updateButton);
  video.addEventListener("ended", updateButton);
  button.addEventListener("click", async () => {
    if (video.paused) {
      try { await video.play(); } catch { button.querySelector("span").textContent = "Vídeo indisponível"; }
    } else video.pause();
  });
});

const careCarousel = document.querySelector(".care-carousel");
const careSlides = Array.from(careCarousel.querySelectorAll(".care-slide"));
const careControls = careCarousel.querySelector(".care-controls");
const careStatus = careCarousel.querySelector(".care-status");
let currentCareSlide = 0;
function showCareSlide(index) {
  currentCareSlide = (index + careSlides.length) % careSlides.length;
  careSlides.forEach((slide, i) => { slide.hidden = i !== currentCareSlide; });
  careStatus.textContent = `${currentCareSlide + 1} / ${careSlides.length}`;
}
if (careSlides.length) {
  showCareSlide(0);
  careControls.hidden = careSlides.length < 2;
  careCarousel.querySelector(".care-previous").addEventListener("click", () => showCareSlide(currentCareSlide - 1));
  careCarousel.querySelector(".care-next").addEventListener("click", () => showCareSlide(currentCareSlide + 1));
}
