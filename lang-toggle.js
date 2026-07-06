// تبديل اللغة عربي/إنجليزي، وتأثير الظهور عند التمرير — مشترك بين كل الصفحات
(function () {
  function applyLang(lang) {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    localStorage.setItem("pageai_lang", lang);
    document.querySelectorAll(".lang-toggle").forEach((btn) => {
      btn.textContent = lang === "ar" ? "EN" : "AR";
    });
  }

  const saved = localStorage.getItem("pageai_lang") || "ar";
  applyLang(saved);

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".lang-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("lang");
        applyLang(current === "ar" ? "en" : "ar");
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  });
})();
