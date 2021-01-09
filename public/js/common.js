$(() => {

    var toggle = -1;
   
    $('.side-nav-button').click( function () {
        toggle *= -1;
        if (toggle === -1) {
            $('#profile-sidebar').css({'display':'none'});
            $('.fa-chevron-left').css({'display': 'none'});
            $('.fa-chevron-right').css({'display': 'block'});
            $('#main').css({'padding-left' : '0'});
            $('#sidebar-nav').css({'left' : '10px'});
            $('.ace_editor').width($('.card').width());
        }
        else {
            $('#profile-sidebar').css({'display':'block'});
            $('.fa-chevron-right').css({'display': 'none'});
            $('.fa-chevron-left').css({'display': 'block'});
            $('#main').css({'padding-left' : '15%' });
            $('#sidebar-nav').css({'left' : $('#profile-sidebar').width() + 10 });
            $('.ace_editor').width($('.card').width());
        }
    });
});