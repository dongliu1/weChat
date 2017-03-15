/*
  point:[x,y] 判断点
  polygon:多边形，[[1,2],[1,3],[2,5]] 或[{"x":1,"y":2},{"x":1,"y":3},{"x":2,"y":5}]
  index:polygon的x和y键 [0,1] 或者 ["x","y"]
*/

var isInside = function (point, polygon , index) {
    if(!index) index=[0,1];
    var idx_x=index[0],idx_y=index[1];
	
    var x = point[0], y = point[1];
	
    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var xi = polygon[i][idx_x], yi = polygon[i][idx_y];
        var xj = polygon[j][idx_x], yj = polygon[j][idx_y];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};
/*
使用实例
var inside = require('point-in-polygon');
var polygon = [ [ 1, 1 ], [ 1, 2 ], [ 2, 2 ], [ 2, 1 ] ];

console.dir([
    inside([ 1.5, 1.5 ], polygon),
    inside([ 4.9, 1.2 ], polygon),
    inside([ 1.8, 1.1 ], polygon)
]);

*/