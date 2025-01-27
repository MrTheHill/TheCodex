// Get the file input and form elements
const uploadedFile = document.getElementById("uploadedFile");
const form = document.getElementById("uploadFile");

// Add an event listener for form submission
form.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent form submission

    const file = uploadedFile.files[0];

    if (file) {
        alert(file.type)
    }
});
