"use strict";

var cards = [],
	colors = ["lime", "blue", "red", "green", "purple", "gold", "silver", "cyan", "gray"],
	flipTime = 1, clicks = 0;

function flip(e, newColor, newImage) {
	// start animation
	e.style.animation = "flip " + flipTime + "s 1";
	e.style.WebkitAnimation = "flip " + flipTime + "s 1";

	// reset animation
	setTimeout(function() {
		e.style.animation = "";
		e.style.WebkitAnimation = "";
	}, flipTime * 1000);

	// color change
	setTimeout(function() {
		if(newColor !== null)
			e.style.backgroundColor = newColor;
		if(newImage !== null)
			e.src = newImage;
	}, flipTime * 333); // when the flip animation is 1/2 finished
	// somewhy the animation is at 1/2 when only 1/3 of the time has passed
}

function init() {
	for(var i=1; i<=3; i++) {
		cards[i] = [];
		for(var j=1; j <= 3; j++) {
			cards[i][j] = document.getElementById(""+i+j);
			cards[i][j].style.backgroundColor = colors[Math.floor(Math.random()*9)];
			cards[i][j].onclick = function() {
				// if the animation is not over, exit
				if(this.style.animation !== "") return;

				clicks++;

				// flip animation
				flip(this, colors[Math.floor(Math.random()*9)], null);

				// check win
				setTimeout(win, flipTime * 1000);
			}
		}
	}
}

function win() {
	if(!checkWin()) return;

	// show the retry and facebook share buttons
	flip(cards[3][3], null, "fblogo.png");
	flip(cards[3][1], null, "retry.png");
	cards[3][3].onclick = facebookClick;			// Share on facebook
	cards[3][1].onclick = function() {
		window.location.reload();	// Reload the game
	};

	// show the "you won" and click count cards
	flip(cards[1][2], null, "win.png");
	flip(cards[2][2], "", null);
	cards[2][2].className = "";
	document.getElementById("clickCount").innerHTML = clicks + "<br/>clicks";
}

function checkWin() {
	var c = cards[1][1].style.backgroundColor;
	for(var i=1; i<=3; i++)
		for(var j=1; j <= 3; j++)
			if(cards[i][j].style.backgroundColor !== c)
				return false;
	return true;
}

function facebookClick() {
	FB.ui({
			method: "feed",
			link: "mahham.ws/projects/colorFly",
			name: "I won with "+clicks+" clicks!",
			description: "Make all the card colors match and compete with your friends on who gets the best score!",
			caption: "colorfly",
			picture: "mahham.ws/projects/colorFly/icon.png"
		});
}
