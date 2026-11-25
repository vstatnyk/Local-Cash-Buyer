document.addEventListener("DOMContentLoaded", function () {
  // ---- Phone: require +1 (US) ----
  const phoneInput = document.getElementById("phone");

  // Returns the 10-digit US number (without the leading 1), or "" if incomplete
  function getUsDigits(value) {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("1")) digits = digits.slice(1);
    return digits.slice(0, 10);
  }

  // Formats as "+1 (916) 555-1234" while typing, always keeping "+1 "
  function formatUsPhone(value) {
    const d = getUsDigits(value);
    let out = "+1 ";
    if (d.length > 0) out += "(" + d.slice(0, 3);
    if (d.length > 3) out += ") " + d.slice(3, 6);
    if (d.length > 6) out += "-" + d.slice(6, 10);
    return out;
  }

  function validatePhone() {
    const ok = getUsDigits(phoneInput.value).length === 10;
    phoneInput.setCustomValidity(
      ok ? "" : "Please enter a 10-digit US phone number starting with +1."
    );
    return ok;
  }

  if (phoneInput) {
    if (!phoneInput.value.startsWith("+1")) phoneInput.value = "+1 ";
    phoneInput.addEventListener("input", function () {
      phoneInput.value = formatUsPhone(phoneInput.value);
      validatePhone();
    });
    // Don't let the cursor / backspace eat the "+1 " prefix
    phoneInput.addEventListener("keydown", function (e) {
      const start = phoneInput.selectionStart;
      if ((e.key === "Backspace" && start <= 3) || (e.key === "Delete" && start < 3)) {
        if (phoneInput.selectionEnd <= 3) e.preventDefault();
      }
    });
    phoneInput.addEventListener("focus", function () {
      if (phoneInput.value.trim() === "" ) phoneInput.value = "+1 ";
    });
    validatePhone();
  }

  // ---- Cloudflare Turnstile ----
  function getTurnstileToken() {
    if (window.turnstile) return window.turnstile.getResponse() || "";
    const el = document.querySelector('[name="cf-turnstile-response"]');
    return el ? el.value : "";
  }

  function resetTurnstile() {
    if (window.turnstile) window.turnstile.reset();
  }

  // Function to collect form data
  function getFormData() {
    // console.log("Form submitted");
    const checkbox = document.getElementById("checkboxTerms");
    const hiddenInput = document.getElementById("hiddenTerms");
    if (checkbox.checked) {
      hiddenInput.disabled = true;
    }

    const formData = {
      name: document.getElementById("name")
        ? document.getElementById("name").value.trim()
        : "",
      email: document.getElementById("email")
        ? document.getElementById("email").value.trim()
        : "",
      // Sent in E.164 format, e.g. +19165551234
      phone: phoneInput ? "+1" + getUsDigits(phoneInput.value) : "",
      address: document.getElementById("address")
        ? document.getElementById("address").value.trim()
        : "",
      smsAgreement: hiddenInput.disabled ? "ok" : "don't send",
      // Cloudflare Turnstile token — verified by the Google Apps Script
      turnstileToken: getTurnstileToken(),
    };

    console.log("Collected Form Data:", formData);
    return formData;
  }

  // Function to send the data to a Google Script or any endpoint
  function submitForm() {
    const data = getFormData();
    const scriptURL =
      "https://script.google.com/macros/s/AKfycbwUcqtmGmHNmhQvFK-Ron_oe6bDH6tZ5tUrXzZ7EUbBca4_ucksEbK7NuEWOJSmLPvH/exec"; // Replace with your Google Script URL

    fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
        if (result && (result.status === "error" || result.result === "error")) {
          throw new Error(result.message || "Submission rejected");
        }
        console.log("Success:", result);
        alert("Form submitted successfully!");
        // document.getElementById("form").reset(); // Reset the form
        // const contactModal = document.getElementById("ContactModal");
        // const modalInstance = bootstrap.Modal.getOrCreateInstance(contactModal); // Create instance if not exists
        // modalInstance.hide();
        window.location.replace("https://www.9167773355.com/#submitted"); // Reload the page
      })
      .catch((error) => {
        // console.error("Error:", error);
        alert("There was an error submitting the form.");
        resetTurnstile(); // tokens are single-use, get a fresh one for the retry
      });
  }

  // Attach the submit handler to the form
  const formElement = document.getElementById("form");
  if (formElement) {
    formElement.addEventListener("submit", function (e) {
      e.preventDefault();
      if (phoneInput && !validatePhone()) {
        phoneInput.reportValidity();
        return;
      }
      if (!getTurnstileToken()) {
        alert("Please complete the security check before submitting.");
        return;
      }
      submitForm();
    });
  } else {
    console.error("Form with id='form' not found!");
  }
});
