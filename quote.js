
const firebaseConfig = {
    apiKey: "YOUR_EXISTING_API_KEY",
    authDomain: "pe-airbrakes-dataflow.firebaseapp.com",
    databaseURL: "https://pe-airbrakes-dataflow-default-rtdb.firebaseio.com",
    projectId: "pe-airbrakes-dataflow",
    storageBucket: "pe-airbrakes-dataflow.firebasestorage.app",
    messagingSenderId: "94486027821",
    appId: "1:94486027821:web:5a50d5b59d12842082a2a4",
    measurementId: "G-X913YN9MV0"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const quoteFormDB = firebase.database().ref("quote-form");
const quoteForm = document.getElementById("quote-form");

if (!quoteForm) {
    console.error("Quote form was not found.");
} else {
    quoteForm.addEventListener("submit", submitForm);
}

async function submitForm(e) {
    e.preventDefault();

    if (typeof validateForm !== "function") {
        console.error("validateForm() was not found.");
        return;
    }

    if (!validateForm()) {
        const firstInvalid = quoteForm.querySelector(".invalid");

        if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

        return;
    }

    const quoteData = {
        name: quoteForm.elements["name"].value.trim(),
        company: quoteForm.elements["company"].value.trim(),
        phone: quoteForm.elements["phone"].value.trim(),
        email: quoteForm.elements["email"].value.trim(),
        vehicleType: quoteForm.elements["vehicleType"].value,
        service: quoteForm.elements["service"].value,
        message: quoteForm.elements["message"].value.trim(),
        status: "Pending",
        submittedAt: new Date().toISOString()
    };

    if (!quoteData.name) {
        alert("Please enter your full name.");
        quoteForm.elements["name"].focus();
        return;
    }

    const submitButton = quoteForm.querySelector('button[type="submit"]');

    if (!submitButton) {
        console.error("Submit button was not found.");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
        const newQuote = await quoteFormDB.push(quoteData);

        console.log("Quote successfully saved!");
        console.log("Quote ID:", newQuote.key);
        console.log("Quote Information:", quoteData);

        const success = document.createElement("div");
        success.className = "success";

        const icon = document.createElement("b");
        icon.textContent = "✓";

        const heading = document.createElement("h2");
        heading.textContent = "Quote Request Received!";

        const paragraph = document.createElement("p");
        paragraph.textContent = `Thank you, ${quoteData.name}. Our team will contact you within one business day.`;

        const quoteReference = document.createElement("p");
        quoteReference.textContent = "Quote Reference: " + newQuote.key;

        success.append(icon, heading, paragraph, quoteReference);
        quoteForm.replaceChildren(success);

    } catch (error) {
        console.error("Error submitting quote:", error);

        let errorMessage = "Your quote could not be submitted. Please try again.";

        if (error.code === "PERMISSION_DENIED") {
            errorMessage = "Firebase denied permission to save your quote. Please check your Realtime Database rules.";
        }

        alert(errorMessage);

        submitButton.disabled = false;
        submitButton.textContent = "Submit Quote Request";
    }
}
