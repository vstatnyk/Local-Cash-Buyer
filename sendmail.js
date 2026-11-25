document.addEventListener("DOMContentLoaded", function () {
  // ---- Phone: require +1 (US) ----
  const phoneInput = document.getElementById("phone");

  // Returns up to 10 US digits, ignoring the +1 country code.
  // (US area codes never start with 1, so any leading 1s are the country code.)
  function getUsDigits(value) {
    return value.replace(/\D/g, "").replace(/^1+/, "").slice(0, 10);
  }

  // Formats as "+1 (916) 555-1234", always keeping "+1 "
  function formatUsPhone(value) {
    const d = getUsDigits(value);
    let out = "+1 ";
    if (d.length > 0) out += "(" + d.slice(0, 3);
    if (d.length > 3) out += ") " + d.slice(3, 6);
    if (d.length > 6) out += "-" + d.slice(6, 10);
    return out;
  }

  // Valid = 10 digits, area code and exchange don't start with 0 or 1
  function validatePhone() {
    if (!phoneInput) return true;
    phoneInput.value = formatUsPhone(phoneInput.value);
    const ok = /^[2-9]\d{2}[2-9]\d{6}$/.test(getUsDigits(phoneInput.value));
    phoneInput.setCustomValidity(
      ok ? "" : "Please enter a valid 10-digit US phone number, e.g. +1 (916) 555-1234."
    );
    return ok;
  }

  if (phoneInput) {
    if (!phoneInput.value.startsWith("+1")) phoneInput.value = "+1 ";
    // Re-check on typing, autofill (change), and leaving the field
    phoneInput.addEventListener("input", validatePhone);
    phoneInput.addEventListener("change", validatePhone);
    phoneInput.addEventListener("blur", validatePhone);
    // Don't let backspace/delete eat the "+1 " prefix
    phoneInput.addEventListener("keydown", function (e) {
      const start = phoneInput.selectionStart;
      if ((e.key === "Backspace" && start <= 3) || (e.key === "Delete" && start < 3)) {
        if (phoneInput.selectionEnd <= 3) e.preventDefault();
      }
    });
    phoneInput.addEventListener("focus", function () {
      if (phoneInput.value.trim() === "") phoneInput.value = "+1 ";
    });
    // Re-check right before the browser's own form validation runs,
    // so an autofilled number is never blocked by a stale error
    const submitBtn = document.querySelector('#form button[type="submit"]');
    if (submitBtn) submitBtn.addEventListener("click", validatePhone);
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
      "https://script.google.com/macros/s/AKfycbxQD1X_ixGNy4Bd5vu75l5ueJb9wpOC3CCX1KreKc-GOZ5isLgciKazg4eK3KZ54b_u/exec"; // Replace with your Google Script URL

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
        console.error("Form submit error:", error);
        alert("There was an error submitting the form.\n\n(" + error.message + ")");
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
