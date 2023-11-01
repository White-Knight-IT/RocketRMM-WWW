(function () {
    window.addEventListener("load", function () {
        setTimeout(function () {
            var logo = document.getElementsByClassName('link'); //For Changing The Link On The Logo Image
            logo[0].children[0].alt = "FFPP Swagger";
            logo[0].children[0].src = "/swagger/img/swagger.svg"; //For Changing The Logo Image
        });
    });
})();
