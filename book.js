(function () {
    const firebaseConfig = {
        apiKey: "AIzaSyAJzxHxVIGd4vsaI52HvttClgUqBHDtuCs",
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

    const bookingDB = firebase.database().ref("bookings");
    const bookingForm = document.getElementById("book-form");
    const bookingSubmitButton = document.getElementById("submit-button");

    if (!bookingForm) {
        console.error("Booking form was not found.");
        return;
    }

    if (!bookingSubmitButton) {
        console.error("Submit button was not found.");
        return;
    }

    if (typeof validateForm !== "function") {
        console.error("validateForm() was not found.");
        return;
    }

    function getElementVal(name) {
        const field = bookingForm.elements[name];
        return field ? field.value.trim() : "";
    }

    async function submitBooking(e) {
        e.preventDefault();

        if (!validateForm()) {
            const firstInvalid = bookingForm.querySelector(".invalid");

            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

            return;
        }

        const bookingData = {
            customerName: getElementVal("name"),
            companyName: getElementVal("company"),
            customerPhone: getElementVal("phone").replace(/[\s()-]/g, ""),
            customerEmail: getElementVal("email"),
            registrationNumber: getElementVal("registration").toUpperCase(),
            vehicleType: getElementVal("vehicleType"),
            vehicleMake: getElementVal("make"),
            vehicleModel: getElementVal("model"),
            serviceType: getElementVal("service"),
            preferredDate: getElementVal("date"),
            preferredTime: getElementVal("time"),
            notes: getElementVal("notes"),
            status: "Pending",
            submittedAt: new Date().toISOString()
        };

        if (!bookingData.customerName) {
            alert("Please enter your full name.");
            bookingForm.elements["name"].focus();
            return;
        }

        bookingSubmitButton.disabled = true;
        bookingSubmitButton.textContent = "Submitting Booking...";

        try {
            const newBooking = await bookingDB.push(bookingData);

            console.log("Booking successfully saved!");
            console.log("Booking ID:", newBooking.key);
            console.log("Booking Information:", bookingData);

            const success = document.createElement("div");
            success.className = "success";

            const icon = document.createElement("b");
            icon.textContent = "✓";

            const heading = document.createElement("h2");
            heading.textContent = "Booking Received!";

            const paragraph = document.createElement("p");
            paragraph.textContent = `Thank you, ${bookingData.customerName}. Your booking for vehicle ${bookingData.registrationNumber} has been received. Our team will contact you to confirm your appointment.`;

            const bookingReference = document.createElement("p");
            bookingReference.textContent = "Booking Reference: " + newBooking.key;

            success.append(icon, heading, paragraph, bookingReference);
            bookingForm.replaceChildren(success);

        } catch (error) {
            console.error("Booking submission failed:", error);

            let errorMessage = "Your booking could not be submitted. Please try again.";

            if (error.code === "PERMISSION_DENIED") {
                errorMessage = "Firebase denied permission to save your booking. Please check your Realtime Database rules.";
            }

            alert(errorMessage);

            bookingSubmitButton.disabled = false;
            bookingSubmitButton.textContent = "Confirm Booking";
        }
    }

    bookingForm.addEventListener("submit", submitBooking);

    console.log("PE Airbrakes booking system initialized.");
})();