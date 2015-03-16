love.graphics.preload("res/titlebase.png","res/titletitle.png");
love.audio.preload("res/pop.mp3");

var g;
love.load = function() {
	g = {};
	g.pop = love.audio.newSource("res/pop.mp3");
	g.titlebase = love.graphics.newImage("res/titlebase.png");		//title screen background (seal face)
	g.titletitle = love.graphics.newImage("res/titletitle.png");	//title screen title ("seals united" text)
	g.titleX = -1000;
	g.titleY = -300;
	g.ameState = "title";
	g.popd=0;
}

love.draw = function() {
	love.graphics.setColor(106, 58, 58, 255);
	love.graphics.rectangle("fill", 0, 0, 360, 640);
	if(g.ameState == "title"){
		love.graphics.draw(g.titlebase, g.titleX, 0, 0, 0.5, 0.5, 0, 0);
		love.graphics.draw(g.titletitle, 0, g.titleY, 0, 0.5, 0.5, 0, 0);
	}
}

love.update = function(dt) {
	if(g.titleX < 0)
		g.titleX += dt * 600;
	if(g.titleX > 0){
		g.titleX = 0;
	}
	if(g.titleX==0&&g.popd==0){
		love.audio.stop(g.pop);
		love.audio.play(g.pop);
		g.popd=1;
	}
	if(g.titleY==0&&g.popd==1){
		love.audio.stop(g.pop);
		love.audio.play(g.pop);
		g.popd=2;
	}
	if(g.titleX>-200&&g.titleY<0){
		g.titleY += dt * 600;
	}
	if(g.titleY>0)
		g.titleY=0;
}