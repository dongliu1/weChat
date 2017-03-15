/* Code extracted from https://github.com/Tom-Alexander/regression-js/
 
 Modifications of January 5, 2015

	- Add dashStyle ('' by default)
	
*/


(function (H) {
    

    H.wrap(H.Chart.prototype, 'init', function (proceed) {
        var series = arguments[1].series ;
        var extraSeries = [];
        var i = 0 ;
        for (i = 0 ; i < series.length ; i++){
            var s = series[i];
			s["isRegressionLine"]=false;////////////////
            if ( s.regression && !s.rendered ) {
                s.regressionSettings =  s.regressionSettings || {} ;
                s.regressionSettings.tooltip = s.regressionSettings.tooltip || {} ;
                s.regressionSettings.dashStyle = s.regressionSettings.dashStyle || 'solid';
                s.regressionSettings.decimalPlaces = s.regressionSettings.decimalPlaces || 2;

                var regressionType = s.regressionSettings.type || "linear" ;
                var regression; 
				var extraSerie = jQuery.extend(true, {}, s);
				extraSerie["data"]=[];
				extraSerie["lineWidth"]=0.5;
				extraSerie["marker"]={enabled: false};
				extraSerie["enableMouseTracking"]=false;
				extraSerie["isRegressionLine"]=true;
				extraSerie["type"]=s.regressionSettings.linetype || 'spline';
				extraSerie["name"]=s.regressionSettings.name || (s.name+'拟合'+"[%eq]");
				extraSerie["color"]=s.regressionSettings.color || '';
				extraSerie["dashStyle"]=s.regressionSettings.dashStyle || 'solid';
				extraSerie["tooltip"]={enabled:false};
				extraSerie["more"]=s.regressionSettings.more;
				extraSerie["plotOptions"]={ series: {turboThreshold:0,marker: {enabled: false},animation:false,lineWidth: 1} };
				
                var sdata=_sortArray(s.data);		//将s.data排序, rox 
                if (regressionType == "linear") {
                    regression = _linear(sdata,s.regressionSettings.decimalPlaces) ;
                    extraSerie.type = "line";
                }else if (regressionType == "exponential") {
                    regression = _exponential(sdata) 
                }                                
                else if (regressionType == "polynomial"){  
	                var order = s.regressionSettings.order || 2
                    regression = _polynomial(sdata, order) ;                    
                }else if (regressionType == "logarithmic"){
                    regression = _logarithmic(sdata) ;
                }else if (regressionType == "leastsquares"){
                    regression = _leastsquares(sdata) ;
                }else if (regressionType == "loess"){
                    var loessSmooth = s.regressionSettings.loessSmooth || 25
                    regression = _loess(sdata, loessSmooth/100) ;
                }else {
                    console.error("Invalid regression type: " , regressionType) ;
                    break;
                }
                //regression.points=$.unique(regression.points);
                regression.rSquared =  coefficientOfDetermination(sdata, regression.points);
                regression.rValue = Math.sqrt(regression.rSquared).toFixed(s.regressionSettings.decimalPlaces);
                regression.rSquared = regression.rSquared.toFixed(s.regressionSettings.decimalPlaces);
                regression.standardError = standardError(sdata, regression.points).toFixed(s.regressionSettings.decimalPlaces);
                extraSerie.data = _unique(regression.points) ;
				extraSerie.string=regression.string ;
				extraSerie.equation = regression.equation;
				extraSerie.correlation = regression["correlation"];
                extraSerie.name = extraSerie.name.replace("%r2",regression.rSquared);
                extraSerie.name = extraSerie.name.replace("%r",regression.rValue);
                extraSerie.name = extraSerie.name.replace((regression.string)?"%eq":"[%eq]",regression.string);
                extraSerie.name = extraSerie.name.replace("%se", regression.standardError);
                
                extraSerie.regressionOutputs = regression ;
                extraSeries.push(extraSerie) ;
                arguments[1].series[i].rendered = true;                           
            }
        }


        arguments[1].series = series.concat(extraSeries);
		//console.log(series);
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

        
    });
    
	/*function _sortArray(data){
		if(data[0].x === undefined){
			return data.sort(function(a,b){return a[0]-b[0]});
		}else{
			return data.sort(function(a,b){return a.x-b.x});
		}
	}*/
	function _unique(data){	//数组去重
		var data=data.sort(function(a,b){return a[0]-b[0]});
		var x=null,y=null;
		var ret=[];
		$.each(data,function(i,d){
			if(!isNaN(d[0]) && !isNaN(d[1])  && d[0]!=x && d[1]!=y){
				x=d[0];y=d[1];
				ret.push([d[0],d[1]]);
			}
		})
		return ret;
	}
	
	function _sortArray(data){	//预处理数组
		for (n=0; n < data.length; n++) {
          if (data[n]['x']) {
            data[n][0] = data[n]['x'];
            data[n][1] = data[n]['y'];
          }
		}
		return data.sort(function(a,b){return a[0]-b[0]});
	}
		  
    /**
     * Code extracted from https://github.com/Tom-Alexander/regression-js/
     */
    function _exponential(data) {
        var sum = [0, 0, 0, 0, 0, 0], n = 0, results = [],correlation_data=[];

        for (len = data.length; n < len; n++) {
          if (data[n]['x']) {
            data[n][0] = data[n]['x'];
            data[n][1] = data[n]['y'];
          }
          if (data[n][1]) {
            sum[0] += data[n][0]; // X
            sum[1] += data[n][1]; // Y
            sum[2] += data[n][0] * data[n][0] * data[n][1]; // XXY
            sum[3] += data[n][1] * Math.log(data[n][1]); // Y Log Y 
            sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]); //YY Log Y
            sum[5] += data[n][0] * data[n][1]; //XY
          }
        }

        var denominator = (sum[1] * sum[2] - sum[5] * sum[5]);
        var A = Math.pow(Math.E, (sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
        var B = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;

        for (var i = 0, len = data.length; i < len; i++) {
            //var coordinate = [data[i][0], A * Math.pow(Math.E, B * data[i][0])];
            //results.push(coordinate);
			var answer=A * Math.pow(Math.E, B * data[i][0]);
            results.push([data[i][0],answer]);
			correlation_data.push([data[i][1],answer]);
        }
		var correlation=_correlation(correlation_data);
		
        results.sort(function(a,b){
           if(a[0] > b[0]){ return 1}
            if(a[0] < b[0]){ return -1}
              return 0;
        });

        var string = 'y = (' + Math.round(A*100) / 100 + ')e<sup>' + Math.round(B*10000) / 10000 + 'x</sup>';

        return {equation: [A, B], correlation:correlation, points: results, string: string};
    } 
    
    
    /**
     * Code extracted from https://github.com/Tom-Alexander/regression-js/
     * Human readable formulas: 
     * 
     *              N * Σ(XY) - Σ(X) 
     * intercept = ---------------------
     *              N * Σ(X^2) - Σ(X)^2
     * 
     * correlation = N * Σ(XY) - Σ(X) * Σ (Y) / √ (  N * Σ(X^2) - Σ(X) ) * ( N * Σ(Y^2) - Σ(Y)^2 ) ) )
     * 
     */
    function _linear(data, decimalPlaces) {
        var sum = [0, 0, 0, 0, 0], n = 0, results = [], N = data.length;
        for (; n < data.length; n++) {
          /*if (data[n]['x']) {
            data[n][0] = data[n]['x'];
            data[n][1] = data[n]['y'];
          }*/
          if (!isNaN(data[n][1])) {
            sum[0] += data[n][0]; //Σ(X) 
            sum[1] += data[n][1]; //Σ(Y)
            sum[2] += data[n][0] * data[n][0]; //Σ(X^2)
            sum[3] += data[n][0] * data[n][1]; //Σ(XY)
            sum[4] += data[n][1] * data[n][1]; //Σ(Y^2)
          } else {
            N -= 1;
          }
        }

        var gradient = (N * sum[3] - sum[0] * sum[1]) / (N * sum[2] - sum[0] * sum[0]);
        var intercept = (sum[1] / N) - (gradient * sum[0]) / N;
		var correlation = (N * sum[3] - sum[0] * sum[1]) / Math.sqrt((N * sum[2] - sum[0] * sum[0]) * (N * sum[4] - sum[1] * sum[1]));

        for (var i = 0, len = data.length; i < len; i++) {
			var coorY = data[i][0] * gradient + intercept;
			if (decimalPlaces)
				coorY = parseFloat(coorY.toFixed(decimalPlaces));
			var coordinate = [data[i][0], coorY];
			results.push(coordinate);

        }
        results.sort(function(a,b){
           if(a[0] > b[0]){ return 1}
            if(a[0] < b[0]){ return -1}
              return 0;
        });
		
        var string = 'y = (' + Math.round(gradient*100) / 100 + ')x + (' + (Math.round(intercept*100) / 100)+')';
        return {equation: [gradient, intercept],correlation:correlation, points: results, string: string};
    }
    
	
	/** author:rox  function:calculate correlation **/
	function _correlation(data){		
		var sum = [0, 0, 0, 0, 0], n = 0, N = data.length;

        for (; n < data.length; n++) {
          if (data[n]['x']) {
            data[n][0] = data[n]['x'];
            data[n][1] = data[n]['y'];
          }
          if (data[n][1]) {
            sum[0] += data[n][0]; //Σ(X) 
            sum[1] += data[n][1]; //Σ(Y)
            sum[2] += data[n][0] * data[n][0]; //Σ(X^2)
            sum[3] += data[n][0] * data[n][1]; //Σ(XY)
            sum[4] += data[n][1] * data[n][1]; //Σ(Y^2)
          } else {
            N -= 1;
          }
        }
		var correlation = (N * sum[3] - sum[0] * sum[1]) / Math.sqrt((N * sum[2] - sum[0] * sum[0]) * (N * sum[4] - sum[1] * sum[1]));
		
		return correlation;
	}
	
	
    /**
     *  Code extracted from https://github.com/Tom-Alexander/regression-js/
     */
    function _logarithmic(data) {
        var sum = [0, 0, 0, 0], n = 0, results = [],correlation_data=[],mean = 0 ;
        

        for (len = data.length; n < len; n++) {
          if (data[n]['x']) {
            data[n][0] = data[n]['x'];
            data[n][1] = data[n]['y'];
          }
          if (data[n][1]) {
            sum[0] += Math.log(data[n][0]);
            sum[1] += data[n][1] * Math.log(data[n][0]);
            sum[2] += data[n][1];
            sum[3] += Math.pow(Math.log(data[n][0]), 2);
          }
        }
        
        var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
        var A = (sum[2] - B * sum[0]) / n;

        for (var i = 0, len = data.length; i < len; i++) {
			var answer=A + B * Math.log(data[i][0]);
            //var coordinate = [data[i][0], A + B * Math.log(data[i][0])];
            results.push([data[i][0],answer]);
			correlation_data.push([data[i][1],answer]);
        }
		
		var correlation=_correlation(correlation_data);
        results.sort(function(a,b){
           if(a[0] > b[0]){ return 1}
            if(a[0] < b[0]){ return -1}
              return 0;
        });

        var string = 'y = (' + Math.round(A*100) / 100 + ') + (' + Math.round(B*100) / 100 + ') ln(x)';
        
        return {equation: [A, B], correlation:correlation, points: results, string: string};
    }
    
    /**
     * Code extracted from https://github.com/Tom-Alexander/regression-js/
     */
    function _power(data) {
        var sum = [0, 0, 0, 0], n = 0, results = [],correlation_data=[];

        for (len = data.length; n < len; n++) {
          if (data[n]['x']) {
            data[n][0] = data[n]['x'];
            data[n][1] = data[n]['y'];
          }
          if (data[n][1]) {
            sum[0] += Math.log(data[n][0]);
            sum[1] += Math.log(data[n][1]) * Math.log(data[n][0]);
            sum[2] += Math.log(data[n][1]);
            sum[3] += Math.pow(Math.log(data[n][0]), 2);
          }
        }

        var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
        var A = Math.pow(Math.E, (sum[2] - B * sum[0]) / n);

        for (var i = 0, len = data.length; i < len; i++) {
			var answer=A * Math.pow(data[i][0] , B);
            //var coordinate = [data[i][0], A * Math.pow(data[i][0] , B)];
            results.push([data[i][0], answer]);
			correlation_data.push([data[i][1],answer]);
        }

		var correlation=_correlation(correlation_data);
        results.sort(function(a,b){
           if(a[0] > b[0]){ return 1}
            if(a[0] < b[0]){ return -1}
              return 0;
        });

        var string = 'y = (' + Math.round(A*100) / 100 + ')x<SUP>' + Math.round(B*100) / 100+'</SUP>';

        return {equation: [A, B], correlation:correlation, points: results, string: string};
    }
    
    /**
     * Code extracted from https://github.com/Tom-Alexander/regression-js/
     */
    function _polynomial(data, order) {
        if(typeof order == 'undefined'){
            order =2;
        }
        var lhs = [], rhs = [], results = [],correlation_data=[], a = 0, b = 0, i = 0, k = parseInt(order) + 1;

        for (; i < k; i++) {
            for (var l = 0, len = data.length; l < len; l++) {
                if (data[l]['x']) {
                    data[l][0] = data[l]['x'];
                    data[l][1] = data[l]['y'];
                }
                if (data[l][1]) {
                    a += Math.pow(data[l][0], i) * data[l][1];
                }
            }
            lhs.push(a), a = 0;
            var c = [];
            for (var j = 0; j < k; j++) {
                for (var l = 0, len = data.length; l < len; l++) {
                    if (data[l][1]) {
                        b += Math.pow(data[l][0], i + j);
                    }
                }
                c.push(b), b = 0;
            }
            rhs.push(c);
        }
        rhs.push(lhs);

        var equation = gaussianElimination(rhs, k);
        for (var i = 0, len = data.length; i < len; i++) {
            var answer = 0;
            for (var w = 0; w < equation.length; w++) {
                answer += equation[w] * Math.pow(data[i][0], w);
            }
            results.push([data[i][0], answer]);
			correlation_data.push([data[i][1],answer]);
        }
		var correlation=_correlation(correlation_data);
        results.sort(function(a,b){
           if(a[0] > b[0]){ return 1}
            if(a[0] < b[0]){ return -1}
              return 0;
        });

        var string = 'y = ';

        for(var i = equation.length-1; i >= 0; i--){
			//if(string!='y = ')string+=(equation[i]>0)?'+':'';
			if(string!='y = ')string+='+';
            if(i > 1) {
				var digits=Math.pow(100,i+1);
				string += '('+Math.round(equation[i]*digits)/100 + ')10<SUP>-'+(i*2)+'</SUP>x<SUP>' + i + '</SUP> ';
			}
            else if (i == 1) string += '('+Math.round(equation[i]*100) / 100 + ')x' ;
            else string += '('+Math.round(equation[i]*100) / 100+')';
        }

        return {equation: equation,correlation:correlation, points: results, string: string};
    }
    
    /**
     * @author: Ignacio Vazquez
     * Based on 
     * - http://commons.apache.org/proper/commons-math/download_math.cgi LoesInterpolator.java
     * - https://gist.github.com/avibryant/1151823
     */
    function _loess (data, bandwidth) {
        var bandwidth = bandwidth || 0.25 ;
		
        //var xval = data.map(function(pair){return pair[0]});
		var xval = (data[0].x === undefined)?data.map(function(pair){return pair[0]}):data.map(function(pair){return pair.x});	//rox
        var distinctX =  array_unique(xval) ;
        if (  2 / distinctX.length  > bandwidth ) {
            bandwidth = Math.min( 2 / distinctX.length, 1 );
            console.warn("updated bandwith to "+ bandwidth);
        }
        
        //var yval = data.map(function(pair){return pair[1]});
		var yval = (data[0].y === undefined)?data.map(function(pair){return pair[1]}):data.map(function(pair){return pair.y});	//rox
        
        function array_unique(values) {
            var o = {}, i, l = values.length, r = [];
            for(i=0; i<l;i+=1) o[values[i]] = values[i];
            for(i in o) r.push(o[i]);
            return r;
        }
        
        function tricube(x) {
            var tmp = 1 - x * x * x;
            return tmp * tmp * tmp;
        }

        var res = [],correlation_data=[];

        var left = 0;
        var right = Math.floor(bandwidth * xval.length) - 1;

        for(var i in xval)
        {
            var x = xval[i];
    
            if (i > 0) {
                if (right < xval.length - 1 &&
                        xval[right+1] - xval[i] < xval[i] - xval[left]) {
                    left++;
                    right++;
                }
            }
            //console.debug("left: "+left  + " right: " + right );
            var edge;
            if (xval[i] - xval[left] > xval[right] - xval[i])
                edge = left;
            else
                edge = right;
            var denom = Math.abs(1.0 / (xval[edge] - x));
            var sumWeights = 0;
            var sumX = 0, sumXSquared = 0, sumY = 0, sumXY = 0;

            var k = left;
            while(k <= right)
            {
                var xk = xval[k];
                var yk = yval[k];
                var dist;
                if (k < i) {
                    dist = (x - xk);
                } else {
                    dist = (xk - x);
                }
                var w = tricube(dist * denom);
                var xkw = xk * w;
                sumWeights += w;
                sumX += xkw;
                sumXSquared += xk * xkw;
                sumY += yk * w;
                sumXY += yk * xkw;
                k++;
            }

            var meanX = sumX / sumWeights;
            //console.debug(meanX);
            var meanY = sumY / sumWeights;
            var meanXY = sumXY / sumWeights;
            var meanXSquared = sumXSquared / sumWeights;

            var beta;
            if (meanXSquared == meanX * meanX)
                beta = 0;
            else
                beta = (meanXY - meanX * meanY) / (meanXSquared - meanX * meanX);

            var alpha = meanY - beta * meanX;
            res[i] = beta * x + alpha;
			correlation_data.push([yval[i],res[i]]);
        }
        //console.debug(res);
		var correlation=_correlation(correlation_data);
		var results=xval.map(function(x,i){return [x, res[i]]});
		results.sort(function(a,b){
           if(a[0] > b[0]){ return 1}
            if(a[0] < b[0]){ return -1}
              return 0;
        });
        return { 
            equation: " loess " , 
			correlation:correlation,
            points: results,//xval.map(function(x,i){return [x, res[i]]}), 
            string:""
        } ;
    }
    
    /**
     * @author: Bernard Rao
     * Based on 
     * - http://commons.apache.org/proper/commons-math/download_math.cgi LoesInterpolator.java
     * - https://gist.github.com/avibryant/1151823
     */    
	function _leastsquares(data) {
		var values_x = (data[0].x === undefined)?data.map(function(pair){return pair[0]}):data.map(function(pair){return pair.x});	
        var values_y = (data[0].y === undefined)?data.map(function(pair){return pair[1]}):data.map(function(pair){return pair.y});
		var sum_x = 0;
		var sum_y = 0;
		var sum_xy = 0;
		var sum_xx = 0;
		var count = 0;

		/*
		 * We'll use those variables for faster read/write access.
		 */
		var x = 0;
		var y = 0;
		var values_length = values_x.length;

		if (values_length != values_y.length) {
			throw new Error('The parameters values_x and values_y need to have same size!');
		}

		/*
		 * Nothing to do.
		 */
		if (values_length === 0) {
			return [ [], [] ];
		}

		/*
		 * Calculate the sum for each of the parts necessary.
		 */
		for (var v = 0; v < values_length; v++) {
			x = values_x[v];
			y = values_y[v];
			sum_x += x;
			sum_y += y;
			sum_xx += x*x;
			sum_xy += x*y;
			count++;
		}

		/*
		 * Calculate m and b for the formular:
		 * y = x * m + b
		 */
		var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
		var b = (sum_y/count) - (m*sum_x)/count;

		/*
		 * We will make the x and y result line now
		 */
		//var result_values_x = [];
		//var result_values_y = [];
		var points = [],correlation_data=[];

		for (var v = 0; v < values_length; v++) {
			x = values_x[v];
			y = x * m + b;
			//result_values_x.push(x);
			//result_values_y.push(y);
			points.push([x,y]);
			correlation_data.push([values_y[v],y]);
        }
		var correlation=_correlation(correlation_data);

		//return [result_values_x, result_values_y];
		//console.debug(res);
        return { 
            equation: " LeastSquares " , 
			correlation:correlation,
            points: points, 
            string:""
        } ;
	}
	
    /**
     * Code extracted from https://github.com/Tom-Alexander/regression-js/
     */
    function  gaussianElimination(a, o) {
        var i = 0, j = 0, k = 0, maxrow = 0, tmp = 0, n = a.length - 1, x = new Array(o);
        for (i = 0; i < n; i++) {
           maxrow = i;
           for (j = i + 1; j < n; j++) {
              if (Math.abs(a[i][j]) > Math.abs(a[i][maxrow]))
                 maxrow = j;
           }
           for (k = i; k < n + 1; k++) {
              tmp = a[k][i];
              a[k][i] = a[k][maxrow];
              a[k][maxrow] = tmp;
           }
           for (j = i + 1; j < n; j++) {
              for (k = n; k >= i; k--) {
                 a[k][j] -= a[k][i] * a[i][j] / a[i][i];
              }
           }
        }
        for (j = n - 1; j >= 0; j--) {
           tmp = 0;
           for (k = j + 1; k < n; k++)
              tmp += a[k][j] * x[k];
           x[j] = (a[n][j] - tmp) / a[j][j];
        }
        return (x);
     }
    
    /**
     * @author Ignacio Vazquez 
     * See http://en.wikipedia.org/wiki/Coefficient_of_determination for theaorical details 
     */
    function coefficientOfDetermination (data, pred ) {
        
        var i = SSE = SSYY =  mean = 0, N = data.length;
		  
        // Calc the mean
        for (i = 0 ; i < data.length ; i++ ){
            if (data[i][1]) {
                mean += data[i][1];
            } else if(data[i]['y']){
				mean += data[i]['y'];
			} else {
                N--;
            }
        }
        mean /= N;
        
        // Calc the coefficent of determination 
        for (i = 0 ; i < data.length ; i++ ){
            if (data[i][1]) {
                SSYY +=  Math.pow( data[i][1] -  pred[i][1] , 2) ;
                SSE +=  Math.pow( data[i][1] -  mean , 2) ;
            }else if(data[i]['y']){
				SSYY +=  Math.pow( data[i]['y'] -  pred[i][1] , 2) ;
                SSE +=  Math.pow( data[i]['y'] -  mean , 2) ;
			}
        }
        return  1 - ( SSYY / SSE)  ;
    }

    function standardError(data, pred) {
        var SE = 0, N = data.length;

        for (i = 0 ; i < data.length ; i++ ) {
            if (data[i][1]) {
                SE += Math.pow(data[i][1] - pred[i][1], 2);
            } else if (data[i]['y']) {
                SE += Math.pow(data[i]['y'] - pred[i][1], 2);
            } else {
                N--;
            }
        }
        SE = Math.sqrt(SE / (N-2));

        return SE;
    }


   
}(Highcharts));
