//☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃


var G = {
	width: 800,	height: 600,
	title: "Death in front",
	ctx: null, canv: null,
	gameState: "LOGOS",
	interval: null,
	lastTime: null, time: 0.0,
	LMB: false, MMB: false, RMB: false,
	keys: new Array(256),
	entities: new Array(501),
	projectile: {dir: 0, active: false, x: 0, y: 0},
	playerCooldown: 1000,
	player: {x: 320, y: 240, hp: 5, orientation: 'N', walking: false, faction: 0, active:true, animationSpeed: 0.01, walkSpeed: 0.1, tX: 320, tY: 240, dX: 0, dY: 0, weapon: "FIST"},
	deltaRotX: [+1, +1,  0, -1, -1, -1,  0, +1],
	deltaRotY: [ 0, +1, +1, +1,  0, -1, -1, -1],
	gunrot: 0,
	score: 0,
	lmb: null,
	weapon: 0, //0 is spoon, 1 is gun
	mouseAngle: 0,
	zombieCount: 0,
	light:true,
	tiles: new Array(20),
	zombies: new Array(500),
	newWepTime: 0,
	mousePos: {x: 0, y: 0},
	spritesheet: null,
	lagMagicNumber: 1000,	//we want to have 10<deltaTime<50 most of the time, so we count form 0 to lagMagicNumber every tick to slow down the game a bit or a lot
	init: function() {
		G.canv = document.getElementById("gameCanvas");
		G.ctx = G.canv.getContext("2d");
		document.title = G.title;
		G.canv.width = G.width; G.canv.height = G.height;
		G.interval = setInterval(G.tick, 0);
		G.lastTime = Date.now();
		for(i=0; i<256; i++)
			G.keys[i] = false;
		document.onkeydown = function(e) {e = e || event;G.keys[e.keyCode] = true;}
		document.onkeyup = function(e)   {e = e || event;G.keys[e.keyCode] = false; if(e.keyCode==70)G.light=!G.light;}
		G.canv.addEventListener('mousemove', function(evt) {G.mousePos = G.getMousePos(G.canv, evt);}, false);
		G.canv.addEventListener('mousedown', function(evt) {G.getMouseButtons(evt, true);}, false);
		G.canv.addEventListener('mouseup', function(evt) {G.getMouseButtons(evt, false);}, false);
		document.getElementById("FTG_sound").play();
		for(i=0;i<500;i++){
			G.zombies[i] = {hp: 5,								//zombies
							x:Math.round(Math.random()*700 + 50), tX:0, 
							y:Math.round(Math.random()*500 + 50), tY:0, 
							active:false, orientation: 'N', walking: false, faction: 1, cooldown: 1000,
							walkSpeed: (Math.random()*0.075 + 0.025) , animationSpeed: 0.01};
			G.zombies[i].animationSpeed = G.zombies[i].walkSpeed / 10;
		}
		G.tiles =  [[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
					[3, 4, 5, 4, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
					[3, 6, 8, 6, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 5, 4, 5, 4, 5, 4, 5, 3],
					[3, 4, 5, 4, 5, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 6, 8, 6, 8, 6, 8, 6, 8, 3],
					[3, 6, 8, 6, 8, 1, 1, 1, 1, 2, 2, 1, 1, 1, 2, 1, 4, 5, 4, 5, 4, 5, 4, 5, 3],
					[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 8, 6, 8, 6, 8, 6, 8, 3],
					[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 5, 4, 5, 4, 5, 4, 5, 3],
					[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 6, 8, 6, 8, 6, 8, 6, 8, 3],
					[3, 2, 1, 2, 1, 1, 1, 1, 2, 2, 2, 1, 2, 2, 1, 1, 4, 5, 4, 5, 1, 2, 4, 5, 3],
					[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 6, 8, 6, 8, 6, 8, 6, 8, 3],
					[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 5, 1, 1, 1, 1, 3],
					[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
					[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 3],
					[3, 2, 1, 1, 1, 2, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 2, 2, 1, 3],
					[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
					[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
					[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
					[3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
					[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]];
		G.spritesheet = document.getElementById("Sprsheet");
	},
	clearCanvas: function(){G.ctx.fillStyle="#000";G.ctx.fillRect(0,0,G.width,G.height);},
	tick: function() {
		var now = Date.now();var delta = now - G.lastTime;G.lastTime = now;
		G.update(delta);G.draw();
		for(i=0;i<G.lagMagicNumber;i++){}
	},
	update: function(dt) {
		G.time+=dt;
		if(dt<10)
			G.lagMagicNumber = Math.round(G.lagMagicNumber * 1.5);
		if(dt>50)
			G.lagMagicNumber = Math.round(G.lagMagicNumber / 1.5);
		if(G.lagMagicNumber === 0)
			G.lagMagicNumber = 1;
		G.debug("DletaTime: " + dt, 0);
		G.debug("Dt magic number: " + G.lagMagicNumber, 1);
		G.debug("Time: " + G.time, 2);
		var arrow_keys   = true,
			qwerty       = true,
			azerty       = true;
		switch(G.gameState) {
			case "PLAY":
				G.playerCooldown -= dt;
				for(i=0;i<500;i++)
					if(G.zombies[i].active)
						G.zombies[i].cooldown -= dt;
				if(G.projectile.cooldown<990)
					G.projectile.active=false;
				for(i=0;i<500;i++)
					if(G.zombies[i].hp<1&&G.zombies[i].active){
						G.zombies[i].active = false;
						G.score++;
					}
				if(G.player.hp < 1){
					G.gameState = "LOST";
					document.getElementById("desc").play();
				}
				if(G.score > 499){
					G.gameState = "WON";
					document.getElementById("desc").play();
				}
				if(G.score === 10 && G.weapon === 0){
					G.weapon = 1;
					G.newWepTime = G.time + 1000;
					document.getElementById("nweap").play();
				}
				if(Math.random()<0.005)
					G.zombies[++G.zombieCount].active = true;
				G.mouseAngle = Math.atan2(G.player.y-G.mousePos.y, G.player.x-G.mousePos.x);

				var dmin = 10;
				for(j=0;j<16;j++){
					if(dmin>Math.abs(G.mouseAngle - (j-8)*Math.PI/8)){
						dmin = Math.abs(G.mouseAngle - (j-8)*Math.PI/8);
						G.gunrot = Math.round(j/2);
					}
				}
				if(G.gunrot===8)
					G.gunrot=0;
				if(G.keys[27]) {
					G.setCookie("LD31_FTG_wave",G.curr_wave,1000);
					G.gameState = "MENU";
				}
				G.player.dX=G.player.dY=0;
				if((G.keys[37]===true&&arrow_keys)||(G.keys[65]&&qwerty)||(G.keys[81]&&azerty)) {	//	left
					G.player.dX = -dt;
				}
				if((G.keys[38]===true&&arrow_keys)||(G.keys[87]&&qwerty)||(G.keys[90]&&azerty)) {	//	up
					G.player.dY = -dt;
				}
				if((G.keys[39]===true&&arrow_keys)||(G.keys[68]&&qwerty)||(G.keys[68]&&azerty)) {	//	right
					G.player.dX = +dt;
				}
				if((G.keys[40]===true&&arrow_keys)||(G.keys[83]&&qwerty)||(G.keys[83]&&azerty)) {	//	down
					G.player.dY = +dt;
				}
				if(G.LMB) {
					G.attack();
				}
				G.player.tX=G.player.x+G.player.dX*G.player.walkSpeed;
				G.player.tY=G.player.y+G.player.dY*G.player.walkSpeed;
				G.ai(dt);
				break;
			case "LOGOS":
					if(G.time>3000) {
						G.gameState = "MENU";
						document.getElementById("TITLE_sound").play();
					}
					break;
				break;
			case "MENU":
				if(G.LMB){
					if(G.mousePos.x>540&&G.mousePos.y>300&&G.mousePos.x<750&&G.mousePos.y<390){
						G.gameState = "PLAY";
						G.score = 0;
						G.weapon = 0;
						G.player.hp = 5;
						for(i=0;i<500;i++){
							G.zombies[i].active=false;
							G.zombies[i].hp=5;
						}
					}
					if(G.mousePos.x>420&&G.mousePos.y>390&&G.mousePos.x<800&&G.mousePos.y<480)
						G.gameState = "CREDITS";
					if(G.mousePos.x>420&&G.mousePos.y>480&&G.mousePos.x<800&&G.mousePos.y<580)
						G.gameState = "HELP";
					G.LMB=false;
				}
				break;
			case "HELP":
				if(G.LMB){
					if(G.mousePos.x>360&&G.mousePos.y>300&&G.mousePos.x<740&&G.mousePos.y<550)
						G.gameState = "MENU";
					G.LMB=false;
				}
				break;
			case "LOST":
			case "WON":
				G.setCookie("LD31_FTG_wave", 1, 10000);
			case "CREDITS":
				if(G.keys[27])
					G.gameState = "MENU";
				break;
		}
	},
	draw: function() {
		G.clearCanvas();
		switch(G.gameState) {
			case "MENU":
				var nofocus = document.getElementById("MainMenuImage"),
					playfocus = document.getElementById("MainMenuPlayImage"),
					optifocus = document.getElementById("MainMenuSettingsImage"),
					helpfocus = document.getElementById("MainMenuHelpImage");
				G.ctx.drawImage(nofocus, 0, 0);
				if(G.mousePos.x>540&&G.mousePos.y>300&&G.mousePos.x<750&&G.mousePos.y<390)
					G.ctx.drawImage(playfocus, 0, 0);
				if(G.mousePos.x>420&&G.mousePos.y>390&&G.mousePos.x<800&&G.mousePos.y<480)
					G.ctx.drawImage(optifocus, 0, 0);
				if(G.mousePos.x>420&&G.mousePos.y>480&&G.mousePos.x<800&&G.mousePos.y<580)
					G.ctx.drawImage(helpfocus, 0, 0);
				break;
			case "PLAY":
				var gunspr = [document.getElementById("Gun0"),
							document.getElementById("Gun1"),
							document.getElementById("Gun2"),
							document.getElementById("Gun3"),
							document.getElementById("Gun4"),
							document.getElementById("Gun5"),
							null,
							document.getElementById("Gun7")],
					spoonspr = [document.getElementById("Spn0"),
							document.getElementById("Spn1"),
							document.getElementById("Spn2"),
							document.getElementById("Spn3"),
							document.getElementById("Spn4"),
							document.getElementById("Spn5"),
							null,
							document.getElementById("Spn7")],
					HP = [document.getElementById("Hp0"),document.getElementById("Hp1"),document.getElementById("Hp2"),document.getElementById("Hp3"),document.getElementById("Hp4"),document.getElementById("Hp5")];
				G.entities = G.zombies.concat([G.player]);
				G.entities.sort(function(a, b){return a.y-b.y;});
				for(i=0;i<19;i++) 
					for(j=0;j<25;j++)
						G.ctx.drawImage(G.spritesheet, 288 + (G.tiles[i][j] % 7) * 32, Math.floor(G.tiles[i][j] / 7) * 32, 32, 32, j*32, i*32, 32, 32);
				for(i=0;i<501;i++) {			//ENTITIES
					if(!G.entities[i].active) continue;
					if(!G.entities[i].walking) {
						switch(G.entities[i].orientation) {
							case 'S': G.ctx.drawImage(G.spritesheet, G.entities[i].faction*150,   0, 50, 100, G.entities[i].x - 10, G.entities[i].y - 20, 20, 40);break;
							case 'N': G.ctx.drawImage(G.spritesheet, G.entities[i].faction*150, 100, 50, 100, G.entities[i].x - 10, G.entities[i].y - 20, 20, 40);break;
							case 'W': G.ctx.drawImage(G.spritesheet, G.entities[i].faction*150, 200, 50, 100, G.entities[i].x - 10, G.entities[i].y - 20, 20, 40);break;
							case 'E': G.ctx.drawImage(G.spritesheet, G.entities[i].faction*150, 300, 50, 100, G.entities[i].x - 10, G.entities[i].y - 20, 20, 40);break;
						}
					} else {
						switch(G.entities[i].orientation) {
							case 'S': G.ctx.drawImage(G.spritesheet, G.entities[i].faction*150 + 50 + Math.floor(G.time * G.entities[i].animationSpeed) % 2 * 50,   0, 50, 100, G.entities[i].x - 10, G.entities[i].y - 20, 20, 40);break;
							case 'N': G.ctx.drawImage(G.spritesheet, G.entities[i].faction*150 + 50 + Math.floor(G.time * G.entities[i].animationSpeed) % 2 * 50, 100, 50, 100, G.entities[i].x - 10, G.entities[i].y - 20, 20, 40);break;
							case 'W': G.ctx.drawImage(G.spritesheet, G.entities[i].faction*150 + 50 + Math.floor(G.time * G.entities[i].animationSpeed) % 2 * 50, 200, 50, 100, G.entities[i].x - 10, G.entities[i].y - 20, 20, 40);break;
							case 'E': G.ctx.drawImage(G.spritesheet, G.entities[i].faction*150 + 50 + Math.floor(G.time * G.entities[i].animationSpeed) % 2 * 50, 300, 50, 100, G.entities[i].x - 10, G.entities[i].y - 20, 20, 40);break;
						}
					}
					if(G.weapon != 0){
						if(G.playerCooldown>950){
							G.ctx.lineWidth = 10;
							G.ctx.strokeStyle = "#ff8";
							G.ctx.beginPath();
						    G.ctx.moveTo(G.player.x + 10*G.deltaRotX[G.gunrot], G.player.y + 10*G.deltaRotY[G.gunrot]);
						    G.ctx.lineTo(G.player.x + 1000*G.deltaRotX[G.gunrot], G.player.y + 1000*G.deltaRotY[G.gunrot]);
						    G.ctx.stroke();
						}
					}
					if(G.gunrot!=6&&G.entities[i].faction==0)
						if(G.weapon === 1)
							G.ctx.drawImage(gunspr[G.gunrot], G.player.x - 100, G.player.y - 75, 200, 150);
						else{
							G.ctx.drawImage(spoonspr[G.gunrot], G.player.x - 100, G.player.y - 75, 200, 150);

						}
				}
				var lightmask = document.getElementById("Light");
				var nolight = document.getElementById("NoLight");
				G.ctx.translate(G.player.x, G.player.y);
				G.ctx.rotate(G.mouseAngle - Math.PI);
				if(G.light)
					G.ctx.drawImage(lightmask, 0, 0, 1024, 1024, 0, 0, 1024, 1024);
				G.ctx.scale(+1, -1);
				if(G.light)
					G.ctx.drawImage(lightmask, 0, 0, 1024, 1024, 0, 0, 1024, 1024);
				G.ctx.scale(-1, -1);
				G.ctx.drawImage(nolight, 0, 0, 512, 1024, -0.5, -1024, 1024, 2048);
				G.ctx.scale(-1, +1);
				if(!G.light)
					G.ctx.drawImage(nolight, 0, 0, 512, 1024, -0.5, -1024, 1024, 2048);
				G.ctx.rotate(-G.mouseAngle + Math.PI);
				G.ctx.translate(-G.player.x, -G.player.y);
				G.ctx.drawImage(HP[G.player.hp], 323, 562);
				if(G.newWepTime > G.time)
					G.ctx.drawImage(document.getElementById("nwep"),0,0);
				break;
			case "HELP":
				var help = document.getElementById("HelpImage"),
					hoverhelp = document.getElementById("HoverHelpImage");
				G.ctx.drawImage(help, 0, 0);
				if(G.mousePos.x>360&&G.mousePos.y>300&&G.mousePos.x<740&&G.mousePos.y<550)
					G.ctx.drawImage(hoverhelp, 0, 0);
				break;
			case "CREDITS":
				var credits = document.getElementById("Credits");
				G.ctx.drawImage(credits,0,0);
				break;
			case "WON":
				G.ctx.drawImage(document.getElementById("winImage"),0,0);
				break;
			case "LOST":
				G.ctx.drawImage(document.getElementById("loseImage"),0,0);
				G.ctx.font = 'bold 50pt Sans';
				G.ctx.fillStyle = "#98170a";
      			G.ctx.fillText(G.score, 320, 225);
				break;
			case "LOGOS":
				var logo = document.getElementById("LogoImage");
				G.ctx.drawImage(logo, 0, 0);
				break;
		}
	},
	pointOnCircle: function(center, radius) {
		var random_angle = Math.random() * Math.PI * 2;
		return {x:center.x+Math.cos(random_angle)*radius, y:center.y+Math.sin(random_angle)*radius};
	},
	ai: function(dt) {
		for(i=0;i<500;i++)	//for every zombie
			if(Math.random() > 0.975 && G.zombies[i].active){
				var player_distance = G.distance(G.zombies[i].x, G.zombies[i].y, G.player.x, G.player.y);
				if(player_distance < 40 && G.zombies[i].cooldown<0) {
					G.player.hp --;
					document.getElementById("ow").play();
					G.zombies[i].cooldown = 1000;
				}
				G.zombies[i].tX = G.pointOnCircle(G.player, player_distance/2).x;
				G.zombies[i].tY = G.pointOnCircle(G.player, player_distance/2).y;
			}
		for(i=0;i<501;i++){	//for every entity
			if(!G.entities[i].active) continue;
			if(G.distance(G.entities[i].x, G.entities[i].y, G.entities[i].tX, G.entities[i].tY)<1){
				G.entities[i].tX = G.entities[i].x;
				G.entities[i].tY = G.entities[i].y;
				G.entities[i].walking=false;
			}
			G.walk(G.entities[i], dt);
		}
	},
	walk: function(who, dt) {
		if(who.x<who.tX){
			if(G.tiles[Math.round(who.y/32)][Math.round((who.x+dt*who.walkSpeed)/32)]!=3){
				who.x+=dt*who.walkSpeed;
				who.orientation = "E";
				who.walking=true;
			}
		}
		if(who.x>who.tX){
			if(G.tiles[Math.round(who.y/32)][Math.round((who.x-dt*who.walkSpeed-16)/32)]!=3){
				who.x-=dt*who.walkSpeed;
				who.orientation = "W";
				who.walking=true;
			}
		}
		if(who.y<who.tY){
			if(G.tiles[Math.round((who.y+dt*who.walkSpeed)/32)][Math.round(who.x/32)]!=3){
				who.y+=dt*who.walkSpeed;
				who.orientation = "S";
				who.walking=true;
			}
		}
		if(who.y>who.tY){
			if(G.tiles[Math.round((who.y-dt*who.walkSpeed)/32)][Math.round(who.x/32)]!=3){
				who.y-=dt*who.walkSpeed;
				who.orientation = "N";
				who.walking=true;
			}
		}
	},
	distance: function(x1, y1, x2, y2) {
		return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
	},
	getMousePos: function(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {x: evt.clientX - rect.left,y: evt.clientY - rect.top};
    },
	getMouseButtons: function(evt, down) {
		evt = evt || window.event;
		var button = evt.which || evt.button;
		if(G.lmb==null)
			G.lmb=button;
		if(button==G.lmb)
			G.LMB=down;
	},
	setCookie: function(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+d.toUTCString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
	},
	getCookie: function(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i=0; i<ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1);
			if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
		}
		return "";
	},
	debug: function(d, r){
		document.getElementById("debug" + r).innerHTML = d;
	},
	lineRect: function(lX, lY, lD, rX, rY, rW, rH) {
		var r1 = Math.atan2(lY-rY,		lX-rX),			//top-left
			r2 = Math.atan2(lY-rY,		lX-rX-rW),		//top-right
			r3 = Math.atan2(lY-rY-rH,	lX-rX),			//bottom-left
			r4 = Math.atan2(lY-rY-rH,	lX-rX-rW),		//bottom_right
			min = Math.min(r1, r2, r3, r4), minf,
			max = Math.max(r1, r2, r3, r4), maxf;
		minf=min;maxf=max;
		if(min<-Math.PI/2 && max>+Math.PI/2){
			minf = max;
			maxf = min + Math.PI*2;
		}
		if(minf<lD && lD<maxf)
			return true;
		return false;
	},
	attack: function() {
		if(G.playerCooldown>0)return;
		G.playerCooldown = 1000;
		document.getElementById("hit").play();
		if(G.weapon===0)
			for(i=0;i<500;i++)
				if(G.zombies[i].active && G.zombies[i].hp > 0)
					if(G.distance(G.player.x, G.player.y, G.zombies[i].x, G.zombies[i].y) < 64){
						G.zombies[i].hp-=2;
						document.getElementById("ugh").play();
					}
		else
			for(i=0;i<500;i++)
				if(G.zombies[i].active && G.zombies[i].hp > 0)
					if(G.lineRect(G.player.x, G.player.y, G.gunrot * Math.PI / 4, G.zombies[i].x - 10, G.zombies[i].y - 20, 20, 40)){
						G.zombies[i].hp -= 3;
						document.getElementById("ugh").play();
					}
	}
};

