function previewMultiple(event) {
    const form = document.querySelector('#formFile');
    form.innerHTML = "";
    let images = document.getElementById("image");
    let btn = document.getElementById("btn");
    let number = images.files.length;

    if (number >= 6) {

        const newDiv = document.createElement("div");
        newDiv.setAttribute("id", "Div1");
        newDiv.innerHTML = "Max 6 images!";
        newDiv.style.color = 'red';
        images.parentNode.insertBefore(newDiv, images.nextSibling);
        btn.disabled = true;

    } else {
        btn.disabled = false;
        // warning.remove();
        for (i = 0; i < number; i++) {
            var urls = URL.createObjectURL(event.target.files[i]);
            document.getElementById("formFile").innerHTML += '<img src="' + urls + '">';
        }
        document.getElementById("Div1").outerHTML = "";

    }

}

// function previewMultiple(event) {
//     const form = document.querySelector('#formFile');
//     form.innerHTML = "";
//     var images = document.getElementById("image");
//     var number = images.files.length;
//     for (i = 0; i < number; i++) {
//         var urls = URL.createObjectURL(event.target.files[i]);
//         form.innerHTML += '<img src="' + urls + '">';
//     }
// }