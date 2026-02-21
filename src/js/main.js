/* =============================================
   Daniel Tureck - Site JS
   Scroll reveal, fixed nav, audio players
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Fixed Nav ---- */
  const fixedNav = document.getElementById('fixedNav');
  const hero = document.querySelector('.hero');

  if (fixedNav && hero) {
    const navObserver = new IntersectionObserver(([entry]) => {
      fixedNav.classList.toggle('nav--visible', !entry.isIntersecting);
    }, { threshold: 0.05 });

    navObserver.observe(hero);
  }


  /* ---- Active Nav Link (iOS-style) ---- */
  const navLinks = fixedNav ? fixedNav.querySelectorAll('.nav__link') : [];
  const sections = [
    { id: null, el: hero },
    { id: 'work', el: document.getElementById('work') },
    { id: 'studio', el: document.getElementById('studio') },
    { id: 'contact', el: document.getElementById('contact') }
  ].filter(s => s.el);

  function updateActiveNav() {
    const scrollY = window.scrollY + window.innerHeight / 3;
    let activeId = null;

    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i].el.offsetTop <= scrollY) {
        activeId = sections[i].id;
        break;
      }
    }

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const linkId = href === '#' ? null : href.replace('#', '');
      link.classList.toggle('nav__link--active', linkId === activeId);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();


  /* ---- Scroll Down Button ---- */
  const scrollBtn = document.querySelector('.hero__scroll');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      const about = document.getElementById('about');
      if (about) about.scrollIntoView({ behavior: 'smooth' });
    });
  }


  /* ---- Hero Logo Magnetic Effect ---- */
  const heroLogo = document.querySelector('.hero__logo');
  if (heroLogo && heroLogo.tagName === 'IMG') {
    fetch(heroLogo.src)
      .then(r => r.text())
      .then(svgText => {
        const svgDoc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
        const origPath = svgDoc.querySelector('path');
        if (!origPath) return;

        const cols = 12, rows = 10;
        const vbX = -10, vbY = -10, vbW = 1440, vbH = 1195;
        const cellW = vbW / cols;
        const cellH = vbH / rows;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
        svg.style.overflow = 'visible';
        svg.setAttribute('class', heroLogo.className);
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', heroLogo.alt || 'Robot Slap Studios');

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const pathDef = origPath.cloneNode(true);
        pathDef.setAttribute('id', 'rsp');
        defs.appendChild(pathDef);

        const cells = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const clipId = `mc${c}x${r}`;
            const x = vbX + c * cellW;
            const y = vbY + r * cellH;

            const cp = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
            cp.setAttribute('id', clipId);
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', cellW);
            rect.setAttribute('height', cellH);
            cp.appendChild(rect);
            defs.appendChild(cp);

            const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            use.setAttribute('href', '#rsp');
            use.setAttribute('clip-path', `url(#${clipId})`);
            svg.appendChild(use);

            cells.push({ el: use, cx: x + cellW / 2, cy: y + cellH / 2, tx: 0, ty: 0, x: 0, y: 0, vx: 0, vy: 0 });
          }
        }

        svg.insertBefore(defs, svg.firstChild);
        heroLogo.replaceWith(svg);

        // Fade in header and nav with stagger
        const heroHeader = document.querySelector('.hero__header');
        const heroNav = document.querySelector('.hero__nav');
        setTimeout(() => heroHeader?.classList.add('visible'), 200);
        setTimeout(() => heroNav?.classList.add('visible'), 300);

        const RADIUS = 800;
        const STRENGTH = 0.6;
        let stiffness = 0.015;
        let damping = 0.92;
        const HOVER_STIFFNESS = 0.08;
        const HOVER_DAMPING = 0.7;
        let magAnim = null;
        let hovering = false;
        let introDone = false;

        // Scatter cells outward from center on load, then spring together
        const centerX = vbX + vbW / 2;
        const centerY = vbY + vbH / 2;
        cells.forEach(cell => {
          const dx = cell.cx - centerX;
          const dy = cell.cy - centerY;
          const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.8;
          const burst = 300 + Math.random() * 500;
          cell.x = Math.cos(angle) * burst;
          cell.y = Math.sin(angle) * burst;
          cell.el.setAttribute('transform', `translate(${cell.x},${cell.y})`);
        });
        requestAnimationFrame(tick);

        function tick() {
          let moving = false;
          cells.forEach(cell => {
            // Spring force toward target
            const fx = (cell.tx - cell.x) * stiffness;
            const fy = (cell.ty - cell.y) * stiffness;
            cell.vx = (cell.vx + fx) * damping;
            cell.vy = (cell.vy + fy) * damping;
            cell.x += cell.vx;
            cell.y += cell.vy;
            if (Math.abs(cell.vx) > 0.01 || Math.abs(cell.vy) > 0.01 ||
                Math.abs(cell.tx - cell.x) > 0.05 || Math.abs(cell.ty - cell.y) > 0.05) {
              moving = true;
              cell.el.setAttribute('transform', `translate(${cell.x},${cell.y})`);
            } else if (cell.x !== cell.tx || cell.y !== cell.ty) {
              cell.x = cell.tx;
              cell.y = cell.ty;
              cell.el.setAttribute('transform', cell.tx === 0 && cell.ty === 0 ? '' : `translate(${cell.x},${cell.y})`);
            }
          });
          // Frame-counter phase flip for outward flight
          if (clickPhase === 'out') {
            outFrames++;
            if (outFrames >= 30) {
              clickPhase = 'in';
              stiffness = INTRO_STIFFNESS;
              damping = INTRO_DAMPING;
              introDone = false;
              cells.forEach(cell => { cell.tx = 0; cell.ty = 0; });
            }
            magAnim = requestAnimationFrame(tick);
          } else if (moving) {
            magAnim = requestAnimationFrame(tick);
          } else {
            if (clickPhase === 'in') clickPhase = null;
            if (!introDone) {
              introDone = true;
              stiffness = HOVER_STIFFNESS;
              damping = HOVER_DAMPING;
            }
            magAnim = null;
          }
        }

        function startTick() {
          if (!magAnim) magAnim = requestAnimationFrame(tick);
        }

        let svgRect = svg.getBoundingClientRect();
        window.addEventListener('resize', () => { svgRect = svg.getBoundingClientRect(); });
        window.addEventListener('scroll', () => { svgRect = svg.getBoundingClientRect(); }, { passive: true });

        svg.addEventListener('mousemove', (e) => {
          if (clickPhase === 'out') return;
          if (clickPhase === 'in') {
            clickPhase = null;
            introDone = true;
            stiffness = HOVER_STIFFNESS;
            damping = HOVER_DAMPING;
          }
          hovering = true;
          const mx = vbX + ((e.clientX - svgRect.left) / svgRect.width) * vbW;
          const my = vbY + ((e.clientY - svgRect.top) / svgRect.height) * vbH;

          cells.forEach(cell => {
            const dx = mx - cell.cx;
            const dy = my - cell.cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const pull = Math.max(0, 1 - dist / RADIUS);
            const ease = pull * pull;
            cell.tx = dx * ease * STRENGTH;
            cell.ty = dy * ease * STRENGTH;
          });
          startTick();
        });

        svg.addEventListener('mouseleave', () => {
          hovering = false;
          cells.forEach(cell => { cell.tx = 0; cell.ty = 0; });
          startTick();
        });

        // Click: animated fly-out then animated return
        const INTRO_STIFFNESS = 0.015;
        const INTRO_DAMPING = 0.92;
        const OUT_STIFFNESS = 0.06;
        const OUT_DAMPING = 0.7;
        let clickPhase = null;
        let outFrames = 0;

        svg.addEventListener('click', () => {
          if (clickPhase) return;
          clickPhase = 'out';
          outFrames = 0;
          hovering = false;

          // Fast spring for outward flight
          stiffness = OUT_STIFFNESS;
          damping = OUT_DAMPING;

          // Set targets to scattered positions (cells spring toward them)
          cells.forEach(cell => {
            const dx = cell.cx - centerX;
            const dy = cell.cy - centerY;
            const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.8;
            const burst = 300 + Math.random() * 500;
            cell.tx = Math.cos(angle) * burst;
            cell.ty = Math.sin(angle) * burst;
            cell.vx = 0;
            cell.vy = 0;
          });
          startTick();
        });
      })
      .catch(() => {}); // Fallback: img stays as-is
  }


  /* ---- Audio Engine ---- */
  let currentAudio = null;
  let currentPlayBtn = null;
  let currentProgressBar = null;
  let currentTimeEl = null;
  let animFrame = null;

  function formatTime(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function stopCurrent() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      cancelAnimationFrame(animFrame);
      if (currentPlayBtn) currentPlayBtn.classList.remove('playing');
      if (currentProgressBar) currentProgressBar.style.width = '0%';
      if (currentTimeEl) currentTimeEl.textContent = '0:00';
      currentAudio = null;
      currentPlayBtn = null;
      currentProgressBar = null;
      currentTimeEl = null;
    }
  }

  function updateProgress() {
    if (currentAudio && currentProgressBar) {
      const pct = (currentAudio.currentTime / currentAudio.duration) * 100;
      currentProgressBar.style.width = pct + '%';
      if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(currentAudio.currentTime);
      }
      if (!currentAudio.paused) {
        animFrame = requestAnimationFrame(updateProgress);
      }
    }
  }


  /* ---- A/B (Before / After) Player ---- */
  const abTracks = document.querySelectorAll('.ab-track');

  abTracks.forEach(track => {
    const playBtn = track.querySelector('.ab-track__play');
    const progressWrap = track.querySelector('.ab-track__progress');
    const progressBar = track.querySelector('.ab-track__bar');
    const timeEl = track.querySelector('.ab-track__time');
    const durationEl = track.querySelector('.ab-track__duration');
    const beforeBtn = track.querySelector('.ab-toggle--before');
    const afterBtn = track.querySelector('.ab-toggle--after');
    let mode = 'after';

    // Preload both audio files
    const beforeAudio = new Audio(track.dataset.before);
    const afterAudio = new Audio(track.dataset.after);
    beforeAudio.preload = 'auto';
    afterAudio.preload = 'auto';

    let audio = afterAudio;

    function onEnded() {
      playBtn.classList.remove('playing');
      if (progressBar) progressBar.style.width = '0%';
      if (timeEl) timeEl.textContent = '0:00';
      currentAudio = null;
    }

    beforeAudio.addEventListener('ended', onEnded);
    afterAudio.addEventListener('ended', onEnded);

    beforeAudio.addEventListener('loadedmetadata', () => {
      if (mode === 'before' && durationEl) durationEl.textContent = formatTime(beforeAudio.duration);
    });
    afterAudio.addEventListener('loadedmetadata', () => {
      if (mode === 'after' && durationEl) durationEl.textContent = formatTime(afterAudio.duration);
    });

    playBtn.addEventListener('click', () => {
      if (currentAudio === audio && audio && !audio.paused) {
        audio.pause();
        playBtn.classList.remove('playing');
        cancelAnimationFrame(animFrame);
        return;
      }

      stopCurrent();

      audio.play();
      playBtn.classList.add('playing');
      currentAudio = audio;
      currentPlayBtn = playBtn;
      currentProgressBar = progressBar;
      currentTimeEl = timeEl;
      updateProgress();
    });

    // Seeking
    if (progressWrap) {
      const seek = (e) => {
        if (!audio || !audio.duration) return;
        const rect = progressWrap.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX);
        const pct = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
        audio.currentTime = pct * audio.duration;
      };

      progressWrap.addEventListener('click', seek);

      let dragging = false;
      progressWrap.addEventListener('touchstart', (e) => { dragging = true; seek(e); }, { passive: true });
      document.addEventListener('touchmove', (e) => { if (dragging) seek(e); }, { passive: true });
      document.addEventListener('touchend', () => { dragging = false; });
    }

    // A/B Toggle
    function switchMode(newMode) {
      if (mode === newMode) return;
      mode = newMode;
      beforeBtn.classList.toggle('ab-toggle--active', mode === 'before');
      afterBtn.classList.toggle('ab-toggle--active', mode === 'after');

      const time = audio.currentTime;
      const wasPlaying = !audio.paused;
      audio.pause();

      audio = mode === 'before' ? beforeAudio : afterAudio;
      audio.currentTime = time;
      if (durationEl) durationEl.textContent = formatTime(audio.duration);

      if (wasPlaying) {
        audio.play();
        currentAudio = audio;
        currentPlayBtn = playBtn;
        currentProgressBar = progressBar;
        currentTimeEl = timeEl;
        updateProgress();
      }
    }

    beforeBtn.addEventListener('click', () => switchMode('before'));
    afterBtn.addEventListener('click', () => switchMode('after'));
  });


  /* ---- Showcase Tracklist Player ---- */
  const showcaseTracks = document.querySelectorAll('.showcase-track');

  showcaseTracks.forEach(track => {
    const playBtn = track.querySelector('.showcase-track__play');
    const progressWrap = track.querySelector('.showcase-track__progress');
    const progressBar = track.querySelector('.showcase-track__bar');
    const timeEl = track.querySelector('.showcase-track__time');
    const durationEl = track.querySelector('.showcase-track__duration');
    let audio = null;

    function makeAudio() {
      const a = new Audio(track.dataset.src);
      a.addEventListener('loadedmetadata', () => {
        if (durationEl) durationEl.textContent = formatTime(a.duration);
      });
      a.addEventListener('ended', () => {
        playBtn.classList.remove('playing');
        if (progressBar) progressBar.style.width = '0%';
        if (timeEl) timeEl.textContent = '0:00';
        currentAudio = null;
      });
      return a;
    }

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      if (currentAudio === audio && audio && !audio.paused) {
        audio.pause();
        playBtn.classList.remove('playing');
        cancelAnimationFrame(animFrame);
        return;
      }

      stopCurrent();

      if (!audio) audio = makeAudio();

      audio.play();
      playBtn.classList.add('playing');
      currentAudio = audio;
      currentPlayBtn = playBtn;
      currentProgressBar = progressBar;
      currentTimeEl = timeEl;
      updateProgress();
    });

    // Seeking
    if (progressWrap) {
      const seek = (e) => {
        if (!audio || !audio.duration) return;
        const rect = progressWrap.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX);
        const pct = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
        audio.currentTime = pct * audio.duration;
      };

      progressWrap.addEventListener('click', seek);

      let dragging = false;
      progressWrap.addEventListener('touchstart', (e) => { dragging = true; seek(e); }, { passive: true });
      document.addEventListener('touchmove', (e) => { if (dragging) seek(e); }, { passive: true });
      document.addEventListener('touchend', () => { dragging = false; });
    }

    // Click whole row to play
    track.addEventListener('click', () => playBtn.click());
  });


  /* ---- Contact Tabs ---- */
  const tabBtns = document.querySelectorAll('.contact-tab');
  const tabPanels = document.querySelectorAll('.contact-form-panel');

  if (tabBtns.length) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.querySelector(`[data-panel="${btn.dataset.tab}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  }


  /* ---- Subgenre Filters + Show More ---- */
  const filterBtns = document.querySelectorAll('.subgenre-filter');
  const baTracks = document.querySelectorAll('.ab-track[data-subgenre]');
  const showcaseTracks2 = document.querySelectorAll('.showcase-track[data-subgenre]');
  const baMoreBtn = document.querySelector('.show-more-btn[data-section="ba"]');
  const showcaseMoreBtn = document.querySelector('.show-more-btn[data-section="showcase"]');

  const BA_LIMIT = 1;
  const SHOWCASE_LIMIT = 3;

  // Reorder tracks so the featured track for the active tab moves to the top
  function reorderFeatured(filter) {
    const featuredKey = filter === 'all' ? 'all' : filter;

    // B/A tracks
    const baContainer = baTracks[0]?.parentElement;
    if (baContainer) {
      const baHeading = baContainer.querySelector('.work-heading');
      const featured = baContainer.querySelectorAll(`.ab-track[data-featured="${featuredKey}"]`);
      if (featured.length && baHeading) {
        [...featured].reverse().forEach(el => baHeading.after(el));
      }
    }

    // Showcase tracks
    const scContainer = showcaseTracks2[0]?.parentElement;
    if (scContainer) {
      const scHeadingRow = scContainer.querySelector('.work-heading-row');
      const featured = scContainer.querySelectorAll(`.showcase-track[data-featured="${featuredKey}"]`);
      if (featured.length && scHeadingRow) {
        [...featured].reverse().forEach(el => scHeadingRow.after(el));
      }
    }
  }

  function applyTruncation() {
    // Re-query in current DOM order (static NodeLists don't reflect reordering)
    const baOrdered = document.querySelectorAll('.ab-track[data-subgenre]');
    const scOrdered = document.querySelectorAll('.showcase-track[data-subgenre]');

    // B/A: hide tracks after limit
    let visibleBa = 0;
    baOrdered.forEach(track => {
      if (!track.classList.contains('track-hidden')) {
        visibleBa++;
        if (visibleBa > BA_LIMIT) {
          track.classList.add('track-truncated');
        }
      }
    });
    if (baMoreBtn) {
      const totalVisible = [...baOrdered].filter(t => !t.classList.contains('track-hidden')).length;
      baMoreBtn.style.display = totalVisible > BA_LIMIT ? '' : 'none';
      baMoreBtn.textContent = 'Show More (' + (totalVisible - BA_LIMIT) + ')';
    }

    // Showcase: hide tracks after limit
    let visibleShowcase = 0;
    scOrdered.forEach(track => {
      if (!track.classList.contains('track-hidden')) {
        visibleShowcase++;
        if (visibleShowcase > SHOWCASE_LIMIT) {
          track.classList.add('track-truncated');
        }
      }
    });
    if (showcaseMoreBtn) {
      const totalVisible = [...scOrdered].filter(t => !t.classList.contains('track-hidden')).length;
      showcaseMoreBtn.style.display = totalVisible > SHOWCASE_LIMIT ? '' : 'none';
      showcaseMoreBtn.textContent = 'Show More (' + (totalVisible - SHOWCASE_LIMIT) + ')';
    }
  }

  function clearTruncation() {
    document.querySelectorAll('.ab-track[data-subgenre]').forEach(t => t.classList.remove('track-truncated'));
    document.querySelectorAll('.showcase-track[data-subgenre]').forEach(t => t.classList.remove('track-truncated'));
    if (baMoreBtn) baMoreBtn.style.display = 'none';
    if (showcaseMoreBtn) showcaseMoreBtn.style.display = 'none';
  }

  // Show more button clicks
  if (baMoreBtn) {
    baMoreBtn.addEventListener('click', () => {
      document.querySelectorAll('.ab-track[data-subgenre]').forEach(t => t.classList.remove('track-truncated'));
      baMoreBtn.style.display = 'none';
    });
  }
  if (showcaseMoreBtn) {
    showcaseMoreBtn.addEventListener('click', () => {
      document.querySelectorAll('.showcase-track[data-subgenre]').forEach(t => t.classList.remove('track-truncated'));
      showcaseMoreBtn.style.display = 'none';
    });
  }

  // Apply featured ordering and truncation on load (All is default)
  reorderFeatured('all');
  applyTruncation();

  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        const isAll = filter === 'all';

        // Clear truncation and reorder featured
        clearTruncation();
        reorderFeatured(filter);

        // Apply filter
        const isLive = filter === 'Live';
        baTracks.forEach(track => {
          const show = isAll || (isLive ? track.dataset.live === 'true' : track.dataset.subgenre === filter);
          track.classList.toggle('track-hidden', !show);
        });
        showcaseTracks2.forEach(track => {
          const show = isAll || (isLive ? track.dataset.live === 'true' : track.dataset.subgenre === filter);
          track.classList.toggle('track-hidden', !show);
        });

        // Re-apply truncation for all filters
        applyTruncation();

        // Stop audio if its track is now hidden
        if (currentAudio) {
          const activeTrack = currentPlayBtn?.closest('[data-subgenre]');
          if (activeTrack?.classList.contains('track-hidden') || activeTrack?.classList.contains('track-truncated')) {
            stopCurrent();
          }
        }
      });
    });
  }


  /* ---- Contact Forms ---- */
  const forms = document.querySelectorAll('.cta form');

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.form__submit');
      const originalText = btn.textContent;

      btn.textContent = 'Sending...';
      btn.disabled = true;

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          btn.textContent = 'Sent!';
          btn.classList.add('form__submit--sent');
          form.reset();
          setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('form__submit--sent');
            btn.disabled = false;
          }, 3000);
        } else {
          throw new Error('Submit failed');
        }
      } catch (err) {
        btn.textContent = 'Error - try again';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = originalText; }, 3000);
      }
    });
  });


  /* ---- Parallax Section Photos ---- */
  const parallaxPhotos = document.querySelectorAll('.section-photo img, .footer-photo img');

  if (parallaxPhotos.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;

    function updateParallax() {
      const winH = window.innerHeight;

      parallaxPhotos.forEach(img => {
        const container = img.parentElement;
        const rect = container.getBoundingClientRect();

        if (rect.bottom < 0 || rect.top > winH) return;

        const progress = (winH - rect.top) / (winH + rect.height);
        const shift = -progress * 40;
        img.style.transform = `translateY(${shift}%)`;
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    updateParallax();
  }


  /* ---- Keyboard Controls ---- */
  document.addEventListener('keydown', (e) => {
    if (!currentAudio) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (currentAudio.paused) {
        currentAudio.play();
        if (currentPlayBtn) currentPlayBtn.classList.add('playing');
        updateProgress();
      } else {
        currentAudio.pause();
        if (currentPlayBtn) currentPlayBtn.classList.remove('playing');
        cancelAnimationFrame(animFrame);
      }
    }

    if (e.code === 'ArrowRight') {
      e.preventDefault();
      currentAudio.currentTime = Math.min(currentAudio.duration, currentAudio.currentTime + 5);
    }

    if (e.code === 'ArrowLeft') {
      e.preventDefault();
      currentAudio.currentTime = Math.max(0, currentAudio.currentTime - 5);
    }
  });

});
