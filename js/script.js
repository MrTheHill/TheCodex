// -------------------------------------------- V Loading from JSON V --------------------------------------------
document.getElementById('uploadData').addEventListener('submit', handleUpload);

function handleUpload(event) {
    event.preventDefault(); // stops form submission

    const fileInput = document.getElementById('fileUpload');
    const masterPass = document.getElementById('masterPass').value.trim();

    // Checks if all required data is entered
    if (!fileInput.files.length || !masterPass) {
        alert("Please upload a file and enter your key");
        return;
    }
    
    //Validate file type
    const jsonFile = fileInput.files[0];
    if (!jsonFile || jsonFile.type !== "application/json") {
        alert("Please upload a valid JSON file");
        return;
    }


    let reader = new FileReader();
    reader.onload = readerLoad;
    reader.readAsText(jsonFile);
}

function readerLoad(event){
    console.log(event.target.result);
    let obj = JSON.parse(event.target.result);
    const key = obj.key
    loadText(obj.data, "h2")
}

function loadText(data, location){ // Loads contents of file onto page
    let heading = document.querySelector(location);
    heading.innerHTML = `<pre>${(JSON.stringify(data, null, 2)).replace(/[{},"]/g, '')}</pre>`;
}

// -------------------------------------------- V Master Password checks  V --------------------------------------------





// -------------------------------------------- V Data encryption & decryption V --------------------------------------------

function encrypt(input, key){
    return CryptoJS.AES.encrypt(input, key).toString();
}

function decrypt(input, key){
    const bytes = CryptoJS.AES.decrypt(input, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}