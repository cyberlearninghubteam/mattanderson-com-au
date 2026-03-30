// ===== Typing Animation =====
(function () {
    const phrases = [
        'help organisations understand their cyber risk.',
        'train teams to spot phishing before it hits.',
        'make compliance simple for Australian SMBs.',
        'build tools that replace expensive consultants.',
        'help businesses protect customer identity.',
        'make security training people actually complete.',
    ];
    const el = document.getElementById('typed-text');
    if (!el) return;

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let pauseEnd = 0;

    function tick() {
        const now = Date.now();
        if (now < pauseEnd) {
            requestAnimationFrame(tick);
            return;
        }

        const phrase = phrases[phraseIndex];

        if (!deleting) {
            charIndex++;
            el.textContent = phrase.substring(0, charIndex);
            if (charIndex === phrase.length) {
                deleting = true;
                pauseEnd = now + 2200;
            }
        } else {
            charIndex--;
            el.textContent = phrase.substring(0, charIndex);
            if (charIndex === 0) {
                deleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                pauseEnd = now + 400;
            }
        }

        const speed = deleting ? 30 : 50;
        setTimeout(() => requestAnimationFrame(tick), speed);
    }

    setTimeout(() => requestAnimationFrame(tick), 800);
})();

// ===== Animated Grid Background =====
(function () {
    const canvas = document.getElementById('grid-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, cols, rows;
    const cellSize = 60;
    let mouse = { x: -1000, y: -1000 };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        cols = Math.ceil(width / cellSize) + 1;
        rows = Math.ceil(height / cellSize) + 1;
    }

    function lerpColor(t) {
        // t: 0 = red, 0.5 = purple, 1 = blue
        t = Math.max(0, Math.min(1, t));
        const r = Math.round(255 * (1 - t) + 0 * t);
        const g = Math.round(0 * (1 - t) + 212 * t);
        const b = Math.round(0 * (1 - t) + 255 * t);
        return [r, g, b];
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        const time = Date.now() * 0.001;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = i * cellSize;
                const y = j * cellSize;
                const dx = mouse.x - x;
                const dy = mouse.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 250;
                const proximity = Math.max(0, 1 - dist / maxDist);

                const wave = Math.sin(time * 0.5 + i * 0.4 + j * 0.4) * 0.3 + 0.3;
                const alpha = 0.02 + wave * 0.015 + proximity * 0.15;

                // Color shifts red→purple→blue based on diagonal position + time
                const diagT = (i / cols + j / rows) * 0.5;
                const colorShift = Math.sin(time * 0.3 + diagT * Math.PI * 2) * 0.5 + 0.5;
                const [r, g, b] = lerpColor(colorShift);

                ctx.beginPath();
                ctx.arc(x, y, 1 + proximity * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.fill();

                if (proximity > 0.25) {
                    const lineAlpha = proximity * 0.06;
                    if (i < cols - 1) {
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(x + cellSize, y);
                        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                    if (j < rows - 1) {
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(x, y + cellSize);
                        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

    resize();
    draw();
})();

// ===== Navbar scroll =====
(function () {
    const nav = document.getElementById('nav');
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => { nav.classList.toggle('scrolled', window.scrollY > 50); ticking = false; });
            ticking = true;
        }
    });
})();

// ===== Mobile menu =====
(function () {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        menu.classList.toggle('active');
        const spans = toggle.querySelectorAll('span');
        if (menu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
            const spans = toggle.querySelectorAll('span');
            spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
        });
    });
})();

// ===== Scroll animations =====
(function () {
    const elements = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => entry.target.classList.add('visible'), index * 120);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    elements.forEach((el) => observer.observe(el));
})();

// ===== Smooth scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ===== Plausible section visibility tracking =====
(function () {
    if (typeof window.plausible !== 'function') return;
    const sections = { about: false, projects: false, contact: false };
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const id = entry.target.id;
                if (entry.isIntersecting && !sections[id]) {
                    sections[id] = true;
                    window.plausible('Section View', { props: { section: id } });
                }
            });
        },
        { threshold: 0.3 }
    );
    Object.keys(sections).forEach((id) => {
        const el = document.getElementById(id);
        if (el) sectionObserver.observe(el);
    });
})();
