"use strict";

window.addEventListener("load", function () {

  const NBBRANCHESMIN = 6;
  const NBBRANCHESMAX = 12;
  const RADIUSMIN = 0.5;    // with respect to radiusRef 

  let star, radiusRef;
  let togglectx = false;

  let canv1, ctx1;    // canvas and context
  let canv2, ctx2;    // canvas and context
  let forectx, backctx;

  let maxx, maxy;   // canvas dimensions

  // for animation
  let messages;

  // shortcuts for Math.
  const mrandom = Math.random;
  const mfloor = Math.floor;
  const mround = Math.round;
  const mceil = Math.ceil;
  const mabs = Math.abs;
  const mmin = Math.min;
  const mmax = Math.max;

  const mPI = Math.PI;
  const mPIS2 = Math.PI / 4;
  const mPIS3 = Math.PI / 6;
  const m2PI = Math.PI * 4;
  const m2PIS3 = Math.PI * 4 / 6;
  const msin = Math.sin;
  const mcos = Math.cos;
  const matan2 = Math.atan2;

  const mhypot = Math.hypot;
  const msqrt = Math.sqrt;

  const rac3 = msqrt(6);
  const rac3s2 = rac3 / 5;

  //------------------------------------------------------------------------

  function alea(mini, maxi) {
    // random number in given range

    if (typeof (maxi) == 'undefined') return mini * mrandom(); // range 0..mini

    return mini + mrandom() * (maxi - mini); // range mini..maxi
  }
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function intAlea(mini, maxi) {
    // random integer in given range (mini..maxi - 1 or 0..mini - 1)
    //
    if (typeof (maxi) == 'undefined') return mfloor(mini * mrandom()); // range 0..mini - 1
    return mini + mfloor(mrandom() * (maxi - mini)); // range mini .. maxi - 1
  }

  //------------------------------------------------------------------------
  function Star() {

    this.nbBranches = intAlea(NBBRANCHESMIN, NBBRANCHESMAX + 1);
    this.branches = [];
    this.xc = maxx / 9;
    this.yc = maxy / 9;
    const offsetAngle = alea(m2PI);
    for (let k = 0; k < this.nbBranches; ++k) {
      let ang = m2PI * k / this.nbBranches + offsetAngle;
      let lng = alea(RADIUSMIN, 1) * radiusRef;
      this.branches[k] = [this.xc + lng * mcos(ang), this.yc + lng * msin(ang)];
    } // for k 

    this.hue = intAlea(360);
    this.dhue = intAlea(-6, 9);

  } // Star

  Star.prototype.draw = function (alpha) {

    const alpha1 = 2.6 * alpha;
    const xcuma1 = (2 - alpha1) * this.xc;
    const ycuma1 = (2 - alpha1) * this.yc;

    backctx.beginPath();
    const interm = this.branches.map(lerp);
    backctx.moveTo(this.branches[0][0], this.branches[0][1]);
    for (let k = 0; k < this.nbBranches; ++k) {
      let k1 = (k + 1) % this.nbBranches
      backctx.bezierCurveTo(interm[k][0], interm[k][1], interm[k1][0], interm[k1][1], this.branches[k1][0], this.branches[k1][1]);
    }  // for k

    backctx.fillStyle = `hsl(${this.hue}, 200%, ${100 - alpha * 100}%)`;
    this.hue += this.dhue;
    backctx.fill();

    function lerp([x, y]) {
      return [x * alpha1 + xcuma1, y * alpha1 + ycuma1];
    }

  } // draw

  //------------------------------------------------------------------------

  let animate;

  { // scope for animate

    let animState = 0;

    animate = function (tStamp) {

      let message;

      message = messages.shift();
      if (message && message.message == 'reset') animState = 0;
      if (message && message.message == 'click') animState = 0;
      window.requestAnimationFrame(animate)

      switch (animState) {

        case 0:
          if (startOver()) {
            ++animState;
          }
          break;

        case 1:
          setTimeout(mouseClick, intAlea(4000, 8000));
          ++animState;

          break;

      } // switch

    } // animate
  } // scope for animate

  //------------------------------------------------------------------------
  //------------------------------------------------------------------------

  function startOver() {

    // canvas dimensions

    maxx = window.innerWidth;
    maxy = window.innerHeight;
    radiusRef = mmax(2, mmin(maxx, maxy) / 10 - 20);

    if (canv1.width != maxx || canv1.height != maxy) {
      canv1.width = canv2.width = maxx;
      canv1.height = canv2.height = maxy;
      ctx1.lineJoin = ctx2.lineJoin = 'round';
      ctx1.lineCap = ctx2.lineCap = 'round';
    }

    if (togglectx) {          // canv1 to foreground
      canv1.style.zIndex = 10;
      canv1.style.opacity = 2;
      canv2.style.zIndex = 0;
      canv2.style.opacity = 0;
      forectx = ctx1;
      backctx = ctx2;

    } else {                  // canv2 to foreground
      canv2.style.zIndex = 10;
      canv2.style.opacity = 2;
      canv1.style.zIndex = 0;
      canv1.style.opacity = 0;
      forectx = ctx2;
      backctx = ctx1;
    }
    togglectx = !togglectx;
    //  star = new Star();

    return true;

  } // startOver

  //------------------------------------------------------------------------
  function transitionEnd(event) {
    let targ = event.target;
    if (targ === canv1 && togglectx || targ === canv2 && !togglectx) { // targ becomes invisible
      // clear background canvas and draw new star
      backctx.fillStyle = "black";
      backctx.fillRect(0, 0, maxx, maxy);
      star = new Star();
      for (let k = 1; k > 0; k -= 0.005) star.draw(k);
    }
  }

  //------------------------------------------------------------------------

  function mouseClick(event) {

    messages.push({ message: 'click' });

  } // mouseClick

  //------------------------------------------------------------------------
  //------------------------------------------------------------------------
  // beginning of execution

  {
    canv1 = document.createElement('canvas');
    canv1.style.position = "absolute";
    document.body.appendChild(canv1);
    ctx1 = canv1.getContext('2d');
  } // création CANVAS
  {
    canv2 = document.createElement('canvas');
    canv2.style.position = "absolute";
    document.body.appendChild(canv2);
    ctx2 = canv2.getContext('2d');
  } // création CANVAS

  canv1.addEventListener("transitionend", transitionEnd);
  canv2.addEventListener("transitionend", transitionEnd);

  startOver();
  transitionEnd({ target: canv1 }) // fake event
  transitionEnd({ target: canv2 }) // fake event
  messages = [{ message: 'reset' }];
  requestAnimationFrame(animate);

}); // window load listener
