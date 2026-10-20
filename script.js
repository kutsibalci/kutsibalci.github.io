(function () {
  // Ekrandaki bölüme göre menüde aktif bağlantıyı işaretle
  var links = document.querySelectorAll(".nav a:not(.cta)");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) {
      var section = document.querySelector(a.getAttribute("href"));
      if (section) observer.observe(section);
    });
  }

  // E-posta adresini panoya kopyala
  var copyBtn = document.getElementById("copy-email");
  var email = document.getElementById("email");
  if (copyBtn && email) {
    copyBtn.addEventListener("click", function () {
      var done = function () {
        copyBtn.textContent = "Kopyalandı ✓";
        setTimeout(function () { copyBtn.textContent = "Kopyala"; }, 1800);
      };
      var fallback = function () {
        var range = document.createRange();
        range.selectNodeContents(email);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        copyBtn.textContent = "Seçildi, Ctrl+C";
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email.textContent).then(done, fallback);
      } else {
        fallback();
      }
    });
  }
})();
