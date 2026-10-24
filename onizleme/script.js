(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  // Tema
  document.getElementById("theme-btn").addEventListener("click", function () {
    var light = root.getAttribute("data-theme") === "light";
    if (light) root.removeAttribute("data-theme"); else root.setAttribute("data-theme", "light");
    try { localStorage.setItem("tema", light ? "dark" : "light"); } catch (e) {}
  });

  // Mobil menü
  var nav = document.getElementById("nav");
  var menuBtn = document.getElementById("menu-btn");
  menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
  });

  // Ölçüm tablosu: satırlar sırayla gelir
  var readout = document.getElementById("readout");
  requestAnimationFrame(function () { setTimeout(function () { readout.classList.add("go"); }, 150); });

  // Kaydırınca belirme
  var io = hasIO ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -40px 0px", threshold: 0.01 }) : null;
  document.querySelectorAll(".rv").forEach(function (el) { if (io) io.observe(el); else el.classList.add("in"); });

  // Menüde aktif bölüm
  var links = nav.querySelectorAll("a");
  if (hasIO) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute("href")); if (s) sio.observe(s); });
  }

  // Büyütme penceresi
  var lb = document.getElementById("lightbox");
  var lbBody = document.getElementById("lb-body");
  var lbCap = document.getElementById("lb-cap");
  var lastFocus = null;
  function openLightbox(node, cap) {
    lastFocus = document.activeElement;
    lbBody.innerHTML = "";
    lbBody.appendChild(node);
    lbCap.textContent = cap || "";
    lb.classList.add("open");
    document.getElementById("lb-close").focus();
  }
  function closeLightbox() {
    lb.classList.remove("open");
    var v = lbBody.querySelector("video");
    if (v) v.pause();
    setTimeout(function () { lbBody.innerHTML = ""; }, 260);
    if (lastFocus) lastFocus.focus();
  }
  document.getElementById("lb-close").addEventListener("click", closeLightbox);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) closeLightbox(); });
  function bigImage(img, label) {
    var big = document.createElement("img");
    big.src = img.getAttribute("src");
    big.alt = img.alt;
    openLightbox(big, (label ? label + " — " : "") + (img.getAttribute("data-cap") || ""));
  }

  // Galeriler: numaralı şekiller, küçük resimler, otomatik geçiş
  document.querySelectorAll(".gallery").forEach(function (g) {
    var fig = g.getAttribute("data-fig");
    var stage = g.querySelector(".stage");
    var imgs = stage.querySelectorAll("img");
    var no = g.querySelector(".no");
    var txt = g.querySelector(".txt");
    var thumbs = g.querySelector(".thumbs");
    var cur = 0;
    var timer = null;
    function label(i) { return "Şekil " + fig + "." + (i + 1); }

    function show(i) {
      imgs[cur].classList.remove("on");
      if (thumbs) thumbs.children[cur].classList.remove("on");
      cur = i;
      imgs[cur].classList.add("on");
      if (thumbs) thumbs.children[cur].classList.add("on");
      no.textContent = label(cur);
      txt.textContent = imgs[cur].getAttribute("data-cap") || "";
    }
    if (thumbs) {
      imgs.forEach(function (im, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", label(i) + ": " + im.alt);
        var t = document.createElement("img");
        t.src = im.getAttribute("src");
        t.alt = "";
        t.loading = "lazy";
        b.appendChild(t);
        b.addEventListener("click", function () { show(i); restart(); });
        thumbs.appendChild(b);
      });
    }
    show(0);

    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() {
      stop();
      if (imgs.length < 2 || reduce) return;
      timer = setInterval(function () { show((cur + 1) % imgs.length); }, 5500);
    }
    if (hasIO && imgs.length > 1) {
      new IntersectionObserver(function (en) { if (en[0].isIntersecting) restart(); else stop(); }, { threshold: 0.4 }).observe(stage);
    }
    stage.addEventListener("mouseenter", stop);
    stage.addEventListener("mouseleave", restart);
    stage.addEventListener("click", function (e) {
      if (e.target.closest(".video-btn")) return;
      bigImage(imgs[cur], label(cur));
    });

    var vbtn = stage.querySelector(".video-btn");
    if (vbtn) {
      vbtn.addEventListener("click", function () {
        var v = document.createElement("video");
        v.src = vbtn.getAttribute("data-video");
        v.controls = true;
        v.autoplay = true;
        v.playsInline = true;
        openLightbox(v, "EV Rota tanıtım videosu");
      });
    }
  });

  // Telefon görüntüleri
  document.querySelectorAll(".phone .frame").forEach(function (f) {
    f.setAttribute("tabindex", "0");
    f.setAttribute("role", "button");
    var img = f.querySelector("img");
    var lab = f.parentElement.querySelector(".no").textContent;
    f.addEventListener("click", function () { bigImage(img, lab); });
    f.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); bigImage(img, lab); } });
  });

  // E-postayı kopyala
  var copyBtn = document.getElementById("copy-email");
  var email = document.getElementById("email");
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
})();
