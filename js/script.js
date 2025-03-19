let obj = {} // global
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
    
    obj = JSON.parse(event.target.result);
    const key = obj.master
    const master = document.getElementById('masterPass').value.trim();

    if (masterHash(master) != key){
        alert("Password was incorrect");
        return; 
    }
    
    toggleElements(["JSONUploadForm"], "hide");
    toggleElements(["exportButton", "viewPasswordTable", "showAddNew"], "show");
    alert("Data loaded successfully");

    loadTable(Object.values(obj.data))
}

function loadTable(dataArray){
    // sort the data alphabetically by service - looks nice
    dataArray.sort((a, b) => a.service.localeCompare(b.service));

    // selects the table body and clears any current data in case there was already anything saved
    const tbody = document.querySelector("#passwordTable tbody");
    tbody.innerHTML = "";

    // populates the table with the data from the json
    dataArray.forEach(entry => {
        const decryptedPassword = decrypt(entry.password);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.service}</td>
            <td>${entry.username}</td>
            <td>${decryptedPassword}</td>
        `;
        tbody.appendChild(row);
    });
}

// -------------------------------------------- V Master Password checks  V --------------------------------------------

function masterHash(password){
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
}

// -------------------------------------------- V Data encryption & decryption V --------------------------------------------

function encrypt(password) {
    const masterPass = document.getElementById('masterPass').value.trim();

    const salt = CryptoJS.lib.WordArray.random(16);
    const key = CryptoJS.PBKDF2(masterPass, salt, { keySize: 256 / 32, iterations: 10000 });
    const iv = CryptoJS.lib.WordArray.random(16);

    const encrypted = CryptoJS.AES.encrypt(password, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });

    const combined = salt.concat(iv).concat(encrypted.ciphertext);

    return CryptoJS.enc.Base64.stringify(combined);
}

function decrypt(encrypted) {
    const masterPass = document.getElementById('masterPass').value.trim();
    const fullCipher = CryptoJS.enc.Base64.parse(encrypted);

    const salt = CryptoJS.lib.WordArray.create(fullCipher.words.slice(0, 4), 16);
    const iv = CryptoJS.lib.WordArray.create(fullCipher.words.slice(4, 8), 16);
    const ciphertext = CryptoJS.lib.WordArray.create(fullCipher.words.slice(8));

    const key = CryptoJS.PBKDF2(masterPass, salt, { keySize: 256 / 32, iterations: 10000 });

    const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext },
        key,
        { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
}

// -------------------------------------------- V Adding passwords V --------------------------------------------

document.getElementById('newPassword').addEventListener('submit', addPassword);

async function addPassword(event) {  
    event.preventDefault();

    const service = document.getElementById('addService').value.trim();
    const username = document.getElementById('addUser').value.trim();
    const password = document.getElementById('addPass').value.trim();
    const confirm = document.getElementById('confirmPass').value.trim();

    if (!service || !username || !password || !confirm) {
        alert("Please fill out all fields.");
        return;
    }
 
    if (confirm !== password) {
        alert("Passwords do not match");
        return;
    }

    const encryptedPassword = encrypt(password);

    obj.data[getNewID()] = { service: service, username: username, password: encryptedPassword };

    loadTable(Object.values(obj.data));
    document.getElementById('newPassword').reset();
    toggleElements(["showAddNew"], "show");
    toggleElements(["addNewPasswordForm"], "hide");
}

function getNewID(){
    const existingIds = new Set(Object.keys(obj.data).map(Number));
    let newId = 1;

    while (existingIds.has(newId)) {
        newId++;
    }

    return newId;
}

// -------------------------------------------- V Exporting to JSON V --------------------------------------------

document.getElementById('saveData').addEventListener('click', exportPasswords);

function exportPasswords() {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `TheCodex - Vault.json`;
    a.click();
};


// -------------------------------------------- V Styling bits V --------------------------------------------

function toggleElements(elements, value){
    elements.forEach(element => {
        element = document.getElementById(element);
        if (value == "show") {
            element.style.display = "block";
            return
        } else if (value == "hide") {
            element.style.display = "none";
            return
        } else {
            return
        }
    });
}

document.getElementById('showAddNewButton').addEventListener('click', displayAddNewForm);

function displayAddNewForm(){
    toggleElements(["addNewPasswordForm"], "show");
    toggleElements(["showAddNew"], "hide");
}