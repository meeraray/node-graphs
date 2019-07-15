//width of node and height of line (update this manually from css)
var CIRCLE_WIDTH = 30;
var LINE_HEIGHT = 2;

var nodes = [];
var seen = [];
var edges = [];

//explanatory messages shown when control button clicked
var messages = [
    "Click to place node.",
    "Click on node to delete.",
    "Click on node, then another node to connect them.",
    "Click on line to delete.",
    "Click and drag node to move it."
];

//keeps track of which control selected
var selected = -1;
const NEW_NODE = 0; 
const DELETE_NODE = 1;
const NEW_LINE = 2;
const DELETE_LINE = 3;
const MOVE_NODE = 4;

//first node clicked when adding line
var nodeHeld = null;

var stage_width;

$(function() {
    
    stage_width = $("#stage").width();
    
    /* updates width of stage and position of nodes when window resized
    scales node's position by % of container, but keeps it in boundaries */
    function resizedw(){
    // Haven't resized in 100ms!
}

var doit;
window.onresize = function(){
  clearTimeout(doit);
  doit = setTimeout(resizedw, 100);
};
    
    var timer;
    $(window).resize(function() {
        clearTimeout(timer);
        timer = setTimeout(endresize, 100);
    });
    
    $(".control").click(function() {
        var index = $(".control").index($(this));

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
        if(selected == NEW_NODE) {
            handleAddNode(e.pageX - pos.left, e.pageY - pos.top);
        }
        else if (selected == DELETE_NODE) {
            
        }
    });
    
    $("#stage").mouseenter(function() {
        if(selected == NEW_LINE && nodeHeld != null) {
            $("#tempLine").show();
        }
    });
    
    $("#stage").mouseleave(function() {
//        console.log("left!");
        if(selected == NEW_LINE) {
            $("#tempLine").hide();
        }
    });
    
    //update position of line when mouse moves
    $("#stage").mousemove(function(e) {
        if(selected == NEW_LINE && nodeHeld != null) {
            var pos = getXandY(e);
//            console.log(pos.x + " " + pos.y);
//            console.log("active");
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
        if(selected == DELETE_NODE) {
            console.log("delete node clicked");
            handleDeleteNode($(this));
        }
        if(selected == NEW_LINE) {
            handleAddLine($(this));
        }
    });
    
    /*x and y position of mouse relative to #stage
    only call if mouse over #stage */
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
            //console.log("slope: " + ((y2 - y1) / (x2 - x1)))
            angle *= -1;
        }
//        console.log(angle);
        line.css("transform", "rotate(" + Math.round(angle) + "deg)");
        return line;
    }
    
    function updateLinesFromNodes() {
        for(ind = 0; ind < edges.length; ind++) {
            var edge = edges[ind];
            var a = edge.a;
            var b = edge.b;
            var line = createLine(parseInt(a.css("left")) + CIRCLE_WIDTH / 2, 
                              parseInt(a.css("top")) + CIRCLE_WIDTH / 2,
                              parseInt(b.css("left")) + CIRCLE_WIDTH / 2,
                              parseInt(b.css("top")) + CIRCLE_WIDTH / 2);
            edge.nodeline.remove();
            edge.nodeline = line;
            $("#stage").append(line);
        }
    }
    
    function endresize() {
        console.log("resize over"); 
        var prev = stage_width;
        stage_width = $("#stage").width();
        $(".node").each(function() {
            var left = Math.round(parseInt($(this).css("left")) / prev * stage_width);
            var max = Math.round(stage_width - CIRCLE_WIDTH);
            $(this).css("left", Math.min(left, max));
        });
        updateLinesFromNodes();
    }
    
    function handleAddNode(xCoord, yCoord) {
        //place node inside stage boundaries
        xCoord = Math.max(CIRCLE_WIDTH / 2, xCoord);
        xCoord = Math.min(xCoord, $("#stage").width() - CIRCLE_WIDTH / 2);
        yCoord = Math.max(yCoord, CIRCLE_WIDTH / 2);
        yCoord = Math.min(yCoord, $("#stage").height() - CIRCLE_WIDTH / 2);
        
        //create node DOM element and associated node object in list
        var circle = $("<div></div>").addClass("node");
        var node = {elem:circle};
        nodes.push(node);
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
        var index = $(".node").index(node);
        console.log(index);
        nodes.splice(index, 1);
        node.remove()
    }
    
    function handleAddLine(node) {
        
        if(nodeHeld == null) {
            nodeHeld = node;
            $("#tempLine").show();
            return;
        }
        var line = createLine(parseInt(nodeHeld.css("left")) + CIRCLE_WIDTH / 2, 
                              parseInt(nodeHeld.css("top")) + CIRCLE_WIDTH / 2,
                              parseInt(node.css("left")) + CIRCLE_WIDTH / 2,
                              parseInt(node.css("top")) + CIRCLE_WIDTH / 2);
        $("#stage").append(line);
        var edge = {a: nodeHeld, b: (node), nodeline:line};
        edges.push(edge);
        
        //reset tempLine
        $("#tempLine").css("top", 0)
        $("#tempLine").css("left", 0);
        $("#tempLine").css("width", 0);
        nodeHeld = null; 
    }
    
});	