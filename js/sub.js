$(document).ready(function (){
    //snb navigation
    var $snb = $('#pcSnb > ul');
    var $snbDep2 = $snb.find('> li > div');

    var dep1 = $('body').data('dep-one') - 1;
    var dep2 = $('body').data('dep-two') - 1;
    $snbDep2.hide();
    $snb.find('>li').on('mouseenter focusin', function () {
        $snbDep2.stop().slideDown();
        $(this).addClass('on').add().siblings().removeClass('on');
    });
    $snb.on('mouseleave', gnbReturn);
    if (dep1 >= 0) gnbReturn();
    $snb.find('a:first, a:last').on('blur', function () {
        setTimeout(function () {
            if (!$snb.find('a').is(':focus')) gnbReturn();
        }, 10);
    });

    function gnbReturn() {
        $snbDep2.stop().slideUp();
        $snb.find('>li.on').removeClass('on');
        if (dep1 >= 0) $snb.find("> li").eq(dep1).addClass('on').find('div ul li').eq(dep2).addClass(
            'on');
    }
  
    //모바일 네비게이션
    $('#header .open_btn').on('click', function (e) {
        e.preventDefault();
        $(this).parent().siblings('#mSnb').show().stop().animate({bottom:0});

        $('#mSnb .close_btn').on('click', function (e) {
        e.preventDefault();
            $(this).parent().show().stop().animate({bottom:'100%'});
        });
    });
});