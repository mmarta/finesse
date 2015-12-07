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
		Finesse.UPDATE_MODE_SCREEN_SYNC = 0;
		Finesse.UPDATE_MODE_TIMEOUT = 1;
		Finesse.UPDATE_MODE_SAFE = Finesse.UPDATE_MODE_TIMEOUT;
		Finesse.updateMode = -1;
		Finesse.frameWaitLeft = 0;

		//Finesse execution code
		Finesse.registerUpdateMode = function(mode) {
			switch(mode) {
				case Finesse.UPDATE_MODE_SCREEN_SYNC:
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

		var internalFrameFunction = function() {
			Finesse.frameWaitLeft--;

			if(Finesse.frameWaitLeft == 0) {
				Finesse.runFunction();
			} else {
				Finesse.waitNextFrame();
			}
		}

		Finesse.waitNextFrame = function(frameCount) {
			if(!frameCount) {
				if(Finesse.frameWaitLeft == 0) {
					frameCount = 1;
				} else {
					frameCount = Finesse.frameWaitLeft;
				}
			}
			Finesse.frameWaitLeft = frameCount;

			switch(Finesse.updateMode) {
				case Finesse.UPDATE_MODE_SCREEN_SYNC:
					requestAnimationFrame(internalFrameFunction);
					break;
				case Finesse.UPDATE_MODE_SAFE:
					setTimeout(internalFrameFunction, 17);
					break;
			}
		};

		Finesse.runPogramLoop = function(programFunc) {
			switch(Finesse.updateMode) {
				case Finesse.UPDATE_MODE_SCREEN_SYNC:
				case Finesse.UPDATE_MODE_SAFE:
					Finesse.runFunction = function() {
						programFunc();
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
				height: h,
				backgroundLayers: {}
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

		Finesse.BACKGROUND_LAYER_TILED_TYPE = 0;
		Finesse.BACKGROUND_LAYER_FULL_TYPE = 0;

		//Finesse background code
		Finesse.registerTiledBackgroundLayer = function(pageDisplay, backgroundID, tileSheetImage, tileArray, tilePixelSize, repeat) {
			var layer = {
				data: tileArray,
				tiles: tileSheetImage,
				tileSize: tilePixelSize,
				repeat: repeat,
				type: Finesse.BACKGROUND_LAYER_TILED_TYPE,
				x: 0,
				y: 0
			};

			pageDisplay.backgroundLayers[backgroundID] = layer;
		};

		Finesse.scrollBackground = function(pageDisplay, backgroundID, x, y) {
			var layer = pageDisplay.backgroundLayers[backgroundID];

			if(!layer) {
				throw "FinesseError: This layer does not exist.";
			}

			layer.x = x;
			layer.y = y;
		};

		Finesse.drawBackgroundLayer = function(pageDisplay, backgroundID) {
			var layer = pageDisplay.backgroundLayers[backgroundID],
				context = pageDisplay.buffer2DContext,
				i, j, lenI, lenJ, layerX, layerY, repeatStartX;

			var data = layer.data,
				tiles = layer.tiles,
				tileSize = layer.tileSize;

			if(!layer) {
				throw "FinesseError: This layer does not exist.";
			}

			if(layer.type == Finesse.BACKGROUND_LAYER_TILED_TYPE) { //Tile type
				if(layer.repeat) { //Repeated layers
					startX = layerX;

					iLen = data.length;
					layerX = layer.x;
					layerY = layer.y;
					for(i = 0; true; i++) {
						jLen = data[i].length;
						for(j = 0; true; j++) {
							context.drawImage(tiles, data[i][j][0] * tileSize, data[i][j][1] * tileSize, tileSize, tileSize, layerX, layerY, tileSize, tileSize);
							layerX += tileSize;
							if(layerX >= pageDisplay.width) {
								break;
							}
							if(j >= jLen - 1) {
								j = -1;
							}
						}
						layerY += tileSize;
						layerX = layer.x;
						if(layerY >= pageDisplay.height) {
							break;
						}
						if(i >= iLen - 1) {
							i = -1;
						}
					}
				} else {
					iLen = data.length;
					layerX = layer.x;
					layerY = layer.y;
					for(i = 0; i < iLen; i++) {
						jLen = data[i].length;
						for(j = 0; j < jLen; j++) {
							context.drawImage(tiles, data[i][j][0] * tileSize, data[i][j][1] * tileSize, tileSize, tileSize, layerX, layerY, tileSize, tileSize);
							layerX += tileSize;
						}
						layerY += tileSize;
						layerX = layer.x;
					}
				}
			}
		}

		Finesse.removeBackgroundLayer = function(pageDisplay, backgroundID) {
			delete pageDisplay.backgroundLayers[backgroundID];
		};

		window.Finesse = Finesse;
	})(window);
}
