(() => {
  const settings = window.BIRTHDAY || {};
  const name = (settings.name || "Saali ji").trim();
  const nameEl = document.getElementById("recipient-name");
  const displayName = name.endsWith(".") ? name : `${name}.`;
  nameEl.textContent = displayName;
  document.getElementById("recipient-name-hero").textContent = displayName;
  document.getElementById("sender-name").textContent = settings.from || "your jiju";
  document.title = `Happy birthday, ${name.replace(/[.!?]+$/, "")}`;
  if (settings.heroImage) document.getElementById("hero-photo").style.backgroundImage = `linear-gradient(90deg,#0a042077,#0a042033 50%,#0a042099),url("${settings.heroImage}")`;

  // Reveal sections as they enter the viewport while scrolling.
  document.documentElement.classList.add("js-reveal");
  const revealItems = document.querySelectorAll(".intro, .section-label, .cake-stage, .wish-action, .sister-note, .memories-heading, .memory-card, .photo-footnote, .reasons-heading, .reason-card, .play-heading, .letter, .open-when>div");
  let revealObserver = null;
  revealItems.forEach((item, index) => {
    item.classList.add("reveal");
    item.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 120}ms`);
  });
  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }
  const progressBar = document.getElementById("scroll-progress-bar");
  let photoCards = [];
  const orbitDecorations = [...document.querySelectorAll(".hero-orbit")];
  const ambientStars = [...document.querySelectorAll(".ambient i")];
  let scrollFrame = 0;
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
    photoCards.forEach((card, index) => {
      const center = card.getBoundingClientRect().top + card.offsetHeight / 2;
      const drift = Math.max(-24, Math.min(24, (window.innerHeight / 2 - center) * 0.035));
      card.style.setProperty("--image-drift", `${drift}px`);
    });
    orbitDecorations.forEach((orbit, index) => {
      const scale = Math.max(.88, 1 - window.scrollY / (window.innerHeight * (3.2 + index)));
      orbit.style.setProperty("--scroll-scale", scale.toFixed(3));
    });
    ambientStars.forEach((star, index) => {
      const drift = (window.scrollY * (index % 2 ? .018 : -.014)) % 30;
      star.style.setProperty("--scroll-drift", `${drift}px`);
    });
  };
  window.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(() => {
      updateProgress();
      scrollFrame = 0;
    });
  }, { passive: true });
  updateProgress();

  // Creator-configured images are ordinary files in the images/ folder.
  const gallery = document.getElementById("photo-grid");
  function addPhoto(src, caption, index) {
    const figure = document.createElement("figure");
    figure.className = `memory-card memory-${(index % 3) + 1}`;
    figure.classList.add("reveal");
    figure.style.setProperty("--card-order", index);
    if (src) {
      const image = document.createElement("img");
      image.src = src;
      image.alt = caption || "A favorite sister memory";
      image.loading = "lazy";
      image.addEventListener("error", () => figure.classList.add("image-missing"), { once: true });
      figure.appendChild(image);
    } else {
      figure.classList.add("photo-placeholder");
      const art = document.createElement("div");
      art.className = "placeholder-art";
      art.innerHTML = `<span class="placeholder-star">✦</span><span class="placeholder-heart">♡</span><span class="placeholder-index">MEMORY NO. 0${index + 1}</span>`;
      figure.appendChild(art);
    }
    const captionElement = document.createElement("figcaption");
    const counter = document.createElement("span");
    counter.className = "caption-number";
    counter.textContent = `0${index + 1} / `;
    captionElement.append(counter, document.createTextNode(caption || "our favorite kind of chaos"));
    figure.appendChild(captionElement);
    gallery.appendChild(figure);
    if (revealObserver) revealObserver.observe(figure);
    else figure.classList.add("is-visible");
  }
  const photos = settings.photos || [];
  const memories = photos.length ? photos : [
    { caption: "the little things we never forget" },
    { caption: "a favorite family moment" },
    { caption: "one more story for the books" }
  ];
  memories.forEach((photo, index) => addPhoto(photo.src, photo.caption, index));
  photoCards = [...gallery.querySelectorAll(".memory-card")];
  const photoDialog = document.getElementById("photo-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  gallery.addEventListener("click", event => {
    const card = event.target.closest(".memory-card:not(.photo-placeholder)");
    if (!card) return;
    const image = card.querySelector("img");
    if (!image) return;
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = card.querySelector("figcaption")?.textContent || "A favorite memory";
    photoDialog.showModal();
  });
  document.getElementById("lightbox-close").addEventListener("click", () => photoDialog.close());
  photoDialog.addEventListener("click", event => { if (event.target === photoDialog) photoDialog.close(); });

  // A little balloon popping game: six creator-authored wishes, no visitor editing.
  const balloonMessages = settings.balloonWishes?.length ? settings.balloonWishes : [
    "You make every room brighter.", "I’m always in your corner.", "Your laugh is my favorite sound.",
    "You deserve every good thing coming your way.", "I’m so glad to have you as family.", "Your jiju is always cheering for you."
  ];
  const balloonGame = document.getElementById("balloon-game");
  const gameCount = document.getElementById("game-count");
  let poppedCount = 0;
  balloonMessages.slice(0, 6).forEach((message, index) => {
    const balloon = document.createElement("button");
    balloon.type = "button";
    balloon.className = `balloon balloon-${(index % 6) + 1}`;
    balloon.setAttribute("aria-label", `Pop birthday balloon ${index + 1}`);
    balloon.innerHTML = `<span class="balloon-shape"><i></i></span><span class="balloon-string"></span><span class="balloon-wish"></span>`;
    balloon.addEventListener("click", () => {
      if (balloon.classList.contains("popped")) return;
      balloon.classList.add("popped");
      balloon.querySelector(".balloon-wish").textContent = message;
      balloon.setAttribute("aria-label", message);
      poppedCount++;
      gameCount.textContent = `${poppedCount} of ${Math.min(balloonMessages.length, 6)} wishes found`;
      if (poppedCount === Math.min(balloonMessages.length, 6)) gameCount.textContent = "All the birthday love, just for you ✨";
    });
    balloonGame.appendChild(balloon);
  });

  // Four-page birthday letter turns forward and back; the recipient cannot edit it.
  const defaultPages = [
    "I’m so glad life brought us together as family. You may be my saali ji, but in my heart you’re a sister and a friend I can always count on. I hope you know how much you mean to me.",
    "Thank you for every laugh, every kind moment, and all the ways you make family time brighter. I’m grateful to share so many memories with you—and excited for all the ones still to come.",
    "I hope this next chapter brings you joy that surprises you, people who love you well, and the courage to chase everything you’ve been dreaming about. You deserve the very best.",
    "Happy birthday, Saali ji. I may be your jiju by relation, but I’m proud to call you my sister by heart. I’ll always be cheering you on. Here’s to a year full of joy and wonderful memories."
  ];
  const pages = settings.pages?.length ? settings.pages : settings.message ? [settings.message] : defaultPages;
  const pageElement = document.getElementById("letter-page");
  const pageCount = document.getElementById("page-count");
  const previousPage = document.getElementById("prev-page");
  const nextPage = document.getElementById("next-page");
  let currentPage = 0;
  function showPage(direction = 1) {
    pageElement.classList.remove("turn-forward", "turn-back");
    void pageElement.offsetWidth;
    if (direction) pageElement.classList.add(direction > 0 ? "turn-forward" : "turn-back");
    pageElement.replaceChildren();
    (pages[currentPage] || "").split(/\n\s*\n/).forEach(text => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      pageElement.appendChild(paragraph);
    });
    pageCount.textContent = `Page ${currentPage + 1} of ${pages.length}`;
    previousPage.disabled = currentPage === 0;
    nextPage.disabled = currentPage === pages.length - 1;
  }
  previousPage.addEventListener("click", () => { if (currentPage > 0) { currentPage--; showPage(-1); } });
  nextPage.addEventListener("click", () => { if (currentPage < pages.length - 1) { currentPage++; showPage(1); } });
  showPage(0);

  // Envelope notes and optional music / voice-note files are set up by the creator.
  const envelopeNotes = settings.envelopes?.length ? settings.envelopes : [
    { title: "On a hard day", message: "You never have to figure everything out alone. I’m right here, always." },
    { title: "When you need a laugh", message: "Remember all the ridiculous things we’ve done? We still have so many more ahead." },
    { title: "When you need a reminder", message: "You are loved exactly as you are, on every kind of day." }
  ];
  const envelopeGrid = document.getElementById("envelope-grid");
  const messageDialog = document.getElementById("message-dialog");
  envelopeNotes.forEach((note, index) => {
    const envelope = document.createElement("button");
    envelope.type = "button";
    envelope.className = `envelope envelope-${(index % 4) + 1}`;
    envelope.innerHTML = `<span class="envelope-icon">✉</span><span class="envelope-title"></span><span class="envelope-open">OPEN NOTE ↗</span>`;
    envelope.querySelector(".envelope-title").textContent = note.title;
    envelope.addEventListener("click", () => {
      document.getElementById("message-prompt").textContent = note.title;
      document.getElementById("message-copy").textContent = note.message;
      messageDialog.showModal();
    });
    envelopeGrid.appendChild(envelope);
  });
  document.getElementById("message-close").addEventListener("click", () => messageDialog.close());
  messageDialog.addEventListener("click", event => { if (event.target === messageDialog) messageDialog.close(); });
  const soundtrackContent = document.getElementById("soundtrack-content");
  function getYouTubeId(value) {
    if (!value) return "";
    const candidate = value.trim();
    if (/^[\w-]{11}$/.test(candidate)) return candidate;
    try {
      const url = new URL(candidate);
      const host = url.hostname.replace(/^www\./, "");
      let id = "";
      if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] || "";
      else if (["youtube.com", "m.youtube.com", "music.youtube.com"].includes(host)) {
        if (url.pathname === "/watch") id = url.searchParams.get("v") || "";
        else id = url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)?.[1] || "";
      }
      return /^[\w-]{11}$/.test(id) ? id : "";
    } catch { return ""; }
  }
  const youtubeId = getYouTubeId(settings.youtubeSong);
  if (youtubeId) {
    document.getElementById("soundtrack").hidden = false;
    const card = document.createElement("article");
    card.className = "sound-card youtube-card";
    const heading = document.createElement("h3");
    heading.textContent = settings.youtubeSongTitle || "Our special song";
    const label = document.createElement("p");
    label.textContent = "A little soundtrack for your birthday";
    const frame = document.createElement("div");
    frame.className = "youtube-embed-shell";
    const player = document.createElement("iframe");
    player.src = `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`;
    player.title = `${heading.textContent} — YouTube player`;
    player.loading = "lazy";
    player.referrerPolicy = "strict-origin-when-cross-origin";
    player.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    player.allowFullscreen = true;
    frame.appendChild(player);
    const watchLink = document.createElement("a");
    watchLink.className = "youtube-fallback";
    watchLink.href = `https://www.youtube.com/watch?v=${youtubeId}`;
    watchLink.target = "_blank";
    watchLink.rel = "noopener noreferrer";
    watchLink.textContent = "Open this song on YouTube ↗";
    const playerHint = document.createElement("p");
    playerHint.className = "youtube-hint";
    playerHint.textContent = window.location.protocol === "file:"
      ? "YouTube needs a web address to play here. Preview on your published site or run a local web server."
      : "If the video doesn’t allow embeds, open it on YouTube instead.";
    card.append(heading, label, frame, watchLink, playerHint);
    soundtrackContent.appendChild(card);
  }
  const audioItems = [settings.song && { title: "A song that feels like us", label: "Our song", src: settings.song }, settings.voiceNote && { title: "A little voice note", label: "From me to you", src: settings.voiceNote }].filter(Boolean);
  if (audioItems.length) {
    document.getElementById("soundtrack").hidden = false;
    audioItems.forEach(item => {
      const card = document.createElement("article");
      card.className = "sound-card";
      const heading = document.createElement("h3");
      heading.textContent = item.title;
      const label = document.createElement("p");
      label.textContent = item.label;
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.preload = "none";
      audio.src = item.src;
      card.append(heading, label, audio);
      soundtrackContent.appendChild(card);
    });
  }

  const cake = document.querySelector(".cake");
  const button = document.getElementById("candle-button");
  const label = document.getElementById("button-label");
  const prompt = document.getElementById("wish-prompt");
  const confettiLayer = document.getElementById("confetti-layer");
  const toast = document.getElementById("toast");
  let blown = false;
  let toastTimer;

  function celebrate() {
    const colors = ["#f1cf92", "#f29ab0", "#fff0d5", "#c99bc0", "#f08c73", "#a6c7a1"];
    for (let i = 0; i < 90; i++) {
      const piece = document.createElement("span");
      const heart = i % 13 === 0;
      piece.className = `confetti${heart ? " heart-piece" : ""}`;
      if (heart) piece.textContent = "♥";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.setProperty("--piece-color", colors[i % colors.length]);
      piece.style.setProperty("--duration", `${2.8 + Math.random() * 2.7}s`);
      piece.style.setProperty("--delay", `${Math.random() * .8}s`);
      piece.style.setProperty("--drift", `${Math.random() * 200 - 100}px`);
      piece.style.setProperty("--spin", `${Math.random() * 180}deg`);
      piece.style.setProperty("--end-spin", `${Math.random() * 900 - 450}deg`);
      if (!heart) piece.style.background = colors[i % colors.length];
      confettiLayer.appendChild(piece);
      window.setTimeout(() => piece.remove(), 6500);
    }
  }

  button.addEventListener("click", () => {
    if (!blown) {
      blown = true;
      cake.classList.add("is-blown");
      label.textContent = "Light the candles again";
      prompt.textContent = "Your wish is on its way. ✨";
      celebrate();
      toast.textContent = "A little birthday magic, just for you ✨";
    } else {
      blown = false;
      cake.classList.remove("is-blown");
      label.textContent = "Blow out the candles";
      prompt.textContent = "Close your eyes and make a wish.";
      toast.textContent = "The candles are glowing again 🕯️";
    }
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  });
})();
