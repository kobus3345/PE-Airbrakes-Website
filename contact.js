(function () {
    const firebaseConfig = {
        apiKey: "YOUR_ACTUAL_FIREBASE_API_KEY",
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

    const contactDB = firebase.database().ref("contact-messages");
    const form = document.getElementById("contact-form");

    if (!form) {
        console.error("Contact form was not found.");
        return;
    }

    function getElementVal(name) {
        const field = form.elements[name];
        return field ? field.value.trim() : "";
    }

    async function submitContact(e) {
        e.preventDefault();

        if (typeof validateForm !== "function") {
            console.error("validateForm() was not found.");
            return;
        }

        if (!validateForm()) {
            const firstInvalid = form.querySelector(".invalid");

            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

            return;
        }

        const contactData = {
            name: getElementVal("name"),
            phone: getElementVal("phone").replace(/[\s()-]/g, ""),
            email: getElementVal("email"),
            message: getElementVal("message"),
            status: "Pending",
            submittedAt: new Date().toISOString()
        };

        if (!contactData.name) {
            alert("Please enter your full name.");
            form.elements["name"].focus();
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');

        if (!submitButton) {
            console.error("Submit button was not found.");
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Sending Message...";

        try {
            const newMessage = await contactDB.push(contactData);

            console.log("Contact message successfully saved!");
            console.log("Message ID:", newMessage.key);
            console.log("Contact Information:", contactData);

            const success = document.createElement("div");
            success.className = "success";

            const icon = document.createElement("b");
            icon.textContent = "✓";

            const heading = document.createElement("h2");
            heading.textContent = "Message Sent!";

            const paragraph = document.createElement("p");
            paragraph.textContent = "Thank you for contacting PE Airbrakes. We will get back to you within one business day.";

            const reference = document.createElement("p");
            reference.textContent = "Message Reference: " + newMessage.key;

            success.append(icon, heading, paragraph, reference);
            form.replaceChildren(success);

        } catch (error) {
            console.error("Contact message submission failed:", error);

            let errorMessage = "Your message could not be submitted. Please try again.";

            if (error.code === "PERMISSION_DENIED") {
                errorMessage = "Firebase denied permission to save your message. Please check your Realtime Database rules.";
            }

            alert(errorMessage);

            submitButton.disabled = false;
            submitButton.textContent = "Send Message";
        }
    }

    form.addEventListener("submit", submitContact);

    console.log("PE Airbrakes contact system initialized.");
})();