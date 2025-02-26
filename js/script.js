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
    
    let obj = JSON.parse(event.target.result);
    const key = obj.master
    const master = document.getElementById('masterPass').value.trim();

    if (master != key){
        alert("Password was incorrect");
        return; 
    }
    
    //loadText(obj.data, "h2");
    //console.log(event.target.result);
    const dataArray = Object.values(obj.data); // Convert the object into an array
    loadTable(dataArray)
}

function loadText(data, location){ // Loads contents of file onto page
    let heading = document.querySelector(location);
    heading.innerHTML = `<pre>${(JSON.stringify(data, null, 2)).replace(/[{},"]/g, '')}</pre>`;
}

function loadTable(dataArray){
    const tbody = document.querySelector("#passwordTable tbody");
    tbody.innerHTML = "";

    dataArray.forEach(entry => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.service}</td>
            <td>${entry.username}</td>
            <td>${entry.password}</td>
        `;
        tbody.appendChild(row);
    });
}
// -------------------------------------------- V Master Password checks  V --------------------------------------------





// -------------------------------------------- V Data encryption & decryption V --------------------------------------------

function generateSalt() {
    return CryptoJS.lib.WordArray.random(16).toString();
}

function makeKey(masterPassword, salt) {
    return CryptoJS.PBKDF2(masterPassword, salt, { keySize: 256 / 32 }).toString();
}

function encrypt(input){
    let salt = generateSalt();
    let key = makeKey(master, salt)
    let encryptedPassword = CryptoJS.AES.encrypt(input, key).toString();
    return { encryptedPassword, salt }
}

function decrypt(input, key){
    const bytes = CryptoJS.AES.decrypt(input, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}