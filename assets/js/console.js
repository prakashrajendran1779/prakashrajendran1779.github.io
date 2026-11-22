/* The interactive "prakash.js" console in the intro section.
   It never evaluates code: it understands a small, fixed set of JavaScript-style commands. */
(() => {
  'use strict';

  const consoleEl = document.getElementById('console');
  const form = document.getElementById('console-form');
  const input = document.getElementById('console-input');
  const output = document.getElementById('console-output');
  const body = document.getElementById('console-body');
  if (!consoleEl || !form || !input || !output || !body) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMAIL = 'prakashrajendran1779@gmail.com';
  const RESUME = 'assets/Prakash-Rajendran-Resume.pdf';

  /* ---------- What the console knows ---------- */
  const prakash = {
    name: 'Prakash Rajendran',
    role: 'Software Developer (entry-level)',
    location: 'Thanjavur, Tamil Nadu, India',
    openToWork: true,
    skills: {
      frontend: ['HTML', 'CSS', 'JavaScript', 'React'],
      backend: ['Node.js'],
      databases: ['MySQL', 'SQL'],
    },
    experience: [
      {
        role: 'Intern, Academic Project',
        org: "St. Joseph's College of Engineering & Technology",
        period: 'Jan 2021 – Mar 2023',
      },
    ],
    projects: [
      'AI-Based Natural Disaster Classification & Intensity Analysis (IBM)',
      'Online Blood Bank Management System',
      'Predicting Student Performance with Machine Learning (paper)',
    ],
    education: {
      degree: 'B.E. Computer Science and Engineering',
      college: "St. Joseph's College of Engineering & Technology, Thanjavur",
      university: 'Anna University',
      graduated: 2023,
      cgpa: '7.78 / 10',
    },
    strengths: ['Team player', 'Fast learner', 'Steady under pressure'],
  };

  // Methods can be called; their behavior lives in callMethod().
  const METHODS = ['contact', 'resume', 'hire'];
  const namedFn = (name) => ({ [name]: function () {} })[name];
  const view = Object.assign({}, prakash, Object.fromEntries(METHODS.map((name) => [name, namedFn(name)])));

  const HELP = [
    ['prakash', 'overview'],
    ['prakash.skills', 'tech stack'],
    ['prakash.experience', 'internship'],
    ['prakash.projects', 'projects and paper'],
    ['prakash.education', 'degree and CGPA'],
    ['prakash.strengths', 'how I work'],
    ['prakash.contact()', 'get in touch'],
    ['prakash.resume()', 'download my résumé'],
    ['Object.keys(prakash)', 'everything to explore'],
    ['clear', 'clear the console'],
  ];

  const COMPLETIONS = (() => {
    const list = ['help', 'clear', 'Object.keys(prakash)'];
    const walk = (value, path) => {
      list.push(path);
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.keys(value).forEach((key) => walk(value[key], `${path}.${key}`));
      }
    };
    walk(prakash, 'prakash');
    METHODS.forEach((name) => list.push(`prakash.${name}()`));
    return list;
  })();

  /* ---------- Rendering ---------- */
  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);
  const tok = (cls, text) => `<span class="${cls}">${esc(text)}</span>`;
  const pun = (text) => tok('t-pun', text);

  // Pretty-prints a value the way a browser console would, with syntax colors.
  function format(value, depth = 0, maxDepth = Infinity) {
    const pad = '  '.repeat(depth);
    if (typeof value === 'string') return tok('t-str', JSON.stringify(value));
    if (typeof value === 'number') return tok('t-num', value);
    if (typeof value === 'boolean' || value === null || value === undefined) return tok('t-kw', String(value));
    if (typeof value === 'function') return `${tok('t-kw', 'ƒ')} ${esc(value.name)}()`;
    if (Array.isArray(value)) {
      if (depth >= maxDepth) return `${pun('Array(')}${tok('t-num', value.length)}${pun(')')}`;
      const items = value.map((item) => format(item, depth + 1, maxDepth));
      const flat = value.every((item) => item === null || typeof item !== 'object');
      if (flat && JSON.stringify(value).length <= 44) return pun('[') + items.join(pun(', ')) + pun(']');
      return `${pun('[')}\n${items.map((item) => `${pad}  ${item}`).join(`${pun(',')}\n`)}\n${pad}${pun(']')}`;
    }
    if (typeof value === 'object') {
      if (depth >= maxDepth) return pun('{…}');
      const lines = Object.keys(value).map(
        (key) => `${pad}  ${tok('t-key', key)}${pun(':')} ${format(value[key], depth + 1, maxDepth)}`
      );
      return `${pun('{')}\n${lines.join(`${pun(',')}\n`)}\n${pad}${pun('}')}`;
    }
    return esc(value);
  }

  const scrollToEnd = () => { body.scrollTop = body.scrollHeight; };

  const append = (className, html) => {
    const line = document.createElement('div');
    line.className = className;
    line.innerHTML = html;
    output.append(line);
    scrollToEnd();
  };
  const echo = (text) => {
    const line = document.createElement('div');
    line.className = 'term__cmd';
    line.textContent = text;
    output.append(line);
    scrollToEnd();
  };
  const result = (html) => append('term__res', html);
  const comment = (text) => append('t-com', esc(text));
  const error = (text) => append('term__res t-err', esc(text));
  const hint = () => comment('// Try "help" to see what you can explore.');

  /* ---------- Commands ---------- */
  const history = [];
  let historyIndex = 0;

  function run(raw, { record = true } = {}) {
    const text = raw.trim();
    if (!text) return;
    if (record && history[history.length - 1] !== text) history.push(text);
    historyIndex = history.length;

    const cmd = text.replace(/;+$/, '').trim();
    if (/^(clear|clear\(\)|console\.clear\(\))$/i.test(cmd)) {
      output.replaceChildren();
      return;
    }

    echo(text);
    if (/^help(\(\))?$/i.test(cmd)) return printHelp();
    if (/^object\.keys\(\s*prakash\s*\)$/i.test(cmd)) return result(format(Object.keys(view)));

    const call = cmd.match(/^prakash\s*\.\s*([A-Za-z_$][\w$]*)\s*\(\s*\)$/i);
    if (call) return callMethod(call[1]);
    if (/^prakash\b/i.test(cmd)) return evaluatePath(cmd);

    const word = cmd.match(/^[A-Za-z_$][\w$]*/);
    error(word ? `Uncaught ReferenceError: ${word[0]} is not defined` : 'Uncaught SyntaxError: Unexpected token');
    hint();
  }

  function printHelp() {
    const width = Math.max(...HELP.map(([cmd]) => cmd.length)) + 2;
    const lines = HELP.map(
      ([cmd, desc]) =>
        `<button type="button" class="term__run" data-cmd="${esc(cmd)}">${esc(cmd)}</button>` +
        `${' '.repeat(width - cmd.length)}${tok('t-com', `// ${desc}`)}`
    );
    result(lines.join('\n'));
    comment('// Tab completes a command; ↑ and ↓ browse history.');
  }

  // Reads a property path such as prakash.skills.frontend or prakash.projects[0].
  function evaluatePath(cmd) {
    const match = cmd.match(/^prakash((?:\s*\.\s*[A-Za-z_$][\w$]*|\s*\[\s*\d+\s*\])*)$/i);
    if (!match) {
      error('Uncaught SyntaxError: Unexpected token');
      hint();
      return;
    }
    const steps = Array.from(match[1].matchAll(/\.\s*([A-Za-z_$][\w$]*)|\[\s*(\d+)\s*\]/g)).map(
      (m) => (m[1] !== undefined ? m[1] : Number(m[2]))
    );
    if (!steps.length) {
      result(format(prakash, 0, 1));
      return;
    }
    let value = view;
    for (const step of steps) {
      if (value === undefined || value === null) {
        error(`Uncaught TypeError: Cannot read properties of ${value} (reading '${step}')`);
        return;
      }
      value = lookup(value, step);
    }
    result(format(value));
    if (value === undefined && steps.length === 1) comment(`// prakash has: ${Object.keys(view).join(', ')}`);
  }

  // Own properties only (never the prototype chain); property names are matched case-insensitively.
  function lookup(target, step) {
    if (typeof step === 'number') return Array.isArray(target) ? target[step] : undefined;
    if (step === 'length' && (Array.isArray(target) || typeof target === 'string')) return target.length;
    if (!target || typeof target !== 'object') return undefined;
    const key = Object.keys(target).find((k) => k.toLowerCase() === step.toLowerCase());
    return key === undefined ? undefined : target[key];
  }

  function callMethod(name) {
    switch (name.toLowerCase()) {
      case 'contact':
        result(format({ email: EMAIL, location: prakash.location }));
        append('t-com', `// <a href="mailto:${EMAIL}">Write to me →</a>`);
        return;
      case 'resume':
        append('t-com', `// Downloading my résumé… <a href="${RESUME}" download>Use this link if it doesn't start.</a>`);
        downloadResume();
        return;
      case 'hire':
        result(tok('t-str', '"Excellent choice!"'));
        append(
          't-com',
          `// Let's talk: <a href="mailto:${EMAIL}?subject=${encodeURIComponent('Opportunity for Prakash')}">${EMAIL}</a>`
        );
        return;
      default:
        error(`Uncaught TypeError: prakash.${name} is not a function`);
        hint();
    }
  }

  function downloadResume() {
    const link = document.createElement('a');
    link.href = RESUME;
    link.download = 'Prakash-Rajendran-Resume.pdf';
    document.body.append(link);
    link.click();
    link.remove();
  }

  /* ---------- Intro: type the first command once the console is on screen ---------- */
  let introPromise = null;
  let introDone = false;
  let skipIntro = false;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function intro() {
    output.setAttribute('aria-live', 'off');
    output.replaceChildren();
    comment("// Hi, I'm Prakash. This console speaks JavaScript.");
    if (!reduceMotion && !skipIntro) {
      await sleep(650);
      for (const ch of 'prakash') {
        if (skipIntro) break;
        input.value += ch;
        await sleep(80 + Math.random() * 70);
      }
      if (!skipIntro) await sleep(300);
    }
    if (!skipIntro) input.value = '';
    run('prakash', { record: false });
    comment('// Try prakash.skills, or type help ↵');
    output.setAttribute('aria-live', 'polite');
    introDone = true;
  }

  const startIntro = () => {
    if (!introPromise) introPromise = intro();
    return introPromise;
  };

  // Finishes the intro immediately (used as soon as the visitor interacts).
  const settleIntro = () => {
    if (introDone) return Promise.resolve();
    if (!skipIntro) {
      skipIntro = true;
      input.value = '';
    }
    return startIntro();
  };

  if ('IntersectionObserver' in window) {
    const watcher = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        watcher.disconnect();
        startIntro();
      }
    }, { threshold: 0.35 });
    watcher.observe(consoleEl);
  } else {
    startIntro();
  }

  /* ---------- Events ---------- */
  input.addEventListener('focus', () => { settleIntro(); });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = '';
    await settleIntro();
    run(value);
  });

  // Suggestion chips and the clickable commands printed by "help".
  consoleEl.addEventListener('click', async (event) => {
    const trigger = event.target.closest('[data-cmd]');
    if (!trigger) return;
    await settleIntro();
    run(trigger.dataset.cmd);
  });

  // Clicking empty space in the console focuses the prompt (mouse and trackpad only).
  body.addEventListener('mouseup', (event) => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (event.target.closest('a, button, input')) return;
    if (String(window.getSelection())) return;
    input.focus({ preventScroll: true });
  });

  const caretToEnd = () => {
    requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
  };
  const commonPrefix = (words) =>
    words.reduce((prefix, word) => {
      let i = 0;
      while (i < prefix.length && i < word.length && prefix[i] === word[i]) i += 1;
      return prefix.slice(0, i);
    });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
      caretToEnd();
    } else if (event.key === 'ArrowDown' && history.length) {
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] || '';
      caretToEnd();
    } else if (event.key === 'Tab' && !event.shiftKey && input.value.trim()) {
      const value = input.value.trim();
      const matches = COMPLETIONS.filter(
        (c) => c.toLowerCase().startsWith(value.toLowerCase()) && c.toLowerCase() !== value.toLowerCase()
      );
      if (!matches.length) return; // Let Tab move focus as usual.
      event.preventDefault();
      const prefix = commonPrefix(matches);
      if (prefix.length > value.length) input.value = prefix;
      else comment(matches.join('   '));
    } else if (event.key.toLowerCase() === 'l' && event.ctrlKey) {
      event.preventDefault();
      output.replaceChildren();
    }
  });
})();
