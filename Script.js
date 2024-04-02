function loco() {
  gsap.registerPlugin(ScrollTrigger);

  // Using Locomotive Scroll from Locomotive https://github.com/locomotivemtl/locomotive-scroll

  const locoScroll = new LocomotiveScroll({
    el: document.querySelector("#main"),
    smooth: true
  });
  // each time Locomotive Scroll updates, tell ScrollTrigger to update too (sync positioning)
  locoScroll.on("scroll", ScrollTrigger.update);

  // tell ScrollTrigger to use these proxy methods for the "#main" element since Locomotive Scroll is hijacking things
  ScrollTrigger.scrollerProxy("#main", {
    scrollTop(value) {
      return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
    }, // we don't have to define a scrollLeft because we're only scrolling vertically.
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
    pinType: document.querySelector("#main").style.transform ? "transform" : "fixed"
  });



  // each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll. 
  ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

  // after everything is set up, refresh() ScrollTrigger and update LocomotiveScroll because padding may have been added for pinning, etc.
  ScrollTrigger.refresh();

}
loco()

// headings gets broken into span tag with type( single word/character )
function splitInSpan(id, type = ' ', isMultipleElements = false, initClass = '') {
  let clutter = ''
  function splitting(element) {
    element.textContent.split(type).forEach(function (dets) {
      initClass == '' ? clutter += ` <span>${dets}</span>` : clutter += ` <span class='${initClass}'>${dets}</span>`;
    })
    element.innerHTML = clutter
  }

  if (isMultipleElements) {
    document.querySelectorAll(id).forEach(el => {
      splitting(el)
      clutter = ''
    });
  } else {
    let el = document.querySelector(id)
    splitting(el)
  }
}

// animate text from grey to white
function textAnimation(id) {
  gsap.to(id, {
    scrollTrigger: {
      trigger: id,
      start: `top 90%`,
      end: `bottom 45%`,
      scroller: `#main`,
      scrub: 0.5,
    },
    stagger: 0.2,
    color: `#fff`
  })
}

// Canvas code
function canvas(id, fc, triggerId, isFullScreen, imageLocations) {
  const canvas = document.querySelector(id);
  const context = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;


  window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
  });

  function files(index) {
    var data = imageLocations;
    return data.split("\n")[index];
  }

  const frameCount = fc;

  const images = [];
  const imageSeq = {
    frame: 1,
  };

  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = files(i);
    images.push(img);
  }

  gsap.to(imageSeq, {
    frame: frameCount - 1,
    snap: "frame",
    ease: `none`,
    scrollTrigger: {
      scrub: 0.5,
      trigger: triggerId,
      start: `top top`,
      end: `250% top`,
      scroller: `#main`,
    },
    onUpdate: render,
  });

  images[1].onload = render;

  function render() {
    scaleImage(images[imageSeq.frame], context, isFullScreen);
  }

  function scaleImage(img, ctx, isFullScreen) {

    if (isFullScreen) {
      let canvas = ctx.canvas;
      let hRatio = canvas.width / img.width;
      let vRatio = canvas.height / img.height;
      let ratio = Math.max(hRatio, vRatio);
      let centerShift_x = (canvas.width - img.width * ratio) / 2;
      let centerShift_y = (canvas.height - img.height * ratio) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShift_x,
        centerShift_y,
        img.width * ratio,
        img.height * ratio
      );
    } else {
      let canvas = ctx.canvas;
      let imageAspectRatio = img.width / img.height;
      let canvasAspectRatio = canvas.width / canvas.height;
      let renderWidth, renderHeight, xStart, yStart;

      if (imageAspectRatio > canvasAspectRatio) {
        // Image is wider than the canvas
        renderWidth = canvas.width;
        renderHeight = canvas.width / imageAspectRatio;
        xStart = 0;
        yStart = (canvas.height - renderHeight) / 2;
      } else {
        // Image is taller than or equal to the canvas
        renderWidth = canvas.height * imageAspectRatio;
        renderHeight = canvas.height;
        xStart = (canvas.width - renderWidth) / 2;
        yStart = 0;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, xStart, yStart, renderWidth, renderHeight);
    }
  }


  ScrollTrigger.create({

    trigger: triggerId,
    pin: true,
    // markers:true,
    scroller: `#main`,
    start: `top top`,
    end: `250% top`,
  });
}

function blueInfoHeadingAnimation(words, triggerId) {
  let h3 = Array.from(document.querySelectorAll(words));
  let tlb = gsap.timeline({ paused: true });

  //heading animation
  h3.forEach(word => {
    tlb.to(word.querySelectorAll('span'), {
      y: -20,
      duration: 0.2,
      stagger: {
        amount: 0.1
      },
      opacity: 1,
    }, '-=0.2');
  });


  //Trigger for animation
  ScrollTrigger.create({
    trigger: triggerId,
    // markers: true,
    start: "top 70%",
    scroller: '#main',
    onEnter: () => {
      console.log('entered')
      tlb.play()
    },
  });

}

function characterAni(id, pos, tl) {
  id.querySelectorAll('span').forEach(chars => {
    tl.fromTo(chars, { rotation: 50 }, { rotation: 0, duration: 1 }, pos)
  })
}

function wordAni(timeline, el, wordpos, charpos) {
  timeline.fromTo(el, { top: '200px', left: '50px' }, { top: '0px', left: '0px' }, wordpos)
  characterAni(el, charpos, timeline)
}

// page 1
splitInSpan('#page1 #bottom-page1>h1', ' ', true, 'wordSpan')
splitInSpan('#page1 #bottom-page1>h1 span', '', true)

// TextAnimation: words(translate top and left) & chars(rotate)
let element = Array.from(document.querySelectorAll('.wordSpan'))
let textTl = gsap.timeline({ defaults: { duration: 1, stagger: 0.5 } })

// Home Page Animation
wordAni(textTl, element[0], 'animation', '<')
wordAni(textTl, element[1], '<', '<')
wordAni(textTl, element[2], 'animation+=0.2', '<')
wordAni(textTl, element[3], '<', '<')
textTl.to('#page1Button', { transform: 'translate(-200%, 0px)', opacity: 1, duration: 1, ease: "power2.out", }, 'animation+=0.2')
textTl.to('#page1Button', { transform: 'translate(40%, 0px)', duration: 1.5, ease: "power4.out" }, '<0.5')
textTl.to('#bottompWrapper>div', { width: '100%', duration: 1, ease: "power4.out" }, '<')


// page 2 
splitInSpan('#page2 .h3-heading', ' ', true, 'wordSpan')
splitInSpan('#page2 .h3-heading span', '', true)
blueInfoHeadingAnimation('#page2 .wordSpan', "#page2")
// Paragraph Animation
splitInSpan("#page2>h2")
textAnimation("#page2>h2>span")


// page 3
canvas("#page3>canvas", 67, '#page3', true, `
/Img/frames00007.png
/Img/frames00010.png
/Img/frames00013.png
/Img/frames00016.png
/Img/frames00019.png
/Img/frames00022.png
/Img/frames00025.png
/Img/frames00028.png
/Img/frames00031.png
/Img/frames00034.png
/Img/frames00037.png
/Img/frames00040.png
/Img/frames00043.png
/Img/frames00046.png
/Img/frames00049.png
/Img/frames00052.png
/Img/frames00055.png
/Img/frames00058.png
/Img/frames00061.png
/Img/frames00064.png
/Img/frames00067.png
/Img/frames00070.png
/Img/frames00073.png
/Img/frames00076.png
/Img/frames00079.png
/Img/frames00082.png
/Img/frames00085.png
/Img/frames00088.png
/Img/frames00091.png
/Img/frames00094.png
/Img/frames00097.png
/Img/frames00100.png
/Img/frames00103.png
/Img/frames00106.png
/Img/frames00109.png
/Img/frames00112.png
/Img/frames00115.png
/Img/frames00118.png
/Img/frames00121.png
/Img/frames00124.png
/Img/frames00127.png
/Img/frames00130.png
/Img/frames00133.png
/Img/frames00136.png
/Img/frames00139.png
/Img/frames00142.png
/Img/frames00145.png
/Img/frames00148.png
/Img/frames00151.png
/Img/frames00154.png
/Img/frames00157.png
/Img/frames00160.png
/Img/frames00163.png
/Img/frames00166.png
/Img/frames00169.png
/Img/frames00172.png
/Img/frames00175.png
/Img/frames00178.png
/Img/frames00181.png
/Img/frames00184.png
/Img/frames00187.png
/Img/frames00190.png
/Img/frames00193.png
/Img/frames00196.png
/Img/frames00199.png
/Img/frames00202.png
`)


// page 4
// Heading Animation
splitInSpan('#page4 .h3-heading', ' ', true, 'wordSpan')
splitInSpan('#page4 .h3-heading span', '', true)
blueInfoHeadingAnimation('#page4 .wordSpan', "#page4")
// Paragraph Animation
splitInSpan("#page4>h2")
textAnimation("#page4>h2>span")


// page 5
canvas("#page5>canvas", 54, '#page5', true, `
/Img/bridges00004.png
/Img/bridges00007.png
/Img/bridges00010.png
/Img/bridges00013.png
/Img/bridges00016.png
/Img/bridges00019.png
/Img/bridges00022.png
/Img/bridges00025.png
/Img/bridges00028.png
/Img/bridges00031.png
/Img/bridges00034.png
/Img/bridges00037.png
/Img/bridges00040.png
/Img/bridges00043.png
/Img/bridges00046.png
/Img/bridges00049.png
/Img/bridges00052.png
/Img/bridges00055.png
/Img/bridges00058.png
/Img/bridges00061.png
/Img/bridges00064.png
/Img/bridges00067.png
/Img/bridges00070.png
/Img/bridges00073.png
/Img/bridges00076.png
/Img/bridges00079.png
/Img/bridges00082.png
/Img/bridges00085.png
/Img/bridges00088.png
/Img/bridges00091.png
/Img/bridges00094.png
/Img/bridges00097.png
/Img/bridges00100.png
/Img/bridges00103.png
/Img/bridges00106.png
/Img/bridges00109.png
/Img/bridges00112.png
/Img/bridges00115.png
/Img/bridges00118.png
/Img/bridges00121.png
/Img/bridges00124.png
/Img/bridges00127.png
/Img/bridges00130.png
/Img/bridges00133.png
/Img/bridges00136.png
/Img/bridges00139.png
/Img/bridges00142.png
/Img/bridges00145.png
/Img/bridges00148.png
/Img/bridges00151.png
/Img/bridges00154.png
/Img/bridges00157.png
/Img/bridges00160.png
/Img/bridges00163.png
`)

// page 6
// Heading Animation
splitInSpan('#page6 .h3-heading', ' ', true, 'wordSpan')
splitInSpan('#page6 .h3-heading span', '', true)
blueInfoHeadingAnimation('#page6 .wordSpan', "#page6")
// Paragraph Animation
splitInSpan("#page6>h2")
textAnimation("#page6>h2>span")


// page 7
canvas("#page7>canvas", 137, "#page7", true, `
https://thisismagma.com/assets/home/lore/seq/1.webp?2
https://thisismagma.com/assets/home/lore/seq/2.webp?2
https://thisismagma.com/assets/home/lore/seq/3.webp?2
https://thisismagma.com/assets/home/lore/seq/4.webp?2
https://thisismagma.com/assets/home/lore/seq/5.webp?2
https://thisismagma.com/assets/home/lore/seq/6.webp?2
https://thisismagma.com/assets/home/lore/seq/7.webp?2
https://thisismagma.com/assets/home/lore/seq/8.webp?2
https://thisismagma.com/assets/home/lore/seq/9.webp?2
https://thisismagma.com/assets/home/lore/seq/10.webp?2
https://thisismagma.com/assets/home/lore/seq/11.webp?2
https://thisismagma.com/assets/home/lore/seq/12.webp?2
https://thisismagma.com/assets/home/lore/seq/13.webp?2
https://thisismagma.com/assets/home/lore/seq/14.webp?2
https://thisismagma.com/assets/home/lore/seq/15.webp?2
https://thisismagma.com/assets/home/lore/seq/16.webp?2
https://thisismagma.com/assets/home/lore/seq/17.webp?2
https://thisismagma.com/assets/home/lore/seq/18.webp?2
https://thisismagma.com/assets/home/lore/seq/19.webp?2
https://thisismagma.com/assets/home/lore/seq/20.webp?2
https://thisismagma.com/assets/home/lore/seq/21.webp?2
https://thisismagma.com/assets/home/lore/seq/22.webp?2
https://thisismagma.com/assets/home/lore/seq/23.webp?2
https://thisismagma.com/assets/home/lore/seq/24.webp?2
https://thisismagma.com/assets/home/lore/seq/25.webp?2
https://thisismagma.com/assets/home/lore/seq/26.webp?2
https://thisismagma.com/assets/home/lore/seq/27.webp?2
https://thisismagma.com/assets/home/lore/seq/28.webp?2
https://thisismagma.com/assets/home/lore/seq/29.webp?2
https://thisismagma.com/assets/home/lore/seq/30.webp?2
https://thisismagma.com/assets/home/lore/seq/31.webp?2
https://thisismagma.com/assets/home/lore/seq/32.webp?2
https://thisismagma.com/assets/home/lore/seq/33.webp?2
https://thisismagma.com/assets/home/lore/seq/34.webp?2
https://thisismagma.com/assets/home/lore/seq/35.webp?2
https://thisismagma.com/assets/home/lore/seq/36.webp?2
https://thisismagma.com/assets/home/lore/seq/37.webp?2
https://thisismagma.com/assets/home/lore/seq/38.webp?2
https://thisismagma.com/assets/home/lore/seq/39.webp?2
https://thisismagma.com/assets/home/lore/seq/40.webp?2
https://thisismagma.com/assets/home/lore/seq/41.webp?2
https://thisismagma.com/assets/home/lore/seq/42.webp?2
https://thisismagma.com/assets/home/lore/seq/43.webp?2
https://thisismagma.com/assets/home/lore/seq/44.webp?2
https://thisismagma.com/assets/home/lore/seq/45.webp?2
https://thisismagma.com/assets/home/lore/seq/46.webp?2
https://thisismagma.com/assets/home/lore/seq/47.webp?2
https://thisismagma.com/assets/home/lore/seq/48.webp?2
https://thisismagma.com/assets/home/lore/seq/49.webp?2
https://thisismagma.com/assets/home/lore/seq/50.webp?2
https://thisismagma.com/assets/home/lore/seq/51.webp?2
https://thisismagma.com/assets/home/lore/seq/52.webp?2
https://thisismagma.com/assets/home/lore/seq/53.webp?2
https://thisismagma.com/assets/home/lore/seq/54.webp?2
https://thisismagma.com/assets/home/lore/seq/55.webp?2
https://thisismagma.com/assets/home/lore/seq/56.webp?2
https://thisismagma.com/assets/home/lore/seq/57.webp?2
https://thisismagma.com/assets/home/lore/seq/58.webp?2
https://thisismagma.com/assets/home/lore/seq/59.webp?2
https://thisismagma.com/assets/home/lore/seq/60.webp?2
https://thisismagma.com/assets/home/lore/seq/61.webp?2
https://thisismagma.com/assets/home/lore/seq/62.webp?2
https://thisismagma.com/assets/home/lore/seq/63.webp?2
https://thisismagma.com/assets/home/lore/seq/64.webp?2
https://thisismagma.com/assets/home/lore/seq/65.webp?2
https://thisismagma.com/assets/home/lore/seq/66.webp?2
https://thisismagma.com/assets/home/lore/seq/67.webp?2
https://thisismagma.com/assets/home/lore/seq/68.webp?2
https://thisismagma.com/assets/home/lore/seq/69.webp?2
https://thisismagma.com/assets/home/lore/seq/70.webp?2
https://thisismagma.com/assets/home/lore/seq/71.webp?2
https://thisismagma.com/assets/home/lore/seq/72.webp?2
https://thisismagma.com/assets/home/lore/seq/73.webp?2
https://thisismagma.com/assets/home/lore/seq/74.webp?2
https://thisismagma.com/assets/home/lore/seq/75.webp?2
https://thisismagma.com/assets/home/lore/seq/76.webp?2
https://thisismagma.com/assets/home/lore/seq/77.webp?2
https://thisismagma.com/assets/home/lore/seq/78.webp?2
https://thisismagma.com/assets/home/lore/seq/79.webp?2
https://thisismagma.com/assets/home/lore/seq/80.webp?2
https://thisismagma.com/assets/home/lore/seq/81.webp?2
https://thisismagma.com/assets/home/lore/seq/82.webp?2
https://thisismagma.com/assets/home/lore/seq/83.webp?2
https://thisismagma.com/assets/home/lore/seq/84.webp?2
https://thisismagma.com/assets/home/lore/seq/85.webp?2
https://thisismagma.com/assets/home/lore/seq/86.webp?2
https://thisismagma.com/assets/home/lore/seq/87.webp?2
https://thisismagma.com/assets/home/lore/seq/88.webp?2
https://thisismagma.com/assets/home/lore/seq/89.webp?2
https://thisismagma.com/assets/home/lore/seq/90.webp?2
https://thisismagma.com/assets/home/lore/seq/91.webp?2
https://thisismagma.com/assets/home/lore/seq/92.webp?2
https://thisismagma.com/assets/home/lore/seq/93.webp?2
https://thisismagma.com/assets/home/lore/seq/94.webp?2
https://thisismagma.com/assets/home/lore/seq/95.webp?2
https://thisismagma.com/assets/home/lore/seq/96.webp?2
https://thisismagma.com/assets/home/lore/seq/97.webp?2
https://thisismagma.com/assets/home/lore/seq/98.webp?2
https://thisismagma.com/assets/home/lore/seq/99.webp?2
https://thisismagma.com/assets/home/lore/seq/100.webp?2
https://thisismagma.com/assets/home/lore/seq/101.webp?2
https://thisismagma.com/assets/home/lore/seq/102.webp?2
https://thisismagma.com/assets/home/lore/seq/103.webp?2
https://thisismagma.com/assets/home/lore/seq/104.webp?2
https://thisismagma.com/assets/home/lore/seq/105.webp?2
https://thisismagma.com/assets/home/lore/seq/106.webp?2
https://thisismagma.com/assets/home/lore/seq/107.webp?2
https://thisismagma.com/assets/home/lore/seq/108.webp?2
https://thisismagma.com/assets/home/lore/seq/109.webp?2
https://thisismagma.com/assets/home/lore/seq/110.webp?2
https://thisismagma.com/assets/home/lore/seq/111.webp?2
https://thisismagma.com/assets/home/lore/seq/112.webp?2
https://thisismagma.com/assets/home/lore/seq/113.webp?2
https://thisismagma.com/assets/home/lore/seq/114.webp?2
https://thisismagma.com/assets/home/lore/seq/115.webp?2
https://thisismagma.com/assets/home/lore/seq/116.webp?2
https://thisismagma.com/assets/home/lore/seq/117.webp?2
https://thisismagma.com/assets/home/lore/seq/118.webp?2
https://thisismagma.com/assets/home/lore/seq/119.webp?2
https://thisismagma.com/assets/home/lore/seq/120.webp?2
https://thisismagma.com/assets/home/lore/seq/121.webp?2
https://thisismagma.com/assets/home/lore/seq/122.webp?2
https://thisismagma.com/assets/home/lore/seq/123.webp?2
https://thisismagma.com/assets/home/lore/seq/124.webp?2
https://thisismagma.com/assets/home/lore/seq/125.webp?2
https://thisismagma.com/assets/home/lore/seq/126.webp?2
https://thisismagma.com/assets/home/lore/seq/127.webp?2
https://thisismagma.com/assets/home/lore/seq/128.webp?2
https://thisismagma.com/assets/home/lore/seq/129.webp?2
https://thisismagma.com/assets/home/lore/seq/130.webp?2
https://thisismagma.com/assets/home/lore/seq/131.webp?2
https://thisismagma.com/assets/home/lore/seq/132.webp?2
https://thisismagma.com/assets/home/lore/seq/133.webp?2
https://thisismagma.com/assets/home/lore/seq/134.webp?2
https://thisismagma.com/assets/home/lore/seq/135.webp?2
https://thisismagma.com/assets/home/lore/seq/136.webp?2
`)

const percent = document.querySelector('#percentH1')
let tl = gsap.timeline()
let counter = 0
// make the opacity animation form 0 to 1 to reveal the loader
tl.to('#page7Wrapper', {
  scrollTrigger: {
    trigger: '#page7',
    start: 'center center',
    end: 'center 20%',
    // markers: true,
    scroller: '#main',
    scrub: '.5'
  },
  opacity: 1,
})

// loader scaling animation with the percentage update
tl.fromTo("#loadingCircle", {
  scrollTrigger: {
    trigger: '#page7',
  },
  scale: 0.25,
}, {
  scrollTrigger: {
    trigger: '#page7',
    start: 'center center',
    end: '+=250% center',
    // markers: true,
    scroller: '#main',
    scrub: '.5'
  },
  scale: 1,
  onUpdate: function () {
    counter = this.progress() * 60
    // console.log(counter)
    percent.innerHTML = Math.floor(counter) + '%'
  },
  onComplete: function () {
    console.log("completed")
    if (counter == 60) {
      console.log('completed at 60')
    }
  }
})

// percent opacity from 1 to 0
tl.to('#page7PercentWrapper', {
  scrollTrigger: {
    trigger: '#page7',
    // start: '50.5% center ',
    start: self => self.previous().end,
    end: '+=20%',
    // markers: true,
    pin: true,
    scroller: '#main',
    scrub: '.5',
    onEnter: () => { console.log('percent') }
  },
  opacity: 0,
  scale: 0.9,
})

// Image Reveal 
tl.fromTo('#page7Img', {
  opacity: 0,
  scale: 0.4,
}, {
  scrollTrigger: {
    trigger: '#page7',
    // start: '50.6% center ',
    start: self => self.previous().end,
    end: '+=20%',
    // markers: true,
    pin: true,
    scroller: '#main',
    scrub: '.5',
    onEnter: () => { console.log('percent') }
  },
  opacity: 1,
  scale: 0.5,
})

// Loader scale down 
tl.fromTo('#loadingCircle ', {
  scale: 1,
}, {
  scrollTrigger: {
    trigger: '#page7',
    // start: '51% center ',
    start: self => self.previous().end,
    end: '+=50%',
    pin: true,
    // markers: true,
    scroller: '#main',
    scrub: '.5'
  },
  scale: 0,
})


// page 8
tl.fromTo('#page8', {
  opacity: 0,
  // yPercent: 0,
  scale: 2
}, {
  scrollTrigger: {
    trigger: '#page8',
    // start: 'center center',
    start: self => self.previous().start,
    end: '+=50%',
    scroller: '#main',
    // markers: true,
    id: '4',
    scrub: 0.5,
    pin: true,
    pinSpacing: false,
  },
  opacity: 1,
  // yPercent: -150,
  scale: 1
})

splitInSpan('#page8Bottom h1', ' ', true, 'wordSpan')
splitInSpan('#page8Bottom h1 span', '', true)

