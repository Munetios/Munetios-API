(() => {
  const verifiedCaptchas = new Set();

  const captchaInstances = new Map();

  const styleText = `
  @import url('https://api.munetios.com/beautiful-css/beautiful.css');

    .munetios-captcha-widget {
      display: grid;
      gap: 12px;
      padding: 20px;
      width: 500px;
      border-radius: 32px;
      background: linear-gradient(135deg, rgba(41, 41, 41, 0.72), rgba(17, 17, 17, 0.76));
      border: 1px solid rgba(255,255,255,.22);
      backdrop-filter: blur(2px) saturate(180%);
      -webkit-backdrop-filter: blur(2px) saturate(180%);
      box-shadow: 0 8px 32px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.3);
      color: white;
      font-family: "Munetios Sans", "Google Sans Flex", system-ui, sans-serif;
      font-feature-settings: "ss01";
    }

    .captcha-canvas-wrap {
      padding: 14px;
      border-radius: 24px;
      background: linear-gradient(135deg, rgba(255,255,255,.2), rgba(255,255,255,.08));
      border: 1px solid rgba(255,255,255,.18);
      backdrop-filter: blur(2px) saturate(180%);
      -webkit-backdrop-filter: blur(2px) saturate(180%);
    }

    .captcha-canvas-wrap canvas {
      width: 100%;
      max-width: 240px;
      height: 80px;
      display: block;
      border-radius: 16px;
      background: white;
    }

    .captcha-input {
      width: 93%;
      height: 52px;
      padding: 0 16px;
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,.2);
      background: linear-gradient(135deg, rgba(255,255,255,.18), rgba(255,255,255,.08));
      backdrop-filter: blur(2px) saturate(180%);
      -webkit-backdrop-filter: blur(2px) saturate(180%);
      color: white;
      font: inherit;
      outline: none;
    }

    .captcha-input::placeholder {
      color: rgba(255,255,255,.6);
    }

    .captcha-input:focus {
      border-color: rgba(180,140,255,.8);
      box-shadow: 0 0 0 4px rgba(140,90,255,.15);
    }

    .captcha-submit,
    .captcha-refresh {
      height: 52px;
      border-radius: 18px;
      cursor: pointer;
      font: inherit;
      font-weight: 700;
      transition: transform .15s, opacity .15s;
    }

    .captcha-submit {
      border: 0;
      color: white;
      background: linear-gradient(135deg, #9b6dff, #6f2fff);
      box-shadow: 0 8px 24px rgba(111,47,255,.35);
    }

    .captcha-refresh {
      color: white;
      background: linear-gradient(135deg, rgba(255,255,255,.18), rgba(255,255,255,.08));
      border: 1px solid rgba(255,255,255,.18);
      backdrop-filter: blur(2px) saturate(180%);
      -webkit-backdrop-filter: blur(2px) saturate(180%);
    }

    .captcha-submit:hover,
    .captcha-refresh:hover {
      transform: translateY(-2px);
    }

    .captcha-error {
      min-height: 24px;
      font-size: .95rem;
      color: #ff7b7b;
    }

    .captcha-success {
      color: #7dffb0;
    }

    .verify-message {
      margin-top: 10px;
      padding: 12px 16px;
      border-radius: 16px;
      color: white;
      background: linear-gradient(135deg, rgba(255,80,80,.2), rgba(255,80,80,.08));
      border: 1px solid rgba(255,120,120,.3);
      backdrop-filter: blur(2px) saturate(180%);
      -webkit-backdrop-filter: blur(2px) saturate(180%);
      font-family: "Munetios Sans", "Google Sans Flex", system-ui, sans-serif;
    }
  `;

  class MunetiosCaptcha {
    constructor(container) {
      this.container = container;
      this.root = container.attachShadow({ mode: "closed" });
      this.captchaText = "";
      this.verified = false;

      this.render();
      this.generateCaptcha();
      this.attachEvents();

      captchaInstances.set(container.id, this);
    }

    render() {
      this.root.innerHTML = `
        <style>${styleText}</style>

        <div class="munetios-captcha-widget">
          <div class="captcha-canvas-wrap">
            <canvas width="240" height="80"></canvas>
          </div>

          <input
            class="captcha-input"
            type="text"
            maxlength="6"
            placeholder="Enter text"
            autocomplete="off"
            spellcheck="false"
            data-scan-translate-placeholder-key="enterText"
          >

          <button class="captcha-submit" type="button">Continue</button>
          <button class="captcha-refresh" type="button">Refresh</button>

          <footer style="text-align: center; font-size: 14px; color: #666;">
            Munetios Captcha
          </footer>

          <div class="captcha-error"></div>
        </div>
      `;

      this.canvas = this.root.querySelector("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.input = this.root.querySelector(".captcha-input");
      this.submit = this.root.querySelector(".captcha-submit");
      this.refresh = this.root.querySelector(".captcha-refresh");
      this.error = this.root.querySelector(".captcha-error");
    }

    randomText(length = 6) {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let result = "";

      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }

      return result;
    }

    rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    generateCaptcha() {
      this.captchaText = this.randomText();
      this.verified = false;

      verifiedCaptchas.delete(this.container.id);

      this.input.value = "";
      this.error.textContent = "";
      this.error.classList.remove("captcha-success");

      const ctx = this.ctx;

      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const gradient = ctx.createLinearGradient(
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );

      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, "#f2ebff");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = 0; i < 26; i++) {
        ctx.beginPath();
        ctx.arc(
          this.rand(0, this.canvas.width),
          this.rand(0, this.canvas.height),
          this.rand(1, 4),
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `rgba(120,70,190,${this.rand(0.12, 0.35)})`;
        ctx.fill();
      }

      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(
          this.rand(0, this.canvas.width),
          this.rand(0, this.canvas.height),
        );
        ctx.lineTo(
          this.rand(0, this.canvas.width),
          this.rand(0, this.canvas.height),
        );
        ctx.strokeStyle = `rgba(90,40,150,${this.rand(0.16, 0.34)})`;
        ctx.lineWidth = this.rand(1, 3);
        ctx.stroke();
      }

      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      for (let i = 0; i < this.captchaText.length; i++) {
        const letter = this.captchaText[i];
        const x = 28 + i * 36;
        const y = this.canvas.height / 2 + this.rand(-5, 6);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rand(-0.28, 0.28));
        ctx.font = `bold ${this.rand(28, 36)}px "Munetios Sans", "Google Sans Text", "Google Sans 17pt Text", "Google Sans", Arial, sans-serif`;
        ctx.fillStyle = i % 2 === 0 ? "#6b22d6" : "#35106d";
        ctx.fillText(letter, 0, 0);
        ctx.restore();
      }
    }

    verify() {
      const value = this.input.value.trim().toUpperCase();

      if (!value) {
        this.showMessage("Please enter the captcha text.", false);
        return false;
      }

      if (value === this.captchaText) {
        this.verified = true;
        verifiedCaptchas.add(this.container.id);

        this.showMessage("Captcha verified. You can continue.", true);

        this.container.dispatchEvent(
          new CustomEvent("captcha-success", {
            bubbles: true,
            detail: {
              verified: true,
              captchaId: this.container.id,
            },
          }),
        );

        return true;
      }

      this.verified = false;
      verifiedCaptchas.delete(this.container.id);

      this.showMessage("Incorrect captcha. Try again.", false);
      this.generateCaptcha();

      this.container.dispatchEvent(
        new CustomEvent("captcha-failed", {
          bubbles: true,
          detail: {
            verified: false,
            captchaId: this.container.id,
          },
        }),
      );

      return false;
    }

    showMessage(message, success) {
      this.error.textContent = message;

      if (success) {
        this.error.classList.add("captcha-success");
      } else {
        this.error.classList.remove("captcha-success");
      }
    }

    attachEvents() {
      this.submit.addEventListener("click", () => {
        this.verify();
      });

      this.refresh.addEventListener("click", () => {
        this.generateCaptcha();
      });

      this.input.addEventListener("input", () => {
        this.verified = false;
        verifiedCaptchas.delete(this.container.id);
      });

      this.input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          this.verify();
        }
      });
    }
  }

  function showVerifyMessage(trigger, message) {
    let messageElement = trigger.parentElement.querySelector(".verify-message");

    if (!messageElement) {
      messageElement = document.createElement("div");
      messageElement.className = "verify-message";
      trigger.insertAdjacentElement("afterend", messageElement);
    }

    messageElement.textContent = message;
  }

  function protectVerifiedElements() {
    document.addEventListener(
      "click",
      (event) => {
        const trigger = event.target.closest("[verifyelementid]");

        if (!trigger) return;

        const captchaId = trigger.getAttribute("verifyelementid");
        const captcha = document.getElementById(captchaId);

        if (!captcha) {
          event.preventDefault();
          event.stopImmediatePropagation();

          showVerifyMessage(trigger, "Captcha could not be found.");
          return;
        }

        if (!verifiedCaptchas.has(captchaId)) {
          event.preventDefault();
          event.stopImmediatePropagation();

          showVerifyMessage(
            trigger,
            "Please complete the captcha before continuing.",
          );

          const instance = captchaInstances.get(captchaId);

          if (instance) {
            instance.showMessage(
              "Please complete the captcha before continuing.",
              false,
            );
          }

          captcha.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      },
      true,
    );
  }

  function initCaptchas() {
    const captchas = document.querySelectorAll(
      "#munetios-captcha, [data-munetios-captcha]",
    );

    captchas.forEach((captcha, index) => {
      if (!captcha.id) {
        captcha.id = `munetios-captcha-${index + 1}`;
      }

      if (!captcha.dataset.captchaInitialized) {
        captcha.dataset.captchaInitialized = "true";
        new MunetiosCaptcha(captcha);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCaptchas();
    protectVerifiedElements();
  });

  window.MunetiosCaptcha = {
    isVerified(captchaId) {
      return verifiedCaptchas.has(captchaId);
    },

    reset(captchaId) {
      const captcha = document.getElementById(captchaId);

      if (!captcha) return;

      captcha.dataset.captchaInitialized = "";
      verifiedCaptchas.delete(captchaId);
      captchaInstances.delete(captchaId);

      new MunetiosCaptcha(captcha);
    },
  };
})();
