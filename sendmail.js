document.addEventListener("DOMContentLoaded", function () {
  // Function to collect form data
  function getFormData() {
    // console.log("Form submitted");

    const formData = {
      name: document.getElementById("name")
        ? document.getElementById("name").value.trim()
        : "",
      email: document.getElementById("email")
        ? document.getElementById("email").value.trim()
        : "",
      phone: document.getElementById("phone")
        ? document.getElementById("phone").value.trim()
        : "",
      street: document.getElementById("street")
        ? document.getElementById("street").value.trim()
        : "",
      city: document.getElementById("city")
        ? document.getElementById("city").value.trim()
        : "",
      state: document.getElementById("state")
        ? document.getElementById("state").value.trim()
        : "",
      zip: document.getElementById("zip")
        ? document.getElementById("zip").value.trim()
        : "",
      message: document.getElementById("message")
        ? document.getElementById("message").value.trim()
        : "",
    };

    console.log("Collected Form Data:", formData);
    return formData;
  }

  // Function to send the data to a Google Script or any endpoint
  function submitForm() {
    const data = getFormData();
    const scriptURL =
      "https://script.google.com/macros/s/AKfycbxcrkbc2hEh-5EPaze79pbiKwSUEaNgcYjB5TeKTH25GrciueZbc1o3CqgEz65BmW_I/exec"; // Replace with your Google Script URL

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
        console.log("Success:", result);
        alert("Form submitted successfully!");
        document.getElementById("form").reset(); // Reset the form
      })
      .catch((error) => {
        // console.error("Error:", error);
        alert("There was an error submitting the form.");
      });
  }

  // Attach the submit handler to the form
  const formElement = document.getElementById("form");
  if (formElement) {
    formElement.addEventListener("submit", function (e) {
      e.preventDefault();
      submitForm();
    });
  } else {
    console.error("Form with id='form' not found!");
  }
});
