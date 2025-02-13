// -------------------------------------------- V Loading from JSON V --------------------------------------------
document.getElementById('uploadedFile').addEventListener('change', onChange); //Event listener for when a file gets uploaded

function onChange(event) {
    
    //Validate file type
    const file = event.target.files[0];
    if (!file || file.type !== "application/json") {
        alert("Please upload a valid JSON file.");
        return;
    }


    let reader = new FileReader();
    reader.onload = readerLoad;
    reader.readAsText(file);
}

function readerLoad(event){
    console.log(event.target.result);
    let obj = JSON.parse(event.target.result);
    loadText(obj.data, "h2")
}

function loadText(data, location){
    let heading = document.querySelector(location);
    heading.innerHTML = `<pre>${(JSON.stringify(data, null, 2)).replace(/[{},"]/g, '')}</pre>`;
}

// -------------------------------------------- V Loading from JSON V --------------------------------------------