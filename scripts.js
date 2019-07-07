var CIRCLE_WIDTH = 30;

var nodes = [];
var seen = [];
var messages = [
    "Click to place node.",
    "Click on node to delete.",
    "Click on node, then on other node to connect them.",
    "Click on line to delete.",
    "Click and drag node to move it."
];

var selected = -1;
const NEW_NODE = 0; 
const DELETE_NODE = 1;
const NEW_LINE = 2;
const DELETE_LINE = 3;
const MOVE_NODE = 4;

$(function() {
//	console.log("ready");
    
    $(".control").click(function() {
        var index = $(".control").index($(this));
//        console.log(index);
        
        $(".control").removeClass("selected");
        $(this).addClass("selected");
        
        $("#message").html(messages[index]);
        
        selected = index;
    });
    
    $("#stage").click(function(e) {  
        var pos = $(this).offset();
        //console.log(e.pageX + ", " + e.pageY);
        //console.log(pos.left + ", " + pos.top);
        if(selected == NEW_NODE) {
            handleAddNode(e.pageX - pos.left, e.pageY - pos.top);
        }
        else if (selected == DELETE_NODE) {
            
        }
    });
    
    $("#stage").on("click", ".node", function(e) {
        console.log("node clicked");
        console.log($(this));
        if(selected == DELETE_NODE) {
            console.log("delete node clicked");
            handleDeleteNode($(this));
        }                 
    });
    
    function handleAddNode(xCoord, yCoord) {
//        console.log(xCoord, yCoord);
        //check if inside limits
        if(xCoord < CIRCLE_WIDTH / 2 || yCoord < CIRCLE_WIDTH / 2) {
            return;
        }
        var node = {x: xCoord, y:yCoord};
        nodes.push(node);
        var circle = $("<div></div>").addClass("node");
        xCoord -= CIRCLE_WIDTH / 2;
        yCoord -= CIRCLE_WIDTH / 2;
        circle.css("left", Math.round(xCoord));
        circle.css("top", Math.round(yCoord));
        circle.html(nodes.length - 1);
        $("#stage").append(circle);
    }

    function handleDeleteNode(node) {
        var index = $(".node").index(node);
        console.log(index);
        nodes.splice(index, 1);
        node.remove()
    }
    
    window.setInterval(function(){
        
    }, 100);
});	
