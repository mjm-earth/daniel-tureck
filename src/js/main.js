/* =============================================
   Daniel Tureck — Site JS
   Sticky nav, scroll animations, audio players
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Sticky Nav ----
  const fixedNav = document.getElementById('fixedNav');
  const hero = document.querySelector('.hero');

  const navObserver = new IntersectionObserver(([entry]) => {
    fixedNav.classList.toggle('fixed-nav--visible', !entry.isIntersecting);
  }, { threshold: 0.1 });

  navObserver.observe(hero);

  // ---- Fade-in on Scroll ----
  const fadeEls = document.querySelectorAll('.fade-in');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in--visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  fadeEls.forEach(el => fadeObserver.observe(el));

  // ---- Audio Engine ----
  // Shared audio element — only one thing plays at a time
  let currentAudio = null;
  let currentPlayBtn = null;
  let currentProgressBar = null;
  let animFrame = null;

  function stopCurrent() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      cancelAnimationFrame(animFrame);
      if (currentPlayBtn) currentPlayBtn.classList.remove('ab-track__play--playing', 'tracklist__play--playing');
      if (currentProgressBar) currentProgressBar.style.width = '0%';
      currentAudio = null;
      currentPlayBtn = null;
      currentProgressBar = null;
    }
  }

  function updateProgress() {
    if (currentAudio && currentProgressBar) {
      const pct = (currentAudio.currentTime / currentAudio.duration) * 100;
      currentProgressBar.style.width = pct + '%';
      if (!currentAudio.paused) {
        animFrame = requestAnimationFrame(updateProgress);
      }
    }
  }

  // ---- A/B Player ----
  const abTracks = document.querySelectorAll('.ab-track');

  abTracks.forEach(track => {
    const playBtn = track.querySelector('.ab-track__play');
    const progressWrap = track.querySelector('.ab-track__progress');
    const progressBar = track.querySelector('.ab-track__progress-bar');
    const beforeBtn = track.querySelector('.ab-toggle--before');
    const afterBtn = track.querySelector('.ab-toggle--after');
    let mode = 'before';
    let audio = null;

    function getSrc() {
      return mode === 'before' ? track.dataset.before : track.dataset.after;
    }

    function initAudio() {
      audio = new Audio(getSrc());
      audio.addEventListener('ended', () => {
        playBtn.classList.remove('ab-track__play--playing');
        progressBar.style.width = '0%';
        currentAudio = null;
      });
      return audio;
    }

    playBtn.addEventListener('click', () => {
      // If this track is currently playing, pause it
      if (currentAudio === audio && audio && !audio.paused) {
        audio.pause();
        playBtn.classList.remove('ab-track__play--playing');
        cancelAnimationFrame(animFrame);
        return;
      }

      // Stop whatever else is playing
      stopCurrent();

      // Init if needed or if source changed
      if (!audio || audio.src !== new URL(getSrc(), window.location.href).href) {
        if (audio) audio.pause();
        audio = initAudio();
      }

      audio.play();
      playBtn.classList.add('ab-track__play--playing');
      currentAudio = audio;
      currentPlayBtn = playBtn;
      currentProgressBar = progressBar;
      updateProgress();
    });

    // Progress bar seeking
    progressWrap.addEventListener('click', (e) => {
      if (audio && audio.duration) {
        const rect = progressWrap.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
      }
    });

    // A/B Toggle
    beforeBtn.addEventListener('click', () => {
      if (mode === 'before') return;
      mode = 'before';
      beforeBtn.classList.add('ab-toggle--active');
      afterBtn.classList.remove('ab-toggle--active');
      if (audio && !audio.paused) {
        const time = audio.currentTime;
        audio.pause();
        audio = initAudio();
        audio.currentTime = Math.min(time, audio.duration || time);
        audio.play();
        currentAudio = audio;
      } else if (audio) {
        const time = audio.currentTime;
        audio = initAudio();
        audio.currentTime = Math.min(time, audio.duration || time);
      }
    });

    afterBtn.addEventListener('click', () => {
      if (mode === 'after') return;
      mode = 'after';
      afterBtn.classList.add('ab-toggle--active');
      beforeBtn.classList.remove('ab-toggle--active');
      if (audio && !audio.paused) {
        const time = audio.currentTime;
        audio.pause();
        audio = initAudio();
        audio.currentTime = Math.min(time, audio.duration || time);
        audio.play();
        currentAudio = audio;
      } else if (audio) {
        const time = audio.currentTime;
        audio = initAudio();
        audio.currentTime = Math.min(time, audio.duration || time);
      }
    });
  });

  // ---- Standard Tracklist Player ----
  const tracklistTracks = document.querySelectorAll('.tracklist__track');

  tracklistTracks.forEach(track => {
    const playBtn = track.querySelector('.tracklist__play');
    let audio = null;

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      if (currentAudio === audio && audio && !audio.paused) {
        audio.pause();
        playBtn.classList.remove('tracklist__play--playing');
        cancelAnimationFrame(animFrame);
        return;
      }

      stopCurrent();

      if (!audio) {
        audio = new Audio(track.dataset.src);
        audio.addEventListener('ended', () => {
          playBtn.classList.remove('tracklist__play--playing');
          currentAudio = null;
        });
      }

      audio.play();
      playBtn.classList.add('tracklist__play--playing');
      currentAudio = audio;
      currentPlayBtn = playBtn;
    });

    // Clicking the whole row also triggers play
    track.addEventListener('click', () => {
      playBtn.click();
    });
  });

  // ---- Contact Form (placeholder) ----
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.contact__submit');
      btn.textContent = 'Sent!';
      btn.style.background = 'var(--accent)';
      setTimeout(() => {
        btn.textContent = 'Send Inquiry';
        btn.style.background = '';
        form.reset();
      }, 2000);
    });
  }

});
