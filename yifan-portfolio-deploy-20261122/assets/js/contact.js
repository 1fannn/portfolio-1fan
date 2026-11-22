(() => {
  "use strict";
  const button = document.querySelector(".copy-email");
  const status = document.querySelector(".copy-status");
  if (!button || !status) return;

  button.addEventListener("click", async () => {
    const email = button.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = "Email copied.";
    } catch {
      const field = document.createElement("textarea");
      field.value = email;
      field.setAttribute("aria-label", "Email address to copy");
      field.style.cssText = "position:fixed;left:-9999px;top:0";
      document.body.append(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      button.focus();
      status.textContent = copied ? "Email copied." : "Please copy: " + email;
    }
  });
})();

(() => {
  'use strict';
  const form = document.querySelector('#contact-form');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const subject = fields.get('topic') + ' — ' + fields.get('name').trim();
    const body = 'Hi Yifan,\n\n' + fields.get('message').trim() + '\n\nFrom: ' + fields.get('name').trim() + '\nReply to: ' + fields.get('email').trim();
    const url = 'mailto:zyf64@hotmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    document.querySelector('#contact-form-status').textContent = 'Continue in your email app to send. If it did not open, email me using the address on the left. Your draft stays here.';
    window.location.href = url;
  });
})();
