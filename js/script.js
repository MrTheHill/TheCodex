// Get the file input and form elements
const uploadedFile = document.getElementById("uploadedFile");
const form = document.getElementById("uploadFile");

// Add an event listener for form submission
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const file = uploadedFile.files[0];

    if (file) {

        // Check if file type is usable
        if (file.type == "application/json" || file.type == "text/csv"){
            const reader = new FileReader();

            reader.onload = (load) => {
                const fileContents = load.target.result;

                loadText(fileContents);
            }

        } else {
            alert("Please upload either a .CSV or a .JSON")
        }

    }
});

function loadText(file){
    let headding = document.querySelector("h2");
    headding.textContent = (file).toString();
}