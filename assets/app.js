/* 3 Peaks Roofing — shared behavior: scroll reveals, hero parallax, stat counters.
   All motion respects prefers-reduced-motion. */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  if(reduce){ reveals.forEach(function(el){el.classList.add('in');}); }
  else if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
    reveals.forEach(function(el){ io.observe(el); });
  } else { reveals.forEach(function(el){el.classList.add('in');}); }

  var hero = document.getElementById('heroImg');
  if(hero && !reduce){
    var ticking=false;
    window.addEventListener('scroll', function(){
      if(ticking) return; ticking=true;
      requestAnimationFrame(function(){
        var y = Math.min(window.scrollY, 700);
        hero.style.transform = 'translateY(' + (y*0.18) + 'px)';
        ticking=false;
      });
    }, {passive:true});
  }

  var nums = [].slice.call(document.querySelectorAll('.n[data-count]'));
  function animate(el){
    var raw = el.getAttribute('data-count');
    var target = parseFloat(raw);
    var suffix = el.getAttribute('data-suffix') || '';
    var isFloat = raw.indexOf('.') > -1;
    if(reduce){ el.textContent = (isFloat? target.toFixed(1): target) + suffix; return; }
    var start=null, dur=1100;
    function tick(ts){ if(!start) start=ts; var p=Math.min((ts-start)/dur,1);
      var e = 1-Math.pow(1-p,3); var v = target*e;
      el.textContent = (isFloat? v.toFixed(1): Math.round(v)) + suffix;
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if('IntersectionObserver' in window){
    var io2 = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ animate(e.target); io2.unobserve(e.target); } }); }, {threshold:.5});
    nums.forEach(function(el){ io2.observe(el); });
  } else { nums.forEach(animate); }

  /* lead form: honest submitting -> success/error states, posts to TWB lead endpoint */
  var form = document.getElementById('leadForm');
  if(form){
    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      var status = form.querySelector('.form-status');
      var btn = form.querySelector('button[type=submit]');
      var data = {};
      new FormData(form).forEach(function(v,k){ data[k]=v; });
      btn.disabled = true; var label = btn.textContent; btn.textContent = 'Sending…';
      if(status){ status.textContent=''; status.style.color=''; }
      var endpoint = form.getAttribute('data-endpoint');
      fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)})
        .then(function(r){ if(!r.ok) throw new Error('bad'); return r.json().catch(function(){return {};}); })
        .then(function(){ form.reset(); btn.textContent=label; btn.disabled=false;
          if(status){ status.style.color='var(--blue)'; status.textContent='Thanks. We got your message and will call you shortly.'; } })
        .catch(function(){ btn.textContent=label; btn.disabled=false;
          if(status){ status.style.color='var(--orange2)'; status.textContent='Something went wrong. Please call us at (616) 902-8560 and we will take care of you.'; } });
    });
  }
})();
