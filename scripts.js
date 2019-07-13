var CIRCLE_WIDTH = 30;
var LINE_HEIGHT = 2;

var nodes = [];
var seen = [];
var edges = [];
var messages = [
    "Click to place node.",
    "Click on node to delete.",
    "Click on node, then another node to connect them.",
    "Click on line to delete.",
    "Click and drag node to move it."
];

var selected = -1;
const NEW_NODE = 0; 
const DELETE_NODE = 1;
const NEW_LINE = 2;
const DELETE_LINE = 3;
const MOVE_NODE = 4;

var mouseOver = false;

var nodeHeld = null;
var lineDisplayer;


$(function() {
//	console.log("ready");
    
    $(".control").click(function() {
        console.log("clicked");
        var index = $(".control").index($(this));
//        console.log(index);
        
        $(".control").removeClass("selected");
        $(this).addClass("selected");
        
        $("#message").html(messages[index]);
        
        selected = index;
        if(selected == NEW_LINE) {
            //to wipe out data from last time
            nodeHeld = null; 
            $("#tempLine").css("top", 0)
        $("#tempLine").css("left", 0);
        $("#tempLine").css("width", 0);
        }
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
    
    $("#stage").mouseenter(function() {
//        console.log("entered!");
        if(selected == NEW_LINE && nodeHeld != null) {
            $("#tempLine").show();
        }
        mouseOver = true;
    });
    
    $("#stage").mouseleave(function() {
//        console.log("left!");
        if(selected == NEW_LINE) {
            $("#tempLine").hide();
        }
        mouseOver = false;
    });
    
    $("#stage").mousemove(function(e) {
        if(selected == NEW_LINE && nodeHeld != null) {
            var pos = getXandY(e);
            console.log(pos.x + " " + pos.y);
            console.log("active");
            var line = createLine(parseInt(nodeHeld.css("left")) + CIRCLE_WIDTH / 2,
                                  parseInt(nodeHeld.css("top")) + CIRCLE_WIDTH / 2,
                                  pos.x, 
                                  pos.y);
            $("#tempLine").css("left", line.css("left"));
            $("#tempLine").css("top", line.css("top"));
            $("#tempLine").css("width", line.css("width"));
            $("#tempLine").css("transform", line.css("transform"));
        }
    })
    
    $("#stage").on("click", ".node", function(e) {
        console.log("node clicked");
        console.log($(this));
        if(selected == DELETE_NODE) {
            console.log("delete node clicked");
            handleDeleteNode($(this));
        }
        if(selected == NEW_LINE) {
            handleAddLine($(this));
        }
    });
    
//    $("svg").on("click", "line", function(e) {
//       if(selected == DELETE_LINE) {
//           console.log('clicked!');
//       } 
//    });
    
    //only call if mouse over #stage
    function getXandY(event) {
        var pos = $("#stage").offset();
        return {x:(event.pageX - pos.left), y:(event.pageY - pos.top)};
    }
    
    function createLine(x1, y1, x2, y2) {
        var line = $("<div></div>");
        line.addClass("line");
        var xDiff = Math.abs(x1 - x2);
        var yDiff = Math.abs(y1 - y2);
        var width = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        line.css("left", Math.round((x1 + x2) / 2 - width / 2));
        line.css("top", Math.round((y1 + y2) / 2 - LINE_HEIGHT / 2));
        line.css("width", width);
        var angle = Math.asin(yDiff / width) * 180 / Math.PI;
        if(((y2 - y1) / (x2 - x1)) < 0) {
            console.log("slope: " + ((y2 - y1) / (x2 - x1)))
            angle *= -1;
        }
        console.log(angle);
        line.css("transform", "rotate(" + Math.round(angle) + "deg)");
        return line;
    }
    
    function handleAddNode(xCoord, yCoord) {
//        console.log(xCoord, yCoord);
        //check if inside limits
        if((xCoord < CIRCLE_WIDTH / 2 || yCoord < CIRCLE_WIDTH / 2) || 
           xCoord > $("#stage").width() - CIRCLE_WIDTH / 2  || 
            yCoord > $("#stage").height() - CIRCLE_WIDTH / 2) {
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
        //delete associated edges
        for(ind = 0; ind < edges.length; ind++) {
            var edge = edges[ind];
            if(edge.a.is(node) || edge.b.is(node)) {
                console.log(edge);
                
                edge.nodeline.hide();
                edges.splice(ind, 1);
                ind--;
            }
        }
        resetSvg();
        var index = $(".node").index(node);
        console.log(index);
        nodes.splice(index, 1);
        node.remove()
    }
    
    function handleAddLine(node) {
        
        if(nodeHeld == null) {
            nodeHeld = node;
            console.log("adding point 1");
            $("#tempLine").show();
            return;
        }
        console.log("appended line");
        
        
//        console.log( + " " + parseInt(nodeHeld.css("top")) + " " + 
//                    parseInt(node.css("left")) + " " + parseInt(node.css("top"))); 
        //$("svg").append(line);
        var line = createLine(parseInt(nodeHeld.css("left")) + CIRCLE_WIDTH / 2, 
                              parseInt(nodeHeld.css("top")) + CIRCLE_WIDTH / 2,
                              parseInt(node.css("left")) + CIRCLE_WIDTH / 2,
                              parseInt(node.css("top")) + CIRCLE_WIDTH / 2);
        $("#stage").append(line);
//       var line = "<line x1='" + (parseInt(nodeHeld.css("left")) + CIRCLE_WIDTH / 2) + "' "
//                  + "y1='"     + (parseInt(nodeHeld.css("top")) + CIRCLE_WIDTH / 2) + "' "
//                  + "x2='"     + (parseInt(node.css("left")) + CIRCLE_WIDTH / 2) + "' "
//                  + "y2='"     + (parseInt(node.css("top")) + CIRCLE_WIDTH / 2) + "'"
//                  + " />";
//        $("svg").append(line);
        //$("svg").html($("svg").html());
           
        var edge = {a: nodeHeld, b: (node), nodeline:line};
        edges.push(edge);
        
        //reset tempLine
        $("#tempLine").css("top", 0)
        $("#tempLine").css("left", 0);
        $("#tempLine").css("width", 0);
        nodeHeld = null; 
    }
    
    function resetSvg() {
//        $("svg").html($("svg").html());
    }
    
//    function drawLine()
});	