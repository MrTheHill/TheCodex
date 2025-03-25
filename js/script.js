let json = {} // stores the json data globally so it can be accessed by all code

document.getElementById('uploadData').addEventListener('submit', handleUpload);
document.getElementById('newPassword').addEventListener('submit', addPassword);
document.getElementById('createNewVaultForm').addEventListener('submit', startNewVault);

document.getElementById('saveData').addEventListener('click', exportPasswords);
document.getElementById('showAddNewButton').addEventListener('click', displayAddNewForm);
document.getElementById('startNewVault').addEventListener('click', displayNewVaultForm);
document.getElementById('closeAddNewPasswordForm').addEventListener('click', closeAddNewForm);

function handleUpload(event) { // triggered when user uploads the json file
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

function loadTable(data){ // triggered when the password table is shown/refreshed
    // sort the data alphabetically by service - looks nice
    data.sort((a, b) => a.service.localeCompare(b.service));

    // selects the table body and clears any current data in case there was already anything saved
    const tbody = document.querySelector("#passwordTable tbody");
    tbody.innerHTML = "";

    // populates the table with the data from the json, decrypting passwords as it goes
    data.forEach(entry => {
        const decryptedPassword = securityManager.decrypt(entry.password, entry.vector);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.service}</td>
            <td>${entry.username}</td>
            <td>${decryptedPassword}</td>
        `;
        tbody.appendChild(row);
    });
}

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

    loadTable(Object.values(json.data))
}

function logout(){ // purges data and reloads the page, starting from login screen
    json = {};
    securityManager.setMasterPass(null);

    location.reload();
}

// Closures & IIFE: https://www.geeksforgeeks.org/closure-in-javascript/
// CryptoJS: https://www.misterpki.com/cryptojs/ & https://jsfiddle.net/MrSuS/kwtv6y2d/
const securityManager = (function() {
    let masterPass = null;

    function setMasterPass(password) { // set the masterPassword variable to be used by the rest of the functions
        masterPass = password;
    }

    function masterHash(password){ // hashes the master password to be compared against the hash saved in the JSON
        return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    }

    function encrypt(password) {
        return CryptoJS.AES.encrypt(password, masterPass).toString();
    }

    function decrypt(encrypted) {
        return CryptoJS.AES.decrypt(encrypted, masterPass).toString(CryptoJS.enc.Utf8);
    }

    return { setMasterPass, masterHash, encrypt, decrypt };
})();

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

    json.data[getNewID()] = { service: service, username: username, password: securityManager.encrypt(password)};

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

// https://stackoverflow.com/questions/25547475/save-to-local-file-from-blob?#tab-top
function exportPasswords() {
    const date = getDate();
    const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
    
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `TheCodex - Vault(${date}).json`;
    a.click();

    logout();
};


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

function displayAddNewForm(){
    toggleElements(["addNewPasswordForm"], "show");
    toggleElements(["showAddNew"], "hide");
}

function displayNewVaultForm(){
    toggleElements(["JSONUploadForm"], "hide");
    toggleElements(["createNewVault"], "show");
}

function closeAddNewForm(){
    toggleElements(["addNewPasswordForm"], "hide");
    toggleElements(["showAddNew"], "show");
}