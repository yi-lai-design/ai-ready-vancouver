/* AI Ready Vancouver — shared D3 charts, drawn from the real 50-business audit.
   Usage: include d3.min.js, this file, then call AIReadyCharts.renderAll()
   on any page with elements carrying data-chart="industry" or data-chart="checks". */
(function () {
  var TOKENS = {
    navy: '#001c2e',
    slate: '#446278',
    slateSoft: '#6b8499',
    line: 'rgba(0, 28, 46, 0.09)',
    card: '#ffffff',
    good: '#1a9d5c',
    warn: '#d98c1f',
    critical: '#e0483a'
  };

  function tierColor(pct) {
    if (pct >= 90) return TOKENS.good;
    if (pct >= 50) return TOKENS.warn;
    return TOKENS.critical;
  }

  function ensureTooltip() {
    var tip = document.querySelector('.chart-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'chart-tooltip';
      tip.setAttribute('role', 'status');
      document.body.appendChild(tip);
    }
    return tip;
  }

  function showTooltip(evt, html) {
    var tip = ensureTooltip();
    tip.innerHTML = html;
    tip.style.opacity = '1';
    positionTooltip(evt);
  }
  function positionTooltip(evt) {
    var tip = document.querySelector('.chart-tooltip');
    if (!tip) return;
    var pad = 14;
    tip.style.left = (evt.clientX + pad) + 'px';
    tip.style.top = (evt.clientY + pad) + 'px';
  }
  function hideTooltip() {
    var tip = document.querySelector('.chart-tooltip');
    if (tip) tip.style.opacity = '0';
  }

  function renderIndustryChart(container, data) {
    var rows = data.industries.slice().sort(function (a, b) {
      return (a.contactPass / a.total) - (b.contactPass / b.total);
    });

    var margin = { top: 8, right: 52, bottom: 8, left: 152 };
    var barThickness = 22;
    var gap = 14;
    var width = Math.max(container.clientWidth, 460);
    var innerWidth = width - margin.left - margin.right;
    var height = rows.length * (barThickness + gap) - gap;

    var svg = d3.select(container).append('svg')
      .attr('width', width)
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', '0 0 ' + width + ' ' + (height + margin.top + margin.bottom))
      .attr('role', 'img')
      .attr('aria-label', 'Machine-findable contact info pass rate by Vancouver industry, out of the real 50-business audit');

    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);

    // recessive gridline at 50% and 100%
    [50, 100].forEach(function (t) {
      g.append('line')
        .attr('x1', x(t)).attr('x2', x(t))
        .attr('y1', -2).attr('y2', height + 2)
        .attr('stroke', TOKENS.line).attr('stroke-width', 1);
    });

    var rowG = g.selectAll('.industry-row')
      .data(rows)
      .enter()
      .append('g')
      .attr('class', 'industry-row')
      .attr('transform', function (d, i) { return 'translate(0,' + i * (barThickness + gap) + ')'; });

    // category label
    rowG.append('text')
      .attr('x', -12)
      .attr('y', barThickness / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', TOKENS.navy)
      .attr('font-size', 13)
      .attr('font-weight', 600)
      .text(function (d) { return d.name; });

    // track (unfilled, lighter step)
    rowG.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', innerWidth).attr('height', barThickness)
      .attr('rx', 4).attr('ry', 4)
      .attr('fill', '#eef1f4');

    // bar
    rowG.append('rect')
      .attr('class', 'bar')
      .attr('x', 0).attr('y', 0)
      .attr('width', function (d) { return Math.max(x(100 * d.contactPass / d.total), barThickness); })
      .attr('height', barThickness)
      .attr('rx', 4).attr('ry', 4)
      .attr('fill', function (d) { return tierColor(100 * d.contactPass / d.total); })
      .style('cursor', 'pointer')
      .on('mousemove', function (evt, d) {
        showTooltip(evt, '<strong>' + d.name + '</strong><br>' + d.contactPass + ' of ' + d.total + ' Vancouver businesses checked have machine-findable contact info.');
        d3.select(this).attr('opacity', 0.85);
      })
      .on('mouseleave', function () {
        hideTooltip();
        d3.select(this).attr('opacity', 1);
      });

    // value label at tip
    rowG.append('text')
      .attr('x', function (d) { return Math.max(x(100 * d.contactPass / d.total), barThickness) + 8; })
      .attr('y', barThickness / 2)
      .attr('dy', '0.35em')
      .attr('fill', TOKENS.slate)
      .attr('font-size', 12.5)
      .attr('font-weight', 700)
      .text(function (d) { return Math.round(100 * d.contactPass / d.total) + '%'; });
  }

  function renderChecksChart(container, data) {
    var rows = data.checks;
    var margin = { top: 8, right: 96, bottom: 8, left: 220 };
    var barThickness = 26;
    var gap = 18;
    var width = Math.max(container.clientWidth, 560);
    var innerWidth = width - margin.left - margin.right;
    var height = rows.length * (barThickness + gap) - gap;

    var svg = d3.select(container).append('svg')
      .attr('width', width)
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', '0 0 ' + width + ' ' + (height + margin.top + margin.bottom))
      .attr('role', 'img')
      .attr('aria-label', 'Failure rate per AI readiness check, out of the real 50-business audit');

    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    var x = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);

    [50, 100].forEach(function (t) {
      g.append('line')
        .attr('x1', x(t)).attr('x2', x(t))
        .attr('y1', -2).attr('y2', height + 2)
        .attr('stroke', TOKENS.line).attr('stroke-width', 1);
    });

    var rowG = g.selectAll('.check-row')
      .data(rows)
      .enter()
      .append('g')
      .attr('class', 'check-row')
      .attr('transform', function (d, i) { return 'translate(0,' + i * (barThickness + gap) + ')'; });

    rowG.append('text')
      .attr('x', -12)
      .attr('y', barThickness / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', TOKENS.navy)
      .attr('font-size', 13)
      .attr('font-weight', 600)
      .text(function (d) { return d.label; });

    rowG.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', innerWidth).attr('height', barThickness)
      .attr('rx', 4).attr('ry', 4)
      .attr('fill', '#eef1f4');

    rowG.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', function (d) { return Math.max(x(100 * d.failed / d.total), barThickness); })
      .attr('height', barThickness)
      .attr('rx', 4).attr('ry', 4)
      .attr('fill', TOKENS.critical)
      .style('cursor', 'pointer')
      .on('mousemove', function (evt, d) {
        showTooltip(evt, '<strong>' + d.label + '</strong><br>' + d.failed + ' of ' + d.total + ' real Vancouver businesses failed this check.');
        d3.select(this).attr('opacity', 0.85);
      })
      .on('mouseleave', function () {
        hideTooltip();
        d3.select(this).attr('opacity', 1);
      });

    rowG.append('text')
      .attr('x', function (d) { return Math.max(x(100 * d.failed / d.total), barThickness) + 8; })
      .attr('y', barThickness / 2)
      .attr('dy', '0.35em')
      .attr('fill', TOKENS.slate)
      .attr('font-size', 13)
      .attr('font-weight', 700)
      .text(function (d) { return Math.round(100 * d.failed / d.total) + '% failed'; });
  }

  function renderIndustryDots(container, data) {
    var rows = data.industries.slice().sort(function (a, b) {
      return (a.contactPass / a.total) - (b.contactPass / b.total);
    });

    var margin = { top: 8, right: 52, bottom: 8, left: 152 };
    var rowHeight = 30;
    var width = Math.max(container.clientWidth, 460);
    var innerWidth = width - margin.left - margin.right;
    var height = rows.length * rowHeight;

    var svg = d3.select(container).append('svg')
      .attr('width', width)
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', '0 0 ' + width + ' ' + (height + margin.top + margin.bottom))
      .attr('role', 'img')
      .attr('aria-label', 'Machine-findable contact info pass rate by Vancouver industry, out of the real 50-business audit');

    var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    var x = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);

    [0, 50, 100].forEach(function (t) {
      g.append('line')
        .attr('x1', x(t)).attr('x2', x(t))
        .attr('y1', -2).attr('y2', height + 2)
        .attr('stroke', TOKENS.line).attr('stroke-width', 1);
    });

    var rowG = g.selectAll('.industry-dot-row')
      .data(rows)
      .enter()
      .append('g')
      .attr('class', 'industry-dot-row')
      .attr('transform', function (d, i) { return 'translate(0,' + (i * rowHeight + rowHeight / 2) + ')'; });

    rowG.append('text')
      .attr('x', -12)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', TOKENS.navy)
      .attr('font-size', 13)
      .attr('font-weight', 600)
      .text(function (d) { return d.name; });

    rowG.append('line')
      .attr('x1', x(0)).attr('x2', function (d) { return x(100 * d.contactPass / d.total); })
      .attr('y1', 0).attr('y2', 0)
      .attr('stroke', TOKENS.line).attr('stroke-width', 2);

    var dot = rowG.append('circle')
      .attr('cx', function (d) { return x(100 * d.contactPass / d.total); })
      .attr('cy', 0)
      .attr('r', 7)
      .attr('fill', function (d) { return tierColor(100 * d.contactPass / d.total); })
      .style('cursor', 'pointer')
      .on('mousemove', function (evt, d) {
        showTooltip(evt, '<strong>' + d.name + '</strong><br>' + d.contactPass + ' of ' + d.total + ' Vancouver businesses checked have machine-findable contact info.');
        d3.select(this).attr('r', 9);
      })
      .on('mouseleave', function () {
        hideTooltip();
        d3.select(this).attr('r', 7);
      });

    rowG.append('text')
      .attr('x', function (d) { return x(100 * d.contactPass / d.total) + 14; })
      .attr('y', 0)
      .attr('dy', '0.35em')
      .attr('fill', TOKENS.slate)
      .attr('font-size', 12.5)
      .attr('font-weight', 700)
      .text(function (d) { return Math.round(100 * d.contactPass / d.total) + '%'; });
  }

  function renderGaugeRow(container, data, checkIds) {
    var RING_R = 44, RING_W = 11, TILE_MIN = 148, TOP_PAD = 10, LABEL_GAP = 26;
    var checks = checkIds.map(function (id) {
      return data.checks.filter(function (c) { return c.id === id; })[0];
    }).filter(Boolean);
    if (!checks.length) return;

    var n = checks.length;
    var width = Math.max(container.clientWidth, n * TILE_MIN);
    var tileW = width / n;
    var height = TOP_PAD + RING_R * 2 + LABEL_GAP + 34;
    var circumference = 2 * Math.PI * RING_R;

    var svg = d3.select(container).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('role', 'img')
      .attr('aria-label', 'Failure rate gauges for AI readiness checks, out of the real 50-business audit');

    checks.forEach(function (check, i) {
      var pct = Math.round(100 * check.failed / check.total);
      var cx = tileW * i + tileW / 2;
      var cy = TOP_PAD + RING_R;
      var g = svg.append('g');

      g.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', RING_R)
        .attr('fill', 'none').attr('stroke', TOKENS.line).attr('stroke-width', RING_W);

      g.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', RING_R)
        .attr('fill', 'none').attr('stroke', tierColor(100 - pct)).attr('stroke-width', RING_W)
        .attr('stroke-linecap', 'round')
        .attr('stroke-dasharray', circumference)
        .attr('stroke-dashoffset', circumference * (1 - pct / 100))
        .attr('transform', 'rotate(-90 ' + cx + ' ' + cy + ')')
        .style('cursor', 'pointer')
        .on('mousemove', function (evt) {
          showTooltip(evt, '<strong>' + check.label + '</strong><br>' + check.failed + ' of ' + check.total + ' real Vancouver businesses failed this check.');
        })
        .on('mouseleave', hideTooltip);

      g.append('text')
        .attr('x', cx).attr('y', cy + 8)
        .attr('text-anchor', 'middle')
        .attr('font-size', 24).attr('font-weight', 800).attr('fill', TOKENS.navy)
        .text(pct + '%');

      var label = (check.shortLabel || check.label);
      g.append('text')
        .attr('x', cx).attr('y', cy + RING_R + LABEL_GAP)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12.5).attr('font-weight', 600).attr('fill', TOKENS.slate)
        .text(label + ' — failed');
    });
  }

  function renderAll() {
    var industryEls = document.querySelectorAll('[data-chart="industry"]');
    var checksEls = document.querySelectorAll('[data-chart="checks"]');
    var dotEls = document.querySelectorAll('[data-chart="industry-dots"]');
    var gaugeEls = document.querySelectorAll('[data-chart="gauge"]');
    if (!industryEls.length && !checksEls.length && !dotEls.length && !gaugeEls.length) return;

    fetch('/assets/audit-data.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        industryEls.forEach(function (el) { renderIndustryChart(el, data); });
        checksEls.forEach(function (el) { renderChecksChart(el, data); });
        dotEls.forEach(function (el) { renderIndustryDots(el, data); });
        gaugeEls.forEach(function (el) {
          var ids = (el.getAttribute('data-checks') || 'summary,contact,action').split(',').map(function (s) { return s.trim(); });
          renderGaugeRow(el, data, ids);
        });
        window.addEventListener('mousemove', positionTooltip);
      })
      .catch(function (err) { console.error('AIReadyCharts: failed to load audit data', err); });
  }

  window.AIReadyCharts = { renderAll: renderAll };
})();
