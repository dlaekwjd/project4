$(document).ready(function () {
  /* 네비게이션 */
  $('#header .open_btn').on('click', function (e) {
    e.preventDefault();
    $(this).next().show().stop().animate({bottom:0});

    $('#gnb .close_btn').on('click', function (e) {
        e.preventDefault();
        $(this).parent().hide().stop().animate({bottom:'100%'});
    });

    var $open_btn = $(this);
    $first = $('#gnb [data-link=first]');
    $last = $('#gnb [data-link="last"]');

    $(this).next().show();
    $first.focus();

    $last.on('click', function () {
      $(this).parent().hide();
      $open_btn.focus();
    });

    $first.on('keydown', function (e) {
      if (e.keyCode == 9 && e.shiftKey) {
        e.preventDefault();
        $last.focus();
      }
    });

    $last.on('keydown', function (e) {
      if (e.keyCode == 9 && !e.shiftKey) {
        e.preventDefault();
        $first.focus();
      }
    });
    

  });	
  /* onepage scrolling */
  var $menu = $('#indicator ul li');
  var $cnt = $('#container section');
  var headerHei = $('#header').outerHeight();
  //console.log(headerHei);
  var cntPosT; //#cnt1~#cont6의 offset().top 을 통해 배열에 저장
  var total = $cnt.size(); //6
  var tgIdx = 0; //현재 보여질 section의 인덱스 번호
  var timerResize = 0; //누적되는 resize 이벤트의 실행문을 최소화 하기 위해
  var timerScroll = 0; //누적되는 scroll 이벤트의 실행문을 최소화 하기 위해
  var timerWheel = 0; //누적되는 mousewheel 이벤트의 실행문을 최소화 하기 위해

  //초기설정 : 첫번째 indicator li에 .on 추가
  $menu.eq(0).addClass('on');

  //윈도우창 사이즈의 변경이 있을때마다 $cnt의 높이값을 지정
  $(window).on('resize', function () {
    clearTimeout(timerResize);
    setTimeout(function () {
      //$cnt의 높이값을 지정
      var cntHei = $(this).height();
      //console.log(cntHei);
      $cnt.css({
        height: cntHei
      });

      //창의 높이가 달라질때마다 offset().top도 달라지므로 resize 이벤트 내부에 선언
      //#cnt1~#cnt6의 offset().top 할당
      cntPosT = new Array(total);
      for (var i = 0; i < total; i++) {
        cntPosT[i] = $cnt.eq(i).offset().top - headerHei; // *#header가 fixed 속성으로 고정되어 있어서 헤더의 높이만큼 스크롤바는 적게 움직여야 컨텐츠 모두가 보여진다.
      }
      //console.log(cntPosT);

      /*  
      추가 : 창사이즈를 변경해도 활성화된 인디케이터와 같은 섹션이 보여지도록 
      1) 현재 활성화된 li의 인덱스번호를 변수에 저장
      2) offset().top을 저장한 배열에서 1번의 인덱스번호에 해당하는 값을 변수에 저장
      3) 애니메이트 시켜서 위치 이동
      */
      var onIdx = $('#indicator ul li.on').index();
      var tgPos = cntPosT[onIdx];
      //console.log(onIdx, tgPos);
      $(window).off('scroll');
      $('html, body').stop().animate({
        scrollTop: tgPos
      }, 400, function () {
        $(window).on('scroll', scrollMove);
      });

    }, 50);
  });
  $(window).trigger('resize');

  //인디케이터 click 이벤트 => indicator li에 .on 클래스 제거, 배열에 저장된 offset().top 위치로 문서전체를 animate();
  $menu.children().on('click', function (e) {
    e.preventDefault();
    if ($('html, vody').is(':animated')) return false;

    tgIdx = $(this).parent().index();
    $(this).parent().addClass('on').siblings().removeClass('on');
    $(window).off('scroll'); //클릭한 인디케이터 중간에 끼어있는 li는 활성과 비활성을 일으키기 때문에 제어하기 위해 scroll 이벤트를 off메서드 이용하여 강제 해제
    $('html, body').stop().animate({
      scrollTop: cntPosT[tgIdx]
    }, 400, function () {
      $(window).on('scroll', scrollMove); //클릭 후 스크롤을 직접 움직이는 경우에 대비해 다시 스크롤 이벤트 연결
    });
  });

  //3) 스크롤바를 스스로 움직이는 경우 : 인디케이터 li.on 클래스만 제어(스크롤을 직접 움직여 수동으로 애니메이트를 일으키고 있으므로)
  $(window).on('scroll', scrollMove);

  function scrollMove() {
    clearTimeout(timerScroll);
    setTimeout(function () {
      var scrollT = $(this).scrollTop();
      //console.log(scrollT);
      $menu.each(function (idx) {
        if (scrollT >= cntPosT[idx]) $(this).addClass('on').siblings()
          .removeClass('on');
      });
    }, 100);
  }

  /* 
    4) 마우스 휠 제어 : delta값을 변수에 저장
        마우스 휠을 아래로 내리는 경우 :  delta가 마이너스, tgIdx++(total-1보다 작을 경우만)
        마우스 휠을 위로 올리는 경우 :  delta가 플러스,  tgIdx--(0보다 클경우만 가능)
        파이어폭스브라우저 : DOMMouseScroll 이벤트
          e.originalEvent.detail(파이어 폭스만 내리면 +, 올리면 -여서 음수를 곱해서 나머지 브라우저와 동일하게 추가)
  */
  $cnt.on('mousewheel DOMMouseScroll', function (e) {
    clearTimeout(timerWheel);
    setTimeout(function () {
      if ($('html, body').is(':animated')) return false;

      var delta = e.originalEvent.wheelDelta || e.originalEvent.detail * -1;
      //console.log(delta);     //음수 : 휠내리기, 양수 : 휠올리기

      if (delta < 0 && tgIdx < total - 1) { //down
        tgIdx++;
        //console.log(tgIdx, delta, '휠 내리기')
      } else if (delta > 0 && tgIdx > 0) { //up
        tgIdx--;
        //console.log(tgIdx, delta, '휠 올리기')
      }
      //배열 [tgIdx]에 있는 값으로 animate()
      $('html, body').stop().animate({
        scrollTop: cntPosT[tgIdx]
      }, 400);
    }, 200);
  });

  /* 
    5) keydown 이벤트로 키보드 상하 방향키 제어
    ↓ 방향키 : e.keyCode = 40,  tgIdx++(total-1(5)보다 작을 경우만) 
    ↑ 방향키 : e.keyCode = 38,  tgIdx--(0보다 클경우만 가능) 
  */
  $(document).on('keydown', function (e) {
    if ($('html, body').is(':animated')) return false;
    //console.log(e.keyCode);
    if (e.keyCode == 40 && tgIdx < total - 1) tgIdx++;
    else if (e.keyCode == 38 && tgIdx > 0) tgIdx--;
    $('html, body').stop().animate({
      scrollTop: cntPosT[tgIdx]
    }, 400);
  });

  /* section 1 슬라이드 제어 */
  var $slider = $('#mainSlider');
  var $visEle = $slider.find('> .visual > li');
  var $indiEle = $slider.find('> .paging li');
  var current = 0; //현재 보여지는 .visual > li의 인덱스 번호
  var nextNum; //다음에 보여질 컨텐츠의 인덱스 번호(클릭한 인디케이터의 인덱스번호)
  var timer;

  //초기설정 : 비주얼과 인디케이터의 첫번째 li에 .on 추가하기
  $visEle.eq(0).add($indiEle.eq(0)).addClass('on');

  //1) 인디케이터 (a) 클릭 이벤트
  $indiEle.children().on('click', function (e) {
    e.preventDefault();
    nextNum = $(this).parent().index();
    console.log(nextNum);

    //추가제어 1) 자동실행 멈춤
    clearInterval(timer);
    //추가제어 2) 현재 보여지는 슬라이더는 다시 클릭하지 못하게
    if (current == nextNum) return false;

    //.indicator li에 .on 제어, .visual li animate()
    active();
  });

  function active() {
    //a) .visual li와 .indicator li => .on 클래스명 제어
    $visEle.eq(nextNum).addClass('on').siblings().removeClass('on');
    $indiEle.eq(nextNum).addClass('on').siblings().removeClass('on');

    //b) .visual li => animate() : 기존 투명도 1에서 0, 지금 클릭한것 0 에서 1
    $visEle.eq(current).stop().animate({
      opacity: 0,
      filter: 'Alpha(opacity=0)'
    }, 400)
    $visEle.eq(nextNum).stop().animate({
      opacity: 1,
      filter: 'Alpha(opacity=100)'
    }, 400)

    current = nextNum;
  }

  //2) 자동실행 함수
  function playTimer() {
    timer = setInterval(function () {
      nextNum = current + 1; //증감연산을 작성하면 오류, 현재 nextNum의 값은 0,1,2
      if (nextNum == 3) nextNum = 0;

      //.visual li와 .indicator li에 .on 제어, .visual li animate()
      active();
    }, 4000);
  }
  playTimer();

  //3) 슬라이더로 마우스가 진입하거나 포커스가 오면 자동실행 멈추기
  $slider.on({
    'mouseenter focusin': function () {
      clearInterval(timer);
    },
    'mouseleave': function () {
      playTimer();
    }
  });
  $slider.find('[data-link="first"]').on('keydown', function (e) {
    if (e.shiftKey && e.keyCode == 9) playTimer();
  });
  $slider.find('[data-link="last"]').on('keydown', function (e) {
    if (!e.shiftKey && e.keyCode == 9) playTimer();
  });

  /* cnt2 bestmenu */
  var $tab = $('.tab');

  /* 1) 초기설정 2가지
  .btnwrap의 첫번째 li.on => 자식 button 태그에  aria-selected 속성 제어
  .cntwrap > div중 첫번째만 보여지고 나머지는 숨기기 => aria-hidden 속성 제어 */
  $tab.find('.btnwrap li:first-child').addClass('on').children().attr('aria-selected', true).parent().siblings().children().attr('aria-selected', false);
  $tab.find('.cntwrap > div:first-child').show().attr('aria-hidden', false).siblings().hide().attr('aria-hidden', true);

  //2) 탭버튼 클릭
  $tab.find('.btnwrap li a').on('click', function (e) {
    e.preventDefault();
    var tgNum = $(this).parent().index(); //onepage scrolling과 충돌로 변수명 변경 tgIdx => tgNum
    //console.log(tgNum);

    //3) .btnwrap li에게 선택된 것은 .on 추가하고 나머지는 .on 제거 => 자식태그에 aria-selected 제어
    $(this).attr('aria-selected', true).parent().addClass('on').siblings().removeClass('on').children().attr('aria-selected', false);

    //4) 상세 div가 보여질 것과 숨길것 제어 => aira-hidden도 제어
    $(this).closest('.tab').find('.cntwrap > div').eq(tgNum).show().attr('aria-hidden', false).siblings().hide().attr('aria-hidden', true);
    console.log();

    //슬라이더 함수 호출
    multiSlider (tgNum);
  });

  /* #cnt3 : NEW MENU 탭 - 슬라이더  */
  //최초 전체 탭메뉴(0)를 우선 활성화
  multiSlider (0);

  //복제, 삽입
  for (var i = 0; i < 5; i++) {
    var $tgCnt = $('#newTab .cntwrap > div').eq(i); //#newCnt1 ~ #newCnt5
    //복제
    var $front = $tgCnt.find('ul li').eq(2).nextAll().clone().attr({class: 'frontcopy'});
    var $back = $tgCnt.find('ul li:nth-child(0), ul li:nth-child(1), ul li:nth-child(2), ul li:nth-child(3)').clone().attr({class: 'backcopy'});
    $tgCnt.find('ul').prepend($front).append($back);
  }

	var prevClass;
	var nowClass;
	var $body = $('body');
	var liWid; //li 하나의 너비
	var winWidth; //윈도우 너비
	var once; //한번에 보여질 li 개수
	var onceMove;

	$(window).on('load resize', function () {
		var $tgCntList = $('#newTab .cntwrap > div ul');
		liWid = $tgCntList.children().outerWidth(true);
		$tgCntList.css({width: liWid * 12, marginLeft: liWid * 3 * -1}); //복제하기 전 첫번째 li가 우선 보여지기 marginLeft을 마이너스로 제어
		//console.log(liWid * 12, liWid * 3 * -1);

		prevClass = $body.attr('class');
		winWidth = $(this).width();

		//해상도별 body에 클래스명 추가하기
		if (winWidth <= 768) $body.removeClass().addClass('mobile');
		else if (winWidth <= 1280) $body.removeClass().addClass('tablet');
		else $body.removeClass().addClass('pc');

		nowClass = $body.attr('class');
		//console.log(prevClass, nowClass);

		//디바이스의 변경 체크 : 스크립트로 추가한 스타일을 removeAttrr('style')로 제거해서 디바이스의 충돌이 일어나지 않게 하고 다시 width, margin-left를 재 지정함 => 가장 처음 슬라이더로 이동시켜 놓음
		if (prevClass != nowClass) {
			$tgCntList.removeAttr('style').css({width: liWid * 12, marginLeft: liWid * 3 * -1});
		}

		if ($(window).width() <= 768) {
			once = 1; //한번에 보여질 li 개수
		} else {
			once = 3; //한번에 보여질 li 개수
		}
		/*		*/
		if ($(window).width() <= 768) {
			 $tgCntList.find('li').eq(3).attr({'aria-hidden': false}).siblings().attr({'aria-hidden': true});
			once = 1; //한번에 보여질 li 개수
		} else {
			$tgCntList.find('li').attr({'aria-hidden': true});
			$tgCntList.find('li').eq(2).nextUntil($tgCntList.find('li').eq(6)).attr({'aria-hidden': false});
			once = 3; //한번에 보여질 li 개수
		}

		onceMove = once * liWid; //한번에 움직일 크기

	}); //$(window).on('load resize')

    function multiSlider(getIdx) {
		var $tgCnt = $('#newTab .cntwrap > div').eq(getIdx); //#newCnt1 ~ #newCnt5
		var totalNum = 12; //앞3복제, 뒤3복제로 li 개수가 12개로 늘어남
		var start = 3;
		var current = 3; //슬라이더 복제후 현재 인덱스 번호 저장 : 3,6만 가능함
		//console.log(getIdx, $tgCnt.attr('id'), liWid, once, onceMove, totalNum, liWid * 12);

		//이전 클릭 이벤트
        $tgCnt.find('.prev_next .prev').on('click', function (e) {
          e.preventDefault();
          if ($tgCnt.find('ul').is(':animated')) return false;

          current -= once;
          $tgCnt.find('ul li').attr({'aria-hidden': true});

          if (winWidth <= 768) {
            if (current < start) {
              current = 8; //total - once*4	
              $tgCnt.find('ul').css({
                marginLeft: (current + 1) * -liWid
              });
              console.log(current, liWid, (totalNum - once) * -liWid);
            }
            $tgCnt.find('ul li').eq(current).attr({'aria-hidden': false});
            $tgCnt.find('ul').stop().delay(100).animate({marginLeft: current * -liWid});
          } else {
            if (current < start) {
              current = 6; //total - once*2
              $tgCnt.find('ul').css({marginLeft: (current + 3) * -liWid});
            }
            $tgCnt.find('ul li').eq(current - 1).nextUntil($tgCnt.find('ul li').eq(current + 3)).attr({'aria-hidden': false});
            $tgCnt.find('ul').stop().delay(100).animate({marginLeft: current * -liWid});
          }
        }); //이전 클릭

		//다음 클릭 이벤트
        $tgCnt.find('.prev_next .next').on('click', function (e) {
          e.preventDefault();
          if ($tgCnt.find('ul').is(':animated')) return false;

          current += once;
          $tgCnt.find('ul li').attr({'aria-hidden': true});

          if (winWidth <= 768) {
            if (current > 8) { //total - once*4
              current = start;
              $tgCnt.find('ul').css({marginLeft: liWid * 2 * -1});
            }
            console.log(current);
            $tgCnt.find('ul li').eq(current).attr({'aria-hidden': false});
            $tgCnt.find('ul').stop().delay(100).animate({marginLeft: current * -liWid});
          } else {
            if (current > 6) { //total - once*2
              current = start;
              $tgCnt.find('ul').css({marginLeft: 0});
            }
            $tgCnt.find('ul li').eq(current - 1).nextUntil($tgCnt.find('ul li').eq(current + 3)).attr({'aria-hidden': false});
            $tgCnt.find('ul').stop().delay(100).animate({marginLeft: current * -liWid});
          }
        });		//다음 버튼 클릭
    }

});
	/*
	  접근성추가
	  마크업 <div class="slider" aria-live="polite">
	  클릭시 스크립트 제어 => 보여지는 li만 aria-hidden: false, 나머지는 aria-hidden: true

	  ※ 실시간  aria-live="  "
	  aria-live 속성은 실시간으로 내용을 갱신하는 영역을 의미합니다. 
	  값으로 polite, assertive, off(default)를 설정할 수 있으며 갱신하는 내용의 중요도에 따라 선택합니다. 
	  갱신 영역에 polite, assertive값을 사용하면 갱신하는 순간 보조기기는 사용자에게 내용을 전달합니다. 
	  polite값은 중요도가 낮은 내용에 사용하여 현재 진행중인 음성 또는 타이핑을 방해하지 않고 뒤늦게 전달합니다. 
	  assertive값은 중요도가 높은 내용에 사용하여 현재 진행중인 보조기기 작업을 중단하고 갱신 내용을 즉시 사용자에게 전달합니다. 사용자의 현재 작업을 방해할 수 있기 때문에 중요도가 높은 내용을 선별하여 신중하게 적용해야 합니다.
	 */