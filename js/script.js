// Get the file input and form elements
const uploadedFile = document.getElementById("uploadedFile");
const form = document.getElementById("uploadFile");

// Add an event listener for form submission
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const file = uploadedFile.files[0];

    if (file) {
        alert(file.type)

        // Check if file type is usable
        if (file.type == "application/json" || file.type == "text/csv"){
            alert("correct file type")

        } else {
            alert("Please upload either a .CSV or a .JSON")
        }

    }
});
