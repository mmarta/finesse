//Finesse JS library for Multimedia and Arcade Games
//(C)2015 NY JAMMA Arcade Engine
//Coded by Marc Marta

if(window.Finesse && Finesse.isFromNYJAMMAArcadeEngine) {
	//Do nothing, this is ok. We already have Finesse on the page.
} else if(window.Finesse && !Finesse.isFromNYJAMMAArcadeEngine) {
	throw 'FinesseError: Can\'t include another Finesse library here not from NY JAMMA Arcade Engine.';
} else {
	(function(window) {
		var Finesse = {
			isFromNYJAMMAArcadeEngine: true
		};

		//Finesse program constants
		Finesse.UPDATE_MODE_UNINITIALIZED = -1;
		Finesse.UPDATE_MODE_VSYNC = 0;
		Finesse.UPDATE_MODE_TIMEOUT = 1;
		Finesse.UPDATE_MODE_SAFE = Finesse.UPDATE_MODE_TIMEOUT;
		Finesse.updateMode = -1;

		//Finesse execution code
		Finesse.registerUpdateMode = function(mode) {
			switch(mode) {
				case Finesse.UPDATE_MODE_VSYNC:
					if(!window.requestAnimationFrame) {
						return false;
					}
					Finesse.updateMode = mode;
					return true;
					break;
				case Finesse.UPDATE_MODE_SAFE:
					Finesse.updateMode = mode;
					return true;
					break;
				default:
					return false;
			}
		};

		Finesse.runPogramLoop = function(programFunc) {
			switch(Finesse.updateMode) {
				case Finesse.UPDATE_MODE_VSYNC:
					Finesse.runFunction = function() {
						programFunc();
						requestAnimationFrame(Finesse.runFunction);
					};
					Finesse.runFunction();
					break;
				case Finesse.UPDATE_MODE_SAFE:
					Finesse.runFunction = function() {
						programFunc();
						setTimeout(Finesse.runFunction, 17);
					};
					Finesse.runFunction();
					break;
				default:
					throw 'FinesseError: No update mode has been registered.';
			}
		};

		//Finesse display and sprites code
		Finesse.DISPLAY_MODE_STANDARD = 0;
		Finesse.DISPLAY_MODE_SIMULATE_FULLSCREEN = 1;

		Finesse.createPageDisplay = function(w, h) {
			var displayCanvas = document.createElement('canvas');

			//Canvas not supported?
			if(!displayCanvas) {
				return null;
			}

			var bufferCanvas = document.createElement('canvas');

			displayCanvas.width = w;
			displayCanvas.height = h;
			displayCanvas.style.position = 'relative';
			bufferCanvas.width = w;
			bufferCanvas.height = h;

			return {
				displayCanvas: displayCanvas,
				bufferCanvas: bufferCanvas,
				display2DContext: displayCanvas.getContext('2d'),
				buffer2DContext: bufferCanvas.getContext('2d'),
				baseLocation: null,
				width: w,
				height: h
			};
		};

		Finesse.renderPageDisplay = function(pageDisplay) {
			pageDisplay.display2DContext.drawImage(pageDisplay.bufferCanvas, 0, 0);
		};

		Finesse.addPageDisplayToElement = function(pageDisplay, htmlElement) {
			var el, canvas = pageDisplay.displayCanvas;

			if(typeof htmlElement != 'string') {
				el = htmlElement;
			} else {
				el = document.getElementById(htmlElement);
			}

			if(pageDisplay.displayMode != null && pageDisplay.displayMode != Finesse.DISPLAY_MODE_STANDARD) {
				canvas.remove();
			}
			el.appendChild(canvas);
			pageDisplay.baseLocation = el;

			pageDisplay.displayMode = Finesse.DISPLAY_MODE_STANDARD;
		};

		Finesse.simulateFullScreenPageDisplay = function(pageDisplay) {
			var baseLoc = pageDisplay.baseLocation,
				canvas = pageDisplay.displayCanvas;

			if(baseLoc != null) {
				canvas.remove();
			}

			pageDisplay.displayMode = Finesse.DISPLAY_MODE_SIMULATE_FULLSCREEN;

			//Resize
			Finesse.resizeSimulatedFullScreenPageDisplay(pageDisplay);
			document.body.appendChild(canvas);
		};

		Finesse.resizeSimulatedFullScreenPageDisplay = function(pageDisplay) {
			var canvas = pageDisplay.displayCanvas;
			var style = canvas.style;
			var winW, winH, winRatio, calcW, calcH, calcX, calcY, ratio;

			if(pageDisplay.displayMode != Finesse.DISPLAY_MODE_SIMULATE_FULLSCREEN) {
				return;
			}

			if(window.innerWidth == undefined) {
				throw 'FinesseError: This browser uses non-standard window methods. Can\'t use simulated full screen.';
			}

			winW = window.innerWidth;
			winH = window.innerHeight;
			winRatio = winW / winH;
			ratio = pageDisplay.width / pageDisplay.height;

			if(winRatio > ratio) {
				calcH = winH;
				calcW = (winH * ratio) >> 0;
				calcY = 0;
				calcX = (winW - calcW) >> 1;
			} else {
				calcW = winW;
				calcH = (winW / ratio) >> 0;
				calcX = 0;
				calcY = (winH - calcH) >> 1;
			}

			style.position = 'fixed';
			style.top = calcY + 'px';
			style.left = calcX + 'px';
			style.width = calcW + 'px';
			style.height = calcH + 'px';
		}

		Finesse.returnToStandardPageDisplay = function(pageDisplay) {
			var baseLoc = pageDisplay.baseLocation,
				canvas = pageDisplay.displayCanvas;
			var style = canvas.style;

			style.position = 'relative';
			style.top = null;
			style.left = null;
			style.width = null;
			style.height = null;

			canvas.remove();

			if(baseLoc != null) {
				baseLoc.appendChild(canvas);
			} else {
				throw "FinesseError: This display has not been added to an element to return to standard display mode.";
			}

			pageDisplay.displayMode = Finesse.DISPLAY_MODE_STANDARD;
		};

		Finesse.drawFullImageToPageDisplay = function(pageDisplay, img, displayX, displayY) {
			pageDisplay.buffer2DContext.drawImage(img, x, y);
		};

		Finesse.drawSpriteToPageDisplay = function(pageDisplay, img, spriteX, spriteY, displayX, displayY, w, h) {
			pageDisplay.buffer2DContext.drawImage(img, spriteX, spriteY, w, h, displayX, displayY, w, h);
		};

		Finesse.drawScaledSpriteToPageDisplay = function(pageDisplay, img, spriteX, spriteY, spriteW, spriteH, displayX, displayY, displayW, displayH) {
			pageDisplay.buffer2DContext.drawImage(img, spriteX, spriteY, spriteW, spriteH, displayX, displayY, displayW, displayH);
		};

		Finesse.createRGBColorHexString = function(r, g, b) {
			return '#' + (r < 16 ? '0' + r.toString(16) : r.toString(16))
					+ (g < 16 ? '0' + g.toString(16) : g.toString(16))
					+ (b < 16 ? '0' + b.toString(16) : b.toString(16));
		};

		Finesse.clearDisplayPage = function(displayPage, color) {
			var context = displayPage.buffer2DContext, cv = displayPage.bufferCanvas;
			if(!color) {
				color = '#000000';
			}

			context.fillStyle = color;
			context.fillRect(0, 0, cv.width, cv.height);
		};

		window.Finesse = Finesse;
	})(window);
}
