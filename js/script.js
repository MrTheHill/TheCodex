let json = {} // stores the json data globally so it can be accessed by all code

// -------------------------------------------- V Loading from JSON V --------------------------------------------

document.getElementById('uploadData').addEventListener('submit', handleUpload);

function handleUpload(event) {
    event.preventDefault(); // stops form submission

    const fileInput = document.getElementById('fileUpload');
    securityManager.setMasterPass(document.getElementById('masterPass').value.trim());

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
    
    json = JSON.parse(event.target.result);
    const key = json.master
    const master = document.getElementById('masterPass').value.trim();

    if (securityManager.masterHash(master) != key){
        alert("Password is incorrect, plaese try again");
        return; 
    }
    
    toggleElements(["JSONUploadForm"], "hide");
    toggleElements(["exportButton", "viewPasswordTable", "showAddNew"], "show");
    alert("Data loaded successfully");

    loadTable(Object.values(json.data))
}

function loadTable(dataArray){
    // sort the data alphabetically by service - looks nice
    dataArray.sort((a, b) => a.service.localeCompare(b.service));

    // selects the table body and clears any current data in case there was already anything saved
    const tbody = document.querySelector("#passwordTable tbody");
    tbody.innerHTML = "";

    // populates the table with the data from the json
    dataArray.forEach(entry => {
        const decryptedPassword = securityManager.decrypt(entry.password);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.service}</td>
            <td>${entry.username}</td>
            <td>${decryptedPassword}</td>
        `;
        tbody.appendChild(row);
    });
}

document.getElementById('startNewVault').addEventListener('click', showNewVaultForm);

function showNewVaultForm(){
    toggleElements(["JSONUploadForm"], "hide");
    toggleElements(["createNewVault"], "show");
}

document.getElementById('createNewVaultForm').addEventListener('submit', startNewVault);

function startNewVault(event){
    event.preventDefault();

    const masterKey = document.getElementById('masterKey').value.trim();
    const confirmKey = document.getElementById('confirmKey').value.trim();

    if (!masterKey || !confirmKey) {
        alert("Please enter you key in both fields");
        return;
    }

    if (masterKey !== confirmKey) {
        alert("Passwords do not match");
        return;
    }

    json = { master: securityManager.masterHash(masterKey), data: {} };    
    securityManager.setMasterPass(masterKey);

    toggleElements(["createNewVault"], "hide");
    toggleElements(["exportButton", "viewPasswordTable", "showAddNew"], "show");
    alert("Data loaded successfully");

    loadTable(Object.values(json.data))
}
// -------------------------------------------- V Master Password checks  V --------------------------------------------

const securityManager = (function() {
    let masterPass = null;

    // set the masterPassword variable to be used by the rest of the functions
    function setMasterPass(password) {
        masterPass = password;
    }

    // hashes the master password to be compared against the hash saved in the JSON
    function masterHash(password){
        return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    }

    function encrypt(password) {
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

    return { setMasterPass, masterHash, encrypt, decrypt };
})();

// -------------------------------------------- V Adding passwords V --------------------------------------------

document.getElementById('newPassword').addEventListener('submit', addPassword);

function addPassword(event) {  
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

    const encryptedPassword = securityManager.encrypt(password);

    json.data[getNewID()] = { service: service, username: username, password: encryptedPassword };

    loadTable(Object.values(json.data));
    document.getElementById('newPassword').reset();

    toggleElements(["showAddNew"], "show");
    toggleElements(["addNewPasswordForm"], "hide");
}

function getNewID(){
    const existingIds = new Set(Object.keys(json.data).map(Number));
    let newId = 1;

    while (existingIds.has(newId)) {
        newId++;
    }

    return newId;
}

// -------------------------------------------- V Exporting to JSON V --------------------------------------------

document.getElementById('saveData').addEventListener('click', exportPasswords);

function exportPasswords() {
    const date = getDate();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `TheCodex - Vault(${date}).json`;
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

function getDate(){ // returns DD-MM-YYYY - used when saving JSON
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    if (month < 10) {
        month = '0' + month;
    }
    if (day < 10) {
        day = '0' + day;
    }

    return `${day}-${month}-${year}`;
}

document.getElementById('showAddNewButton').addEventListener('click', displayAddNewForm);

function displayAddNewForm(){
    toggleElements(["addNewPasswordForm"], "show");
    toggleElements(["showAddNew"], "hide");
}