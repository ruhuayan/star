/*******Author: ruhua Yan 
 *      From: www.richyan.com
 **/

var fSPEED =10, vDir = 15, aSpeed = 100; // fSPEED - fighter speed // aSpeed - animate speed //vDir - arrow moving speed
var ARRH = 10, FW = 42, FH=58, EW=40, EH=44;   // ARRH- arrow height // FW - flight width // EW - enemy width
var conLeft = $('#conLeft'); 
var fighter = $('.fighter');
var CL = conLeft.offset().left, CT = conLeft.offset().top, CW = conLeft.innerWidth(), CH = conLeft.innerHeight();
fighter.css({'top': CT+450, 'left': CL + CW/2,  'visibility': 'visible'});
var isPlaying=false;
var scores=0, level=1, mm, ss;
document.body.addEventListener('keydown', function(evt){
    switch (evt.keyCode){
        case 37: //left
            moveFighter(-fSPEED, true);
            break;
        case 39: //right
            moveFighter(fSPEED, true);
            break;
        case 38: // up
            moveFighter(-3, false);
            break;
        case 40: //down
            moveFighter(3, false);
            break;
        case 32:  // spacebar
            if(isPlaying) pause(); 
            else if(lost) reload();
            else play();
            break;
    }  
});

function moveFighter(speed, horizontal){
	var leftPos = fighter.offset().left;
        var topPos = fighter.offset().top;
        if(horizontal){
            if((leftPos <= CL ) && (speed<0)) speed=0;
            if((leftPos >= CL + CW - FW) && (speed>0)) speed=0; 
            leftPos += speed;
            fighter.css({'left': leftPos});
        }else{
            if((topPos < CT) && (speed<0)) speed=0;
            if((topPos > CT + CH - FH) && (speed>0)) speed=0;
            topPos +=speed;
            fighter.css({'top':topPos});
        }	
}//end funtion moveFighter

var enemyList = [], eNum=4, pSec=8;            // eNum -  number of enemies to be created at the same time
var count = 0, lost=false; 
function play(){
    isPlaying=true;
    mm = 0, ss = 0; 
    $('.conSubTitle').html('<a href="javascript: pause();" style=" background-color:#f0f0f0; padding: 2px; border:1px solid #e0e0e0;">Click to pause</a>'); 
    createEnemy();
}
function pause(){ window.alert("Pause");}
function createEnemy(){
        if(lost){
            isPlaying=false;
            clearTimeout(timerID); 
            $('.conSubTitle').html('<a href="javascript: reload();" style=" background-color:#f0f0f0; padding: 2px; border:1px solid #e0e0e0;">Click to reload</a>'); 
            return;}
        createArrow(fighter, false);                   //fighter launches arrow
        var pos, rand = Math.random();                  // pos - random position of enemy
        if(count++%(pSec*2)===0){                             // create enemy in every 8 sec
            for (i=0; i<eNum; i++){
                pos = pos=== undefined? parseInt(rand*(CW/3)):pos;
                var eDiv;
                if(i===parseInt(rand*(eNum-1))+1){     // to make sure bomber will start on the 2nd
                    eDiv = $('.bomber').clone().attr('class', 'b');
                }else{
                    eDiv = $('.enemy').clone().attr('class', 'enemy'+count);
                }
                //var eDiv =$('.enemy').clone();
                eDiv.css({'top': CT, 'left': CL + pos, 'visibility': 'visible'}).appendTo(conLeft); 
                pos +=100;
                enemyList.push(eDiv);
            }
            
        }
        for(i=0; i<enemyList.length; i++){
            var cValue =enemyList[i].attr('class');
            if(cValue!=='b'){
                var yPos = enemyList[i].offset().top;
                var xPos = enemyList[i].offset().left;
                var a = fighter.offset().left - xPos;
                var b = fighter.offset().top - yPos;
                var deg = -Math.round(Math.atan2(a, b) * (180/Math.PI));
                var rotate = "rotate(" + deg + "deg)"; 
                enemyList[i].css({"-webkit-transform":rotate, "-moz-transform": rotate, "transform":rotate , "-o-transform": rotate});
            }
            if(count%2===0) attack(enemyList[i]);   
            if(i%2===count%pSec && yPos<fighter.offset().top)                             // enemy launch arrow one in 5 sec
                createArrow(enemyList[i], true);
        }
        if(count%2===1){ //  to make 1 sec = aSpeed*5*2
            ss++; 
            if(ss>=60) {mm++; ss=0;}
            if(ss<10) $('span.ss').html("0"+ss);
            else $('span.ss').html(ss);
            if(mm<10) $('span.mm').html("0"+mm);
            else $('span.mm').html(mm);
        }
        timerID = setTimeout(function(){createEnemy();}, aSpeed*5);
}
function attack(eDiv){
    var topPos = eDiv.offset().top;
    var leftPos = eDiv.offset().left;
    if(topPos >= CT + CH - FH){                         //enemyDiv crash to the ground
        eDiv.animate({'opacity': 0, 'top': CT+CH-EH/2}, 'slow', function(){
            enemyList.splice(enemyList.indexOf(eDiv),1);
            eDiv.remove();
            delete eDiv; 
            return;
        });
    }
    // when enemy crashes to our fly fighter
    else if(topPos < fighter.offset().top +FH && topPos+EH>fighter.offset().top && leftPos+EW>fighter.offset().left && leftPos<fighter.offset().left+FW){
        enemyList.splice(enemyList.indexOf(eDiv),1);
        eDiv.remove();
        delete eDiv; 
        fighter.remove();
        lost = true;
        setText(topPos, leftPos);
        return;
    }else{
        eDiv.css({'top': topPos + vDir});
    }
}

function createArrow(qDiv,enemy){
        var arrDiv = document.createElement("div");
	arrDiv.setAttribute('id',"arrow");
	arrDiv.style.position="absolute";
        arrDiv.style.fontWeight = 'bolder';
        var x= qDiv.offset().left;
        var y = qDiv.offset().top;
        var xSpeed, ySpeed;
        if(enemy){                             // arrow from enemy towards our fighter
            if(qDiv.attr('class')==='b'){
                enemy = 2;
            }
            arrDiv.innerHTML = "|||";
            arrDiv.style.fontSize = "6px";
            arrDiv.style.top=(y + EH/2)+"px";
            arrDiv.style.left =(x + EW/2)+"px";
            // to make sure speed not exceed vDir
            if(fighter.offset().left-x<fighter.offset().top-y){
                xSpeed = Math.round((fighter.offset().left-x)/(fighter.offset().top-y)*vDir);
                ySpeed = vDir;
            }else{
                ySpeed = Math.round((fighter.offset().top-y)/(fighter.offset().left-x)*vDir);
                xSpeed = vDir;
            }
            
        }else{
            arrDiv.innerHTML = "|";
            arrDiv.style.color = "#DC143C";
            arrDiv.style.top=(y-ARRH)+"px";
            arrDiv.style.left =(x + FW/2)+"px";
        }
        conLeft.append(arrDiv);
        launchArrow(arrDiv, enemy, xSpeed, ySpeed);
}

function launchArrow(arrDiv,enemy, xSpeed, ySpeed){
    var topPos = parseInt(arrDiv.style.top); 
    var leftPos = parseInt(arrDiv.style.left);
    if(enemy){
        var aw = 0; // arrow width
        if(enemy===2){
            var oh = arrDiv.innerHTML;
            arrDiv.innerHTML = oh + "||";
            aw = arrDiv.clientWidth || arrDiv.offsetWidth;
        }
         if(topPos>=CT+CH-vDir||leftPos <= CL||leftPos>=CL+CW) {
            document.getElementById('conLeft').removeChild(arrDiv);
            delete arrDiv;
            return;
        }
        // when enemy arrow hits our fighter
        if( topPos < fighter.offset().top +FH && topPos+vDir>fighter.offset().top && leftPos+aw>fighter.offset().left && leftPos<fighter.offset().left+FW){
                fighter.remove();
                document.getElementById('conLeft').removeChild(arrDiv);   // this works both on IE and chrome
                //arrDiv.remove();                                        // this works on Chrome, but not on IE
                lost = true;
                setText(topPos, leftPos);
                return;
        }//console.log(xSpeed);
        arrDiv.style.left = (leftPos+xSpeed) + 'px';
        arrDiv.style.top = (topPos + vDir) + "px";   
    }else{                                    // fighter launch arrow
        if(topPos<=CT) {
            document.getElementById('conLeft').removeChild(arrDiv);
            delete arrDiv;
            return;
        }
        //chenck if the arrow hits enemy
        for(i=0; i<enemyList.length; i++)
            if( topPos < enemyList[i].offset().top +EH*3/4 && leftPos>enemyList[i].offset().left && leftPos<enemyList[i].offset().left+EW){
                enemyList[i].remove();
                enemyList.splice(i,1);
                document.getElementById('conLeft').removeChild(arrDiv);
                delete arrDiv;
                $('p#score').css({'top': topPos, 'left': leftPos})
                        .animate({'opacity': 1}, 'fast')
                        .animate({'opacity': 0}, 'fast');
                scores += 100;
                $('span.scores').html(scores);
                checkScores();
                return;
            }
        arrDiv.style.top = (topPos - vDir-5) + "px"; 
    }
    
    timerID = setTimeout(function(){launchArrow(arrDiv, enemy, xSpeed, ySpeed);}, aSpeed*2);
}
function setText(x, y){
        $("p#score").html('You have lost !!!')
                .css({'top': x, 'left': y})
                .animate({'opacity': 1}, 'fast');
}
function checkScores(){
        if(scores>=2000*level){
           $('span.level').html(++level);
           pSec--;
           //eNum++;
        }
}
window.addEventListener("scroll", reload, false);
window.addEventListener("resize", reload, false);
function reload(){
   window.open('http://www.richyan.com/javascript/starwar.php', '_self');
}


