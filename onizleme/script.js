(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EN = root.lang === "en";
  var T = EN
    ? { img: "image", video: "EV Rota intro video", copied: "Copied ✓", copy: "Copy", selected: "Selected, press Ctrl+C", locale: "en-US" }
    : { img: "görsel", video: "EV Rota tanıtım videosu", copied: "Kopyalandı ✓", copy: "Kopyala", selected: "Seçildi, Ctrl+C", locale: "tr-TR" };

  // Tema düğmesi
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

  // Üst menü arka planı ve kaydırma çubuğu
  var topbar = document.querySelector(".topbar");
  var progress = document.querySelector(".progress");
  function onScroll() {
    var y = window.scrollY;
    topbar.classList.toggle("scrolled", y > 20);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Dönen kelimeler
  var words = document.querySelectorAll(".rotator span");
  if (words.length && !reduce) {
    var w = 0;
    setInterval(function () {
      var cur = words[w];
      cur.classList.remove("on");
      cur.classList.add("off");
      w = (w + 1) % words.length;
      var next = words[w];
      next.classList.remove("off");
      void next.offsetWidth;
      next.classList.add("on");
      setTimeout(function () { cur.classList.remove("off"); }, 650);
    }, 2600);
  }

  // Kolajda fareyle hafif derinlik
  var collage = document.getElementById("collage");
  if (collage && !reduce && window.matchMedia("(pointer: fine)").matches) {
    var shots = collage.querySelectorAll(".shot");
    collage.parentElement.addEventListener("mousemove", function (e) {
      var r = collage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      shots.forEach(function (s, i) {
        var d = (i + 1) * 8;
        s.style.transform = "translate(" + (-x * d) + "px," + (-y * d) + "px) rotateY(" + (x * 4) + "deg) rotateX(" + (-y * 4) + "deg)";
      });
    });
    collage.parentElement.addEventListener("mouseleave", function () {
      shots.forEach(function (s) { s.style.transform = ""; });
    });
  }

  // Sayaçlar
  function countUp(el) {
    var to = +el.getAttribute("data-count");
    var suffix = el.getAttribute("data-suffix") || "";
    var start = null;
    function step(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / 1400);
      var v = Math.round(to * (1 - Math.pow(1 - p, 3)));
      el.textContent = v.toLocaleString(T.locale) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Kaydırınca belirme
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      if (en.target.hasAttribute("data-count") && !reduce) countUp(en.target);
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -40px 0px", threshold: 0.01 }) : null;
  document.querySelectorAll(".rv, [data-count]").forEach(function (el) {
    if (io) io.observe(el); else el.classList.add("in");
  });

  // Menüde aktif bölüm
  var links = nav.querySelectorAll("a");
  if ("IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute("href")); if (s) sio.observe(s); });
  }

  // Galeriler
  var lb = document.getElementById("lightbox");
  var lbBody = document.getElementById("lb-body");
  var lbCap = document.getElementById("lb-cap");
  function openLightbox(node, cap) {
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
    setTimeout(function () { lbBody.innerHTML = ""; }, 300);
  }
  document.getElementById("lb-close").addEventListener("click", closeLightbox);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) closeLightbox(); });

  document.querySelectorAll(".gallery").forEach(function (g) {
    var stage = g.querySelector(".stage");
    var imgs = stage.querySelectorAll("img");
    var count = g.querySelector(".count");
    var txt = g.querySelector(".txt");
    var thumbs = g.querySelector(".thumbs");
    var cur = 0;
    var timer = null;

    function show(i) {
      imgs[cur].classList.remove("on");
      if (thumbs) thumbs.children[cur].classList.remove("on");
      cur = i;
      imgs[cur].classList.add("on");
      if (thumbs) thumbs.children[cur].classList.add("on");
      count.textContent = imgs.length > 1 ? String(cur + 1).padStart(2, "0") + " / " + String(imgs.length).padStart(2, "0") : "";
      txt.textContent = imgs[cur].getAttribute("data-cap") || "";
    }

    if (thumbs) {
      imgs.forEach(function (im, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", (i + 1) + ". " + T.img + ": " + im.alt);
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

    function restart() {
      if (timer) clearInterval(timer);
      if (imgs.length < 2 || reduce) return;
      timer = setInterval(function () { show((cur + 1) % imgs.length); }, 5000);
    }
    if ("IntersectionObserver" in window && imgs.length > 1) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) restart(); else if (timer) { clearInterval(timer); timer = null; }
      }, { threshold: 0.4 }).observe(stage);
    }
    stage.addEventListener("mouseenter", function () { if (timer) { clearInterval(timer); timer = null; } });
    stage.addEventListener("mouseleave", restart);

    stage.addEventListener("click", function (e) {
      if (e.target.closest(".play")) return;
      var big = document.createElement("img");
      big.src = imgs[cur].getAttribute("src");
      big.alt = imgs[cur].alt;
      openLightbox(big, imgs[cur].getAttribute("data-cap"));
    });

    var play = stage.querySelector(".play");
    if (play) {
      play.addEventListener("click", function () {
        var v = document.createElement("video");
        v.src = play.getAttribute("data-video");
        v.controls = true;
        v.autoplay = true;
        v.playsInline = true;
        openLightbox(v, T.video);
      });
    }
  });

  // Diğer işler kartlarında fareyi izleyen ışık
  document.querySelectorAll(".work").forEach(function (c) {
    c.addEventListener("mousemove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  // Telefon görüntüleri tıklayınca büyür
  document.querySelectorAll(".phone .frame").forEach(function (f) {
    var img = f.querySelector("img");
    f.setAttribute("tabindex", "0");
    f.setAttribute("role", "button");
    function open() {
      var big = document.createElement("img");
      big.src = img.getAttribute("src");
      big.alt = img.alt;
      openLightbox(big, img.getAttribute("data-cap"));
    }
    f.addEventListener("click", open);
    f.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });

  // Kolaj: dokunmatik ekranda dokunulan görsel öne çıkar
  document.querySelectorAll(".collage .shot").forEach(function (sh, i, all) {
    sh.addEventListener("click", function () {
      all.forEach(function (o) { o.classList.toggle("front", o === sh); });
    });
  });

  // E-postayı kopyala
  var copyBtn = document.getElementById("copy-email");
  var email = document.getElementById("email");
  copyBtn.addEventListener("click", function () {
    var done = function () {
      copyBtn.textContent = T.copied;
      setTimeout(function () { copyBtn.textContent = T.copy; }, 1800);
    };
    var fallback = function () {
      var range = document.createRange();
      range.selectNodeContents(email);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      copyBtn.textContent = T.selected;
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email.textContent).then(done, fallback);
    } else {
      fallback();
    }
  });
})();
