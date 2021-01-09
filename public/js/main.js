// API to get the ip address of the current person who loaded this page 
window.onload = function () {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://api.ipify.org?format=jsonp&callback=DisplayIP";
    document.getElementsByTagName("head")[0].appendChild(script);
};

// Function to post the obtained ip address to the server 
function DisplayIP(response) {
	$.post('/ip', { ip: response.ip });
}

$(document).ready(() => {
    $('.scrollspy').scrollSpy({
        scrollOffset: $('header').height()  
    });

    $(".button-collapse").sideNav();
});