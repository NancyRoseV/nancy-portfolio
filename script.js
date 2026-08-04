(function() {
'use strict';

// ===== CUSTOM CURSOR =====
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
const isTouch = window.matchMedia('(pointer: coarse)').matches;

if (!isTouch && cursorDot && cursorOutline) {
    let mx = 0, my = 0, ox = 0, oy = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursorDot.style.left = mx + 'px'; cursorDot.style.top = my + 'px'; });
    function animC() { ox += (mx - ox) * 0.15; oy += (my - oy) * 0.15; cursorOutline.style.left = ox + 'px'; cursorOutline.style.top = oy + 'px'; requestAnimationFrame(animC); }
    animC();
    document.querySelectorAll('[data-cursor="hover"]').forEach(el => {
        el.addEventListener('mouseenter', () => cursorOutline.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover'));
    });
}

// ===== NAVIGATION =====
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.pageYOffset > 50);
}, { passive: true });

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('mobile-open');
        document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => { navToggle.classList.remove('active'); navLinks.classList.remove('mobile-open'); document.body.style.overflow = ''; });
    });
}

// ===== HERO CANVAS PARTICLES =====
const canvas = document.getElementById('heroCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [], animId, visible = true;
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(); }
        reset() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.s = Math.random() * 2 + 0.5; this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5; this.o = Math.random() * 0.5 + 0.1; this.c = Math.random() > 0.7 ? '255,107,107' : '160,160,176'; }
        update() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset(); }
        draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2); ctx.fillStyle = `rgba(${this.c},${this.o})`; ctx.fill(); }
    }

    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < count; i++) particles.push(new Particle());

    let mouse = { x: null, y: null };
    document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    function drawConn() {
        for (let i = 0; i < particles.length; i++) {
            let conn = 0;
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y, d = Math.sqrt(dx*dx + dy*dy);
                if (d < 120 && conn < 3) { ctx.beginPath(); ctx.strokeStyle = `rgba(255,107,107,${(1-d/120)*0.15})`; ctx.lineWidth = 0.5; ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); conn++; }
            }
            if (mouse.x && mouse.y) { const dx = particles[i].x - mouse.x, dy = particles[i].y - mouse.y, d = Math.sqrt(dx*dx + dy*dy); if (d < 200) { ctx.beginPath(); ctx.strokeStyle = `rgba(255,107,107,${(1-d/200)*0.2})`; ctx.lineWidth = 0.5; ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); } }
        }
    }

    function anim() {
        if (!visible) { animId = requestAnimationFrame(anim); return; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConn(); animId = requestAnimationFrame(anim);
    }
    new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { threshold: 0 }).observe(document.querySelector('.hero'));
    anim();
}

// ===== SCROLL ANIMATIONS =====
const animEls = document.querySelectorAll('[data-animate]');
const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('animated'); obs.unobserve(entry.target); } });
}, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });
animEls.forEach(el => obs.observe(el));

// Trigger hero immediately
setTimeout(() => {
    document.querySelectorAll('.hero [data-animate]').forEach(el => {
        setTimeout(() => el.classList.add('animated'), parseInt(el.dataset.delay || 0));
    });
}, 100);

// ===== ANIMATED COUNTERS =====
document.querySelectorAll('[data-count]').forEach(counter => {
    new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.count), dur = 2000, start = performance.now();
                function upd(t) { const p = Math.min((t - start) / dur, 1); entry.target.textContent = Math.floor((1 - Math.pow(1 - p, 4)) * target); if (p < 1) requestAnimationFrame(upd); else entry.target.textContent = target; }
                requestAnimationFrame(upd);
            }
        });
    }, { threshold: 0.5 }).observe(counter);
});

// ===== SKILL BARS =====
document.querySelectorAll('.skill-fill').forEach(fill => {
    new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { setTimeout(() => { e.target.style.width = e.target.dataset.width + '%'; }, 200); } });
    }, { threshold: 0.3 }).observe(fill);
});

// ===== PROCESS TIMELINE =====
const pLine = document.getElementById('processLine');
const pSec = document.getElementById('process');
if (pLine && pSec) {
    function updPL() { const r = pSec.getBoundingClientRect(), wh = window.innerHeight; if (r.top < wh && r.bottom > 0) { const prog = Math.min(Math.max((wh - r.top) / (wh + r.height * 0.5), 0), 1); pLine.style.setProperty('--progress', (prog * 100) + '%'); } }
    window.addEventListener('scroll', updPL, { passive: true }); updPL();
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) { e.preventDefault(); const t = document.querySelector(this.getAttribute('href')); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' }); });
});

// ===== CONTACT FORM =====
const cForm = document.getElementById('contactForm');
if (cForm) {
    cForm.addEventListener('submit', function(e) {
        e.preventDefault(); const btn = this.querySelector('button[type="submit"]'), orig = btn.innerHTML;
        btn.innerHTML = '<span>Sending...</span>'; btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = '<span>Message Sent!</span>';
            btn.style.background = '#43e97b';
            setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; btn.style.background = ''; cForm.reset(); }, 2500);
        }, 1500);
    });
}

// ===== TEXT SCRAMBLE =====
class TextScramble {
    constructor(el) { this.el = el; this.chars = '!<>-_\\/[]{}—=+*^?#________'; this.update = this.update.bind(this); }
    setText(newText) {
        const oldText = this.el.innerText, len = Math.max(oldText.length, newText.length);
        const promise = new Promise(r => this.resolve = r);
        this.queue = []; for (let i = 0; i < len; i++) { const from = oldText[i] || '', to = newText[i] || '', st = Math.floor(Math.random() * 20), en = st + Math.floor(Math.random() * 20); this.queue.push({ from, to, start: st, end: en }); }
        cancelAnimationFrame(this.frameRequest); this.frame = 0; this.update(); return promise;
    }
    update() {
        let output = '', complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) { complete++; output += to; }
            else if (this.frame >= start) { if (!char || Math.random() < 0.28) { char = this.chars[Math.floor(Math.random() * this.chars.length)]; this.queue[i].char = char; } output += `<span style="color:var(--accent)">${char}</span>`; }
            else output += from;
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) this.resolve();
        else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; }
    }
}

const accentLine = document.querySelector('.hero-title .accent');
if (accentLine) { const orig = accentLine.textContent; const fx = new TextScramble(accentLine); setTimeout(() => fx.setText(orig), 800); }

// ===== BOOKING WIDGET DEMO =====
(function() {
    const dest = document.getElementById('wbDest');
    const searchBtn = document.getElementById('wbSearch');
    const results = document.getElementById('wbResults');
    const minus = document.getElementById('wbMinus');
    const plus = document.getElementById('wbPlus');
    const count = document.getElementById('wbCount');
    let guests = 2;

    if (minus) minus.addEventListener('click', () => { if (guests > 1) { guests--; count.textContent = guests; } });
    if (plus) plus.addEventListener('click', () => { if (guests < 10) { guests++; count.textContent = guests; } });

    const hotels = {
        cpt: [
            { name: 'Waterfront Boutique Hotel', loc: 'V&A Waterfront', price: 'R2,450', img: 'linear-gradient(135deg,#667eea,#764ba2)', tag: 'AI Recommended' },
            { name: 'Clifton Beach Villa', loc: 'Clifton', price: 'R4,200', img: 'linear-gradient(135deg,#f093fb,#f5576c)', tag: 'Luxury' }
        ],
        jhb: [
            { name: 'Sandton Sky Hotel', loc: 'Sandton', price: 'R1,850', img: 'linear-gradient(135deg,#4facfe,#00f2fe)', tag: 'Business' },
            { name: 'Rosebank Loft', loc: 'Rosebank', price: 'R1,200', img: 'linear-gradient(135deg,#43e97b,#38f9d7)', tag: 'Trendy' }
        ],
        dbn: [
            { name: 'Umhlanga Pearl', loc: 'Umhlanga', price: 'R2,100', img: 'linear-gradient(135deg,#fa709a,#fee140)', tag: 'Beachfront' },
            { name: 'Durban Harbour Inn', loc: 'Durban CBD', price: 'R950', img: 'linear-gradient(135deg,#a8edea,#fed6e3)', tag: 'Budget' }
        ],
        kruger: [
            { name: 'Royal Malewane Lodge', loc: 'Thornybush', price: 'R8,500', img: 'linear-gradient(135deg,#667eea,#764ba2)', tag: 'Safari' },
            { name: 'Kruger Bush Camp', loc: 'Skukuza', price: 'R3,200', img: 'linear-gradient(135deg,#f093fb,#f5576c)', tag: 'Adventure' }
        ]
    };

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            results.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:14px;">Searching...</p>';
            setTimeout(() => {
                const selected = hotels[dest.value] || hotels.cpt;
                results.innerHTML = selected.map(h => `
                    <div class="wb-result-item">
                        <div class="wb-result-img" style="background:${h.img};"></div>
                        <div class="wb-result-info">
                            <h6>${h.name}</h6>
                            <p>${h.loc}</p>
                        </div>
                        <span class="wb-result-price">${h.price}</span>
                    </div>
                `).join('');
            }, 600);
        });
    }
})();

// ===== KANBAN DRAG & DROP DEMO =====
(function() {
    let dragged = null;
    document.querySelectorAll('.kb-task').forEach(task => {
        task.addEventListener('dragstart', function(e) { dragged = this; this.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
        task.addEventListener('dragend', function() { this.classList.remove('dragging'); dragged = null; document.querySelectorAll('.kb-tasks').forEach(t => t.classList.remove('drag-over')); });
    });
    document.querySelectorAll('.kb-tasks').forEach(col => {
        col.addEventListener('dragover', function(e) { e.preventDefault(); this.classList.add('drag-over'); });
        col.addEventListener('dragleave', function() { this.classList.remove('drag-over'); });
        col.addEventListener('drop', function(e) { e.preventDefault(); this.classList.remove('drag-over'); if (dragged) { this.appendChild(dragged); updateCounts(); } });
    });
    function updateCounts() {
        document.querySelectorAll('.kb-column').forEach(col => {
            const c = col.querySelectorAll('.kb-task').length;
            col.querySelector('.kb-count').textContent = c;
        });
    }
})();

// ===== THEME ENGINE DEMO =====
(function() {
    const swatches = document.querySelectorAll('.theme-swatch');
    const radius = document.getElementById('themeRadius');
    const scale = document.getElementById('themeScale');
    const rVal = document.getElementById('radiusValue');
    const sVal = document.getElementById('scaleValue');
    const preview = document.getElementById('themePreview');
    const tpCard = preview.querySelector('.tp-card');
    const tpBtn = preview.querySelector('.tp-btn');

    swatches.forEach(s => {
        s.addEventListener('click', () => {
            swatches.forEach(x => x.classList.remove('active'));
            s.classList.add('active');
            const color = s.dataset.color;
            document.documentElement.style.setProperty('--accent', color);
            const r = parseInt(color.slice(1,3), 16), g = parseInt(color.slice(3,5), 16), b = parseInt(color.slice(5,7), 16);
            document.documentElement.style.setProperty('--accent-light', `rgb(${Math.min(255,r+40)},${Math.min(255,g+40)},${Math.min(255,b+40)})`);
            document.documentElement.style.setProperty('--accent-dark', `rgb(${Math.max(0,r-30)},${Math.max(0,g-30)},${Math.max(0,b-30)})`);
            document.documentElement.style.setProperty('--accent-glow', `rgba(${r},${g},${b},0.15)`);
        });
    });

    if (radius) {
        radius.addEventListener('input', () => {
            const v = radius.value + 'px';
            rVal.textContent = v;
            tpCard.style.borderRadius = v;
            tpBtn.style.borderRadius = v;
        });
    }

    if (scale) {
        scale.addEventListener('input', () => {
            const v = scale.value + '%';
            sVal.textContent = v;
            preview.style.fontSize = (parseInt(scale.value) / 100 * 16) + 'px';
        });
    }
})();

// ===== MAGNETIC BUTTONS =====
if (!isTouch) {
    document.querySelectorAll('.btn, .work-card, .demo-card').forEach(btn => {
        btn.addEventListener('mousemove', (e) => { const r = btn.getBoundingClientRect(); btn.style.transform = `translate(${(e.clientX - r.left - r.width/2)*0.1}px,${(e.clientY - r.top - r.height/2)*0.1}px)`; });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
}

// ===== PARALLAX WORK CARDS =====
if (!isTouch) {
    document.querySelectorAll('.case-study-browser').forEach(card => {
        card.addEventListener('mousemove', (e) => { const r = card.getBoundingClientRect(); const x = (e.clientX - r.left)/r.width - 0.5, y = (e.clientY - r.top)/r.height - 0.5; card.style.transform = `translateY(-4px) perspective(1000px) rotateY(${x*5}deg) rotateX(${-y*5}deg)`; });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
}

// ===== LOADED STATE =====
window.addEventListener('load', () => document.body.classList.add('loaded'));

})();
