document.getElementById('uploadedFile').addEventListener('change', onChange);

function onChange(event) {
    var reader = new FileReader();
    reader.onload = readerLoad;
    reader.readAsText(event.target.files[0]);
}

function readerLoad(event){
    console.log(event.target.result);
    var obj = JSON.parse(event.target.result);
    loadText(obj.username)
}

function loadText(file){
    let headding = document.querySelector("h2");
    headding.textContent = (file);
}