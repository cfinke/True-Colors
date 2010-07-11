var TRUE_COLORS = {
	statusBar : null,
	tabBar : null,
	
	lastUrl : null,
	lastTime : 0,
	
	sectionHeight : 200,
	sections : 20,
	
	lastUpdate : 0,
	
	load : function () {
		removeEventListener("load", TRUE_COLORS.load, false);
		
		var container = gBrowser.tabContainer;
		container.addEventListener("TabSelect", TRUE_COLORS.getAverageColor, false);
		
		addEventListener("resize", TRUE_COLORS.resizeEvent, false);
		
		getBrowser().addEventListener("load", TRUE_COLORS.loadEvent, false);
		getBrowser().addEventListener("DOMMouseScroll", TRUE_COLORS.scrollEvent, false);
		
		TRUE_COLORS.statusBar = document.getElementById("status-bar");
		TRUE_COLORS.tabBar = document.getAnonymousElementByAttribute(document.getElementById("content"), "anonid", "tabcontainer");
		
		var canvas = document.getElementById("true_colors_buffer_canvas");
		canvas.style.height = TRUE_COLORS.sectionHeight + "px";
		canvas.height = TRUE_COLORS.sectionHeight;
		canvas.style.width = window.innerWidth + "px";
		canvas.width = window.innerWidth;
		
		addEventListener("unload", TRUE_COLORS.unload, false);
	},
	
	unload : function () {
		removeEventListener("unload", TRUE_COLORS.unload, false);
		
		var container = gBrowser.tabContainer;
		container.removeEventListener("TabSelect", TRUE_COLORS.getAverageColor, false);
		
		removeEventListener("resize", TRUE_COLORS.resizeEvent, false);
		
		getBrowser().removeEventListener("load", TRUE_COLORS.loadEvent, false);
		getBrowser().removeEventListener("DOMMouseScroll", TRUE_COLORS.scrollEvent, false);
	},
	
	scrollTimer : null,
	
	scrollEvent : function () {
		clearTimeout(TRUE_COLORS.scrollTimer);
		
		TRUE_COLORS.scrollTimer = setTimeout(function () { TRUE_COLORS.lastUrl = ""; TRUE_COLORS.getAverageColor(); }, 500);
	},
	
	resizeEvent : function () {
		var canvas = document.getElementById("true_colors_buffer_canvas");
		canvas.style.height = TRUE_COLORS.sectionHeight + "px";
		canvas.height = TRUE_COLORS.sectionHeight;
		canvas.style.width = window.innerWidth + "px";
		canvas.width = window.innerWidth;
		
		TRUE_COLORS.scrollEvent();
	},
	
	loadEvent : function () {
		TRUE_COLORS.lastUrl = "";
		TRUE_COLORS.getAverageColor();
	},
	
	getAverageColor : function (e) {
		if (TRUE_COLORS.lastUrl == content.document.location.href) {
			return;
		}
		else {
			TRUE_COLORS.log(TRUE_COLORS.lastUrl + " " + content.document.location.href);
		}
		
		if (content.document.location.href.indexOf("http") !== 0) {
			document.getElementById("main-window").setAttribute("lwtheme","false");
			return;
		}
		
		TRUE_COLORS.lastUrl = content.document.location.href;
		
		var browser = getBrowser();
		var win = browser.getBrowserForTab(browser.selectedTab).contentWindow;
		var w = window.innerWidth;
		var stripeLocation = win.document.documentElement.scrollTop;
		
		var canvas = document.getElementById("true_colors_buffer_canvas");
		var context = canvas.getContext("2d");
		
		context.drawWindow(win, 0, stripeLocation, w, stripeLocation + TRUE_COLORS.sectionHeight, "rgb(255,255,255)");
		
		TRUE_COLORS.fillBackgroundWithGradient(canvas, context, TRUE_COLORS.tabBar, w);
		
		stripeLocation += win.innerHeight;
		stripeLocation -= TRUE_COLORS.sectionHeight;
		
		context.drawWindow(win, 0, stripeLocation, w, stripeLocation + TRUE_COLORS.sectionHeight, "rgb(255,255,255)");
		TRUE_COLORS.fillBackgroundWithGradient(canvas, context, TRUE_COLORS.statusBar, w);
		
		/*
		var footerImage = TRUE_COLORS.getImage(canvas, context, w);
		var headerImage = TRUE_COLORS.getImage(canvas, context, w);
		
		document.getElementById("main-window").setAttribute("lwtheme","true");
		
		var theme = {
			"id" : "true-colors-" + Math.random(),
			"name" : "True Colors",
			"headerURL" : headerImage,
			"footerURL" : "http://img0.fark.net/images/2002/links/new/bbcnews.gif",//footerImage,
			"textcolor" : "#000",
			"accentcolor" : "#fff"
		};
		
		LightWeightThemeWebInstaller._install(theme);
		*/
	},
	
	getImage : function (canvas, context, w) {
		var section_width = Math.floor(w / TRUE_COLORS.sections);
		
		var colors = [];
		
		for (var section = 0; section < TRUE_COLORS.sections; section++) {
			var img_data = context.getImageData(section * section_width, 0, section_width, TRUE_COLORS.sectionHeight);
	
			var length = img_data.data.length;

			var color = [0, 0, 0];

			for (var i = 0; i < length; i += 4) {
				color[0] += img_data.data[i];
				color[1] += img_data.data[i+1];
				color[2] += img_data.data[i+2];
			}

			color[0] = Math.round(color[0] / length);
			color[1] = Math.round(color[1] / length);
			color[2] = Math.round(color[2] / length);

			color = TRUE_COLORS.rgb2hsv(color);
			color[1] = Math.min(100, color[1] * 1.8); // saturation
			color[2] = Math.min(100, color[2] * 3.0); // brightness
			color = TRUE_COLORS.hsv2rgb(color);
	
			colors.push(color);
		}
		
		context.clearRect(0, 0, w, TRUE_COLORS.sectionHeight);

		var gradient = context.createLinearGradient(0, 0, w, 0);
		var length = colors.length;
		
		for (var i = 0; i < length; i++) {
			gradient.addColorStop(i / length, 'rgba(' + colors[i].join(",") + ', 0.5)');
		}
		
		context.fillStyle = gradient;
		context.fillRect(0, 0, w, TRUE_COLORS.sectionHeight);

		var url = canvas.toDataURL("image/png");
		return url;
	},
	
	fillBackgroundWithGradient : function (canvas, context, node, w) {
		var section_width = Math.floor(w / TRUE_COLORS.sections);
		
		var colors = [];
		
		for (var section = 0; section < TRUE_COLORS.sections; section++) {
			var img_data = context.getImageData(section * section_width, 0, section_width, TRUE_COLORS.sectionHeight);
	
			var length = img_data.data.length;

			var color = [0, 0, 0];

			for (var i = 0; i < length; i += 4) {
				color[0] += img_data.data[i];
				color[1] += img_data.data[i+1];
				color[2] += img_data.data[i+2];
			}

			color[0] = Math.round(color[0] / length);
			color[1] = Math.round(color[1] / length);
			color[2] = Math.round(color[2] / length);

			color = TRUE_COLORS.rgb2hsv(color);
			color[1] = Math.min(100, color[1] * 1.8); // saturation
			color[2] = Math.min(100, color[2] * 3.0); // brightness
			color = TRUE_COLORS.hsv2rgb(color);
	
			colors.push(color);
		}
		
		context.clearRect(0, 0, w, TRUE_COLORS.sectionHeight);

		var gradient = context.createLinearGradient(0, 0, w, 0);
		var length = colors.length;
		
		for (var i = 0; i < length; i++) {
			gradient.addColorStop(i / length, 'rgba(' + colors[i].join(",") + ', 0.5)');
		}
		
		context.fillStyle = gradient;
		context.fillRect(0, 0, w, TRUE_COLORS.sectionHeight);

		var url = canvas.toDataURL("image/png");
		node.style.setProperty("background-image","url('" + url + "')", "important");
	},

	logTime : function (msg) {
		var now = new Date().getTime();
		
		if (msg) {
			TRUE_COLORS.log(msg + ": " + (now - TRUE_COLORS.lastTime));
		}
		
		TRUE_COLORS.lastTime = now;
	},
	
	log : function (message) {
		var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		consoleService.logStringMessage(message);
	},
	
	/**
	 * Convers RGB color to HSV model
	 * @param {Number[]} RGB color
	 * @return {Number[]} HSV color
	 */
	
	rgb2hsv : function (color) {
		var r = color[0] / 255,
			g = color[1] / 255,
			b = color[2] / 255;

		var x, val, d1, d2, hue, sat, val;

		x = Math.min(Math.min(r, g), b);
		val = Math.max(Math.max(r, g), b);

		d1 = (r == x) ? g-b : ((g == x) ? b-r : r-g);
		d2 = (r == x) ? 3 : ((g == x) ? 5 : 1);

		hue = Math.floor((d2 - d1 / (val - x)) * 60) % 360;
		sat = Math.floor(((val - x) / val) * 100);
		val = Math.floor(val * 100);

		return [hue, sat, val];
	},
	
	/**
	 * Convers HSV color to RGB model
	 * @param {Number[]} RGB color
	 * @return {Number[]} HSV color
	 */
	
	hsv2rgb : function (color) {
		var h = color[0],
			s = color[1],
			v = color[2];

		var r, g, a, b, c, s = s / 100, v = v / 100, h = h / 360;

		if (s > 0) {
			if (h >= 1) h=0;

			h = 6 * h;
			var f = h - Math.floor(h);
			a = Math.round(255 * v * (1 - s));
			b = Math.round(255 * v * (1 - (s * f)));
			c = Math.round(255 * v * (1 - (s * (1 - f))));
			v = Math.round(255 * v);

			switch (Math.floor(h)) {
				case 0: r = v; g = c; b = a; break;
				case 1: r = b; g = v; b = a; break;
				case 2: r = a; g = v; b = c; break;
				case 3: r = a; g = b; b = v; break;
				case 4: r = c; g = a; b = v; break;
				case 5: r = v; g = a; b = b; break;
			}

			return [r || 0, g || 0, b || 0];

		} else {
			v = Math.round(v * 255);
			return [v, v, v];
		}
	}
};