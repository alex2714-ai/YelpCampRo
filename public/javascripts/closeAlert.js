$(document).ready(function () {
    // show the alert
    $(".alert-dismissible").first().hide().slideDown(500).delay(3000).slideUp(500, function () {
        $(this).remove();
    });
});