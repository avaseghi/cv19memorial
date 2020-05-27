import * as THREE from '/js/three/build/three.module.js';

import { TrackballControls } from '/js/three/jsm/controls/TrackballControls.js';
import { TWEEN } from '/js/three/jsm/libs/tween.module.min.js';
import { CSS3DRenderer, CSS3DSprite } from '/js/three/jsm/renderers/CSS3DRenderer.js';

var css_camera, css_scene, css_renderer;
var controls;

var testimonyContent = [];

var objects = [];
// var bubbleGradients = [[[255, 84, 79], [250, 209, 38]], [[91, 70, 129], [30, 147, 186]], [[30, 147, 186], [63, 178, 98]], [[91, 70, 129], [255, 84, 79]]];
var animationDirections = [];
var animateBbls = true;

var directionScreen = document.getElementById("directions");
var toolTipTextContainer = document.getElementById("cursorTextContainer");
var mainScene = document.getElementById("main-container");
var fadeToDiv = document.getElementById("fadeScreen");
var returnBtn = document.getElementById("return_btn");
var memorialScene = document.getElementById("memorial-scene");
var memorialOverlay = document.getElementById("overlay");

var hasVisitedMemorial = false;

initiate();

window.onload = function() {
  mainScene.addEventListener("mouseover", function (event) {
    onTestimonialMouseIn(event);
  });
  mainScene.addEventListener("mouseout", function (event) {
    onTestimonialMouseOut(event);
  });
  mainScene.addEventListener("click", function (event) {
    onTestimonialClick(event);
  });
  returnBtn.addEventListener("click", function (event) {
    fadeModal("in", "main");
  });
  directionScreen.children[1].addEventListener("click", function (event) {
    directionAppearance('hidden', '0', 'opacity 1s ease-in-out, visibility 0s linear 1s');
  });
  calculateOverlay(window.innerWidth);
}

function initiate() {
  createCssScene();
  createRenderer();
  createControl();
  $.ajax({
    url: '/data/cv19memorial_responses.csv',
    dataType: 'text',
  }).done(createTestimonial);
  animate();

  window.addEventListener( 'resize', onWindowResize, false );
}

function createCssScene() {
  css_scene = new THREE.Scene();

  css_camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 5000);
  css_camera.position.set( 600, 400, 5000 );
  css_camera.lookAt( 0, 0, 0 );
}

function createRenderer() {
  css_renderer = new CSS3DRenderer();
  css_renderer.setSize( window.innerWidth, window.innerHeight );
  mainScene.appendChild( css_renderer.domElement );
}

function createControl() {
  controls = new TrackballControls(css_camera, css_renderer.domElement );
}

function animate() {
  requestAnimationFrame( animate );

  controls.update();

  if(animateBbls) {
    animateBubbles();
  }

  TWEEN.update();

  css_renderer.render( css_scene, css_camera );
}

function onWindowResize() {
  location.reload();
}

function calculateOverlay(winWidth) {
  if (winWidth <= 600) {
    overlay.style.width = "70%"
  } else if (winWidth > 600 && winWidth < 1200) {
    overlay.style.width = (70 - ((winWidth - 600) * 0.042)) + "%";
  } else if (winWidth >= 1200) {
    overlay.style.width = "45%";
  }
}

function createTestimonial(data) {
  var allRows = data.split(/\r?\n|\r/);
  for(var i = 0; i < allRows.length; i ++) {
    var testimony_data = allRows[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
    if(testimony_data){
      var name, age, dod, location, type, img_src, testimony_txt;
      if (testimony_data[1] == "Losing a loved one" && testimony_data[5] != "null") {

        if (testimony_data[5] != "null" && testimony_data[6] != "null") {
          name = testimony_data[5] + " " + testimony_data[6];
        } else if (testimony_data[5] != "null") {
          name = testimony_data[5];
        } else if (testimony_data[6] != "null") {
          name = testimony_data[6];
        }

        if (testimony_data[8] != "null") {
          age = "Age: " + testimony_data[8] + ", ";
        } else {
          age = undefined;
        }

        if (testimony_data[7] != "null") {
          dod = "Date of Passing: " + testimony_data[7];
        } else {
          dod = undefined;
        }
      } else {

        if (testimony_data[2] != "null" && testimony_data[3] != "null") {
          name = testimony_data[2] + " " + testimony_data[3];
        } else if (testimony_data[2] != "null") {
          name = testimony_data[2];
        } else if (testimony_data[3] != "null") {
          name = testimony_data[3];
        }

        if (testimony_data[4] != "null") {
          age = "Age: " + testimony_data[4];
        } else {
          age = undefined;
        }

        dod = undefined;
      }

      if (testimony_data[11] != "null") {
        location = testimony_data[11];

        if (testimony_data[12] != "null") {
          location = testimony_data[12].replace(/['"]+/g, '') + ", " + testimony_data[11] ;
        }
      } else {

        location = undefined;
      }

      type = testimony_data[1];

      if (testimony_data[10] != "null") {
        img_src = testimony_data[10].substring(testimony_data[10].lastIndexOf("/") + 1, testimony_data[10].length);
      } else {
        img_src = undefined;
      }

      if (testimony_data[9] != "null") {
        testimony_txt = testimony_data[9].replace(/['"]+/g, '');
      } else {
        testimony_txt = undefined;
      }

      testimonyContent.push([[name, age, dod, location], type, img_src, testimony_txt]);
    }
  }
  createBubbles();
}

function createBubbles() {
  for (var i = 0; i < testimonyContent.length; i ++) {
    var name = testimonyContent[i][0][0];
    var testimonialImg = testimonyContent[i][2];

    var testimonial = document.createElement('div');
    testimonial.className = 'testimonial testimonialContainer';

    var image = document.createElement('div');
    image.className = 'testimonial testimonialImage';

    if (testimonialImg) {
      image.style.backgroundImage = 'url(/images/portraits/' + testimonialImg + ')';
    } else {
      testimonial.style.background = 'linear-gradient(135deg, rgba(91, 70, 129, 0.55) 0%, rgba(30, 147, 186, 0.55) 100%)';
    }

    var text = document.createElement('span');
    text.innerHTML = name;

    testimonial.appendChild(image);
    testimonial.appendChild(text);

    var object = new CSS3DSprite(testimonial);
    object.position.x = Math.random() * 4000 - 2000,
    object.position.y = Math.random() * 4000 - 2000,
    object.position.z = Math.random() * 4000 - 2000;
    css_scene.add( object );

    objects.push( object );

    var bubbleDirection = {
      x : (Math.random() * .6) - .4,
      y : (Math.random() * .6) - .4,
      z : (Math.random() * .6) - .4
    }

    animationDirections.push(bubbleDirection);
  }
}

function animateBubbles() {
  for (var i = 0; i < objects.length; i ++) {
    if (objects[i].position.x > 2000 || objects[i].position.x < -2000 ) {
      animationDirections[i].x = -animationDirections[i].x;
    }
    if (objects[i].position.y > 2000 || objects[i].position.y < -2000 ) {
      animationDirections[i].y = -animationDirections[i].y;
    }
    if (objects[i].position.z > 2000 || objects[i].position.z < -2000 ) {
      animationDirections[i].z = -animationDirections[i].z;
    }

    objects[i].position.x += animationDirections[i].x;
    objects[i].position.y += animationDirections[i].y;
    objects[i].position.z += animationDirections[i].z;
  }
}

function onTestimonialMouseIn(evt) {
  if(evt.target &&  evt.target.className == "testimonial testimonialImage"){
    var testimonialContainer = evt.target.parentNode;
    var testimonialText = testimonialContainer.childNodes[1];

    toolTipTextContainer.innerHTML = testimonialText.innerHTML;
    toolTipTextContainer.style.top = evt.clientY + "px";
    toolTipTextContainer.style.left = evt.clientX + "px";
    toolTipTextContainer.style.display = "block";
  }
}

function onTestimonialMouseOut(evt) {
  if(evt.target &&  evt.target.className == "testimonial testimonialImage"){
    toolTipTextContainer.style.display = "none";
  }
}

function onTestimonialClick(evt) {
  if(evt.target &&  evt.target.className == "testimonial testimonialImage"){
    var testimonialContainer = evt.target.parentNode;
    var testimonialIndex = Array.from(testimonialContainer.parentElement.children).indexOf(testimonialContainer);

    beginTestimonialTransition(objects[testimonialIndex]);
    createMemorialContent(testimonyContent[testimonialIndex]);
  }
}

function beginTestimonialTransition(testimonial) {
  var position = controls.target;
  var target = testimonial.position;
  var tween = new TWEEN.Tween(position).to(target, 500);

  toolTipTextContainer.style.display = "none";

  tween.onUpdate(function(){
    controls.target = position;
  });

  tween.onComplete(function(){
    fadeModal("in", "memorial");
    zoomTestimonial("in", target);
  });

  tween.start();
}

function zoomTestimonial(direction, target) {
  var cam = css_camera.position;
  var target =  direction == "in" ? target : {x : target.position.x, y : target.position.y, z : 2000};
  var zTween = new TWEEN.Tween(cam).to(target, 1000);

  zTween.onUpdate(function(){
    css_camera.position.z = cam.z;
  });

  zTween.start();
}

function fadeModal(direction, scene) {
  var currentOpacity = { percentage : direction == "in" ? 0 : 1 };
  var transitionOpacity = { percentage : direction == "in" ? 1 : 0 };
  var sceneToShow = scene == "memorial" ? memorialScene : mainScene;
  var sceneToHide = scene == "memorial" ? mainScene : memorialScene;
  var btnViz = scene == "memorial" ? 'visible' : 'hidden';
  var fadeTween = new TWEEN.Tween(currentOpacity).to(transitionOpacity, 1100);

  fadeToDiv.style.visibility = 'visible';
  fadeTween.start();

  fadeTween.onUpdate(function(){
    fadeToDiv.style.backgroundColor = 'rgba(0, 0, 0, ' + currentOpacity.percentage + ')';
  });

  fadeTween.onComplete(function() {
    if (direction == "in") {
      animateBbls = !animateBbls;
      fadeModal("out", scene);
      if (scene == "main") {
        resetMemorialControls();
        zoomTestimonial("out", css_camera);
        if(hasVisitedMemorial == false) {
          directionAppearance('hidden', '0', null);
          hasVisitedMemorial = true;
        }
      } else {
        if(hasVisitedMemorial == false) {
          directionScreen.children[0].children[0].innerHTML = "rotate clockwise to reveal the testimony";
          directionScreen.style.background = 'rgba(0, 0, 0, 0.95)';
          directionScreen.style.color = '#f4eae0';
          directionScreen.children[1].style.color = '#f4eae0';
          directionAppearance('visible', '1', null);
        }
      }
      sceneToShow.style.left= '0em';
      sceneToHide.style.left = '-999em';
      returnBtn.style.visibility = btnViz;
    } else {
      fadeToDiv.style.visibility = 'hidden';
    }
  });
}

function directionAppearance(visibility, opacity, transition) {
  if (transition) {
    directionScreen.style.transition = transition;
  } else {
    directionScreen.style.removeProperty('transition');
  }
  directionScreen.style.opacity = opacity;
  directionScreen.style.visibility = visibility;
}

function resetMemorialControls() {
  control.reset();
  control.enableZoom = false;
  control.enablePan = false;
  control.object.position.set(0, 0, 200);
  control.target.set(0, 0, 0);
  control.update();
}
