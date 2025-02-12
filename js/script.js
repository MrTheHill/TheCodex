document.getElementById('uploadedFile').addEventListener('change', onChange);

function onChange(event) {
    var reader = new FileReader();
    reader.onload = readerLoad;
    reader.readAsText(event.target.files[0]);
}

function readerLoad(event){
    console.log(event.target.result);
    var obj = JSON.parse(event.target.result);
    loadText(obj)
}

function loadText(file){
    let heading = document.querySelector("h2");
    heading.innerHTML = `<pre>${JSON.stringify(file, null, 2)}</pre>`;
}