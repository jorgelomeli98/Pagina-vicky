// Constantes globales
const DOM = {
  menuToggle: document.querySelector(".menu-toggle"),
  navLinks: document.querySelector(".nav-links"),
  buttons: document.querySelectorAll(".btn[href^='#']"),
  links: document.querySelectorAll("a[href^='#']"),
  body: document.body,
  form: document.getElementById("formulario-contacto"),
  themeToggle: document.querySelector(".theme-toggle"),
  animatedElements: document.querySelectorAll(
    ".about-img, .about-text, .service-card, .testimonial, .contact-info, .contact-form"
  ),
  navLinksContainer: document.querySelector(".nav-links"),
  serviceCards: document.querySelectorAll(".service-card"), // Añadido para manejar las tarjetas
};

// Configuración de temas
const THEME = {
  current: localStorage.getItem("theme") || "light",
  applyInitialTheme() {
    if (this.current === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  },
  toggle() {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
  },
};

// Scroll suave mejorado y probado
const SmoothScroll = {
  scrollTo(target, offset = 80) {
    if (!target || target === "#") return;

    const targetElement = document.querySelector(target);
    if (!targetElement) {
      console.warn(`Elemento no encontrado: ${target}`);
      return;
    }

    const targetPosition =
      targetElement.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition - offset;
    const duration = 800;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easeProgress = easeInOutQuad(progress);

      window.scrollTo(0, startPosition + distance * easeProgress);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }

    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    requestAnimationFrame(animation);
  },
};

// Manejadores de eventos
const EventHandlers = {
  toggleMobileMenu() {
    DOM.menuToggle.classList.toggle("active");
    DOM.navLinks.classList.toggle("active");
    DOM.body.classList.toggle("menu-open");
  },

  closeMobileMenu() {
    DOM.menuToggle.classList.remove("active");
    DOM.navLinks.classList.remove("active");
    DOM.body.classList.remove("menu-open");
  },

  handleNavClick(e) {
    if (e.target.tagName === "A") {
      const href = e.target.getAttribute("href");
      if (href?.startsWith("#")) {
        e.preventDefault();
        this.closeMobileMenu();
        SmoothScroll.scrollTo(href);
      }
    }
  },

  handleFormSubmit(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("email").value;
    const telefono =
      document.getElementById("telefono").value || "No proporcionado";
    const servicio =
      document.getElementById("servicio").options[
        document.getElementById("servicio").selectedIndex
      ].text;
    const mensaje = document.getElementById("mensaje").value;

    const destinatario = "psicol.virginiaurzuavirgen04@gmail.com";

    const asunto = `Nuevo mensaje de ${nombre}`;
    const cuerpo = `
Nombre: ${nombre}
Correo: ${correo}
Teléfono: ${telefono}
Servicio de interés: ${servicio}

Mensaje:
${mensaje}
    `.trim();

    const mailtoLink = `mailto:${destinatario}?subject=${encodeURIComponent(
      asunto
    )}&body=${encodeURIComponent(cuerpo)}`;

    // Redirige al enlace
    window.location.href = mailtoLink;
    DOM.form.reset();
  },

  handleCardHover(e) {
    const card = e.target.closest(".service-card");
    if (!card || !card.classList.contains("visible")) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const distanceFromEdgeX = Math.abs(x - centerX) / centerX;
    const distanceFromEdgeY = Math.abs(y - centerY) / centerY;
    const intensity = 1 + distanceFromEdgeX * distanceFromEdgeY * 0.5;

    const rotateY = ((x - centerX) / 25) * intensity;
    const rotateX = ((centerY - y) / 25) * intensity;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    card.style.boxShadow = "0 15px 30px rgba(0, 0, 0, 0.2)";
  },

  handleCardLeave(e) {
    const card = e.target.closest(".service-card");
    if (!card) return;

    // SOLUCIÓN CLAVE: Reset completo con transición temporal
    card.style.transition = "transform 0.4s ease, box-shadow 0.4s ease";
    card.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    card.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.1)";

    // Eliminar la transición después de completarse
    setTimeout(() => {
      card.style.transition = "";
    }, 400);
  },

  // Nueva función para manejar el mouseout en cada tarjeta individualmente
  setupCardHoverEffects() {
    DOM.serviceCards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.addEventListener("mousemove", EventHandlers.handleCardHover);
      });

      card.addEventListener("mouseleave", (e) => {
        card.removeEventListener("mousemove", EventHandlers.handleCardHover);
        EventHandlers.handleCardLeave(e);
      });
    });
  },
};

// Animaciones al aparecer
function setupIntersectionObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    }
  );

  DOM.animatedElements.forEach((el) => observer.observe(el));
}

// Inicialización
function init() {
  // Menú móvil
  DOM.menuToggle.addEventListener("click", EventHandlers.toggleMobileMenu);

  // Navegación con scroll suave
  DOM.navLinksContainer.addEventListener("click", (e) => {
    EventHandlers.handleNavClick(e);
  });

  DOM.links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      SmoothScroll.scrollTo(href);
    });
  });

  DOM.buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const href = button.getAttribute("href");
      SmoothScroll.scrollTo(href);
      EventHandlers.closeMobileMenu();
    });
  });

  // Formulario
  if (DOM.form) {
    DOM.form.addEventListener("submit", EventHandlers.handleFormSubmit);
  }

  // Tema
  THEME.applyInitialTheme();
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener("click", THEME.toggle);
  }

  // Animaciones
  setupIntersectionObserver();

  // Efectos hover - Versión corregida
  if (window.innerWidth > 768) {
    EventHandlers.setupCardHoverEffects();
  }
}

// Iniciar
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
