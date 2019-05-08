// initialize and configuration for wow js - animations
wow = new WOW({
    animateClass: 'animated',
    offset: 150,
    mobile: false,
    live: true,
    callback: function(box) {
        //console.log("WOW: animating <" + box.tagName.toLowerCase() + ">")
    }
});
wow.init();

// initialize tooltips and popovers
$(function() {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle=popover]').popover();
})

$(window).scroll(function() {
    if ($(window).scrollTop() >= $(window).height()) {
        $('.header').addClass('fixed-header');
    } else {
        $('.header').removeClass('fixed-header');
    }
});

// COUNTDOWN
$('#countdown').countdown('2018/03/10', function(event) {
    var $this = $(this).html(event.strftime(''
        //+ '<li><span>%w</span> weeks</li> '
        +
        '<li><span>%D</span> days</li> ' +
        '<li><span>%H</span> hr</li> ' +
        '<li><span>%M</span> min</li> ' +
        '<li><span>%S</span> sec</li>'));
});

// js counters
$('#about-counter').bind('inview', function(event, visible, visiblePartX, visiblePartY) {
    if (visible) {
        $(this).find('.timer').each(function() {
            var $this = $(this);
            $({
                Counter: 0
            }).animate({
                Counter: $this.text()
            }, {
                duration: 2000,
                easing: 'swing',
                step: function() {
                    $this.text(Math.ceil(this.Counter));
                }
            });
        });
        $(this).unbind('inview');
    }
});

 
//home slider
var swiper = new Swiper('.home-slider', {
    pagination: '.home-slider-pagination',
    paginationClickable: true,
    nextButton: '.home-slider-next',
    autoPlay: true,
    prevButton: '.home-slider-prev'
});
// FEATURED PRODUCT SLIDER
   var swiper = new Swiper('.featured', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        slidesPerView: 3,
        spaceBetween: 30,
              nextButton: '.swiper-button-next2',
        prevButton: '.swiper-button-prev2',
        breakpoints: {

            1024: {
                slidesPerView: 3,
                spaceBetween: 30
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 30
            },
            640: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            480: {
                slidesPerView: 1,
                spaceBetween: 10
            }
        }
    });

// SPECIAL PRODUCT SLIDER
   var swiper = new Swiper('.specials', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        slidesPerView: 4,
        spaceBetween: 30,
        nextButton: '.special-next',
        prevButton: '.special-prev',
        breakpoints: {

            1024: {
                slidesPerView: 3,
                spaceBetween: 30
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 30
            },
            640: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            480: {
                slidesPerView: 1,
                spaceBetween: 10
            }
        }
    });

//post slider
var swiper = new Swiper('.post-slider', {
    pagination: '.post-pagination',
    paginationClickable: true,
    nextButton: '.post-slider-next',
    prevButton: '.post-slider-prev',
    slidesPerView: 3,
    spaceBetween: 30,
    breakpoints: {
        1024: {
            slidesPerView: 2,
            spaceBetween: 30
        },
        768: {
            slidesPerView: 2,
            spaceBetween: 30
        },
        640: {
            slidesPerView: 1,
            spaceBetween: 30
        },
        320: {
            slidesPerView: 1,
            spaceBetween: 30
        }
    }
});

//brands slider
var swiper = new Swiper('.brands-slider', {
    slidesPerView: 6,
    slidesPerColumn: 1,
    pagination: '.brands-pagination',
    paginationClickable: true,
    nextButton: '.brands-slider-next',
    prevButton: '.brands-slider-prev',
    spaceBetween: 30,
    breakpoints: {
        1024: {
            slidesPerView: 4,
            spaceBetween: 30
        },
        768: {
            slidesPerView: 3,
            spaceBetween: 30
        },
        640: {
            slidesPerView: 2,
            spaceBetween: 20
        },
        320: {
            slidesPerView: 1,
            spaceBetween: 10
        }
    }
});


// swiper config for each offer slider (listings)
var swiper = new Swiper('.offer-slider', {
    // spaceBetween: 0,
    // observer:true,
    // observeParents:true
});

// allow to multiple instances of swiper one the one page / offer listing
$(".offer-slider").each(function(index, element) {
    var $this = $(this);
    $this.addClass("instance-" + index);
    $this.find(".offer-pagination-prev").addClass("btn-prev-" + index);
    $this.find(".offer-pagination-next").addClass("btn-next-" + index);
    var swiper = new Swiper(".instance-" + index, {
        // your settings ...
        spaceBetween: 0,
        spaceBetween: 0,
        observer: true,
        observeParents: true,
        nextButton: ".btn-next-" + index,
        prevButton: ".btn-prev-" + index,
    });
});

 

 