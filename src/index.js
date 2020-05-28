const dscc = require('@google/dscc');
const d3 = Object.assign({}, require('d3'));
const local = require('./localMessage.js');
import * as ut from './utils.js';

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = false;

// This click function handles the chart interaction functionality AKA filtering.
// When a category (axis) is clicked, then this provides datastudio with the details
// and applies styling to the chart - note, the data for the chart remains untouched.
function click(d, message) {
	//console.log(d);
	const FILTER = dscc.InteractionType.FILTER;
  const actionId = 'onClick';
  const dimIds = message.fields.dimensions.map(d => d.id);
  let selected = new Set();
  var revD = [d];
  /* FOR CIRCLE HIGHLIGHT COMMENT THE ABOVE LINE AND UNCOMMENT THE BELOW LINE */
  //var revD = [d.axis];

  if (message.interactions.onClick.value.data !== undefined) {
    const selVals = message.interactions.onClick.value.data.values.map(d => JSON.stringify(d));
    selected = new Set(selVals);
    //console.log(selected);
    const clickData = JSON.stringify(revD);
    if (selected.has(clickData)) {
      selected.delete(clickData);
    } else {
      selected.add(clickData);
    }
    //console.log(selected);
  } else {
    const filterData = {
      concepts: dimIds,
      values: [revD],
    };
    if(LOCAL){
	    message.interactions.onClick.value.data = filterData
		  drawViz(message);
	  }
    dscc.sendInteraction(actionId, FILTER, filterData);
    return;
  }

  if (selected.size > 0) {
    const filterData = {
      concepts: dimIds,
      values: Array.from(selected).map(d => JSON.parse(d)),
    };
    if(LOCAL){
	    message.interactions.onClick.value.data = filterData
		  drawViz(message);
	  }
    dscc.sendInteraction(actionId, FILTER, filterData);
  } else {
	  if(LOCAL){
		  message.interactions.onClick.value.data = undefined;
		  drawViz(message);
	  }
    dscc.clearInteraction(actionId, FILTER);
  }
}

// Get the groups from the second dimension which will create multiple
// shapes if more than one group.
const parseGroups = data => {
  var groups = [];
  var groupTotals = [];
  var groupData = [];
  data.forEach(function(record) {
	  var group = record.dimensions[1];
	  if (groups.indexOf(group) < 0) {
		  groups.push(group);
		  groupData.push({
			  group: group,
			  values: [],
			  maxVal: 0,
		  });
	  }
	  groupData.forEach(function(d){
		  if (d.group === record.dimensions[1]){
			  d.values.push(record.metrics[0]);
		  }
	  });
  });
  groupData.forEach(function(d){
	  var maxVal = d.values.reduce(function(a, b) { return Math.max(a, b); });
	  d.maxVal += maxVal;
  })
  return groupData;
}

// The data needs to be reformated to work with d3.
const parseData = data => {
  
  var pdata = [];
  if (data[0].dimensions[1] !== undefined) {
	  var groups = []; // track unique groups
	  data.forEach(function(record) {
	    var group = record.dimensions[1];
	    if (groups.indexOf(group) < 0) {
	      groups.push(group); // push to unique groups tracking
	      pdata.push({ // push group node in data
	        group: group,
	        axes: []
	      });
	    };
	    pdata.forEach(function(d) {
	      if (d.group === record.dimensions[1]) { // push record data into right group in data
	        d.axes.push({
		      group: record.dimensions[1],
	          axis: record.dimensions[0],
	          value: record.metrics[0],
	        });
	      }
	    });
	  });
  }else{
	  var groups = []; // track unique groups
	  data.forEach(function(record) {
	    var group = "DEFAULT";
	    if (groups.indexOf(group) < 0) {
	      groups.push(group); // push to unique groups tracking
	      pdata.push({ // push group node in data
	        group: group,
	        axes: []
	      });
	    };
        pdata[0].axes.push({
	      group: group,
          axis: record.dimensions[0],
          value: record.metrics[0],
        });
	  });
  }
  var rdata = pdata.map(function(d){
	  return d.axes;
  });

  return rdata;
};

// The styleVal function pulls the user selected styles which are then
// used throughout the build of the chart script.
const styleVal = (message, styleId) => {
  // to account for color styling
  if (typeof message.style[styleId].defaultValue === 'object') {
    return message.style[styleId].value.color !== undefined
      ? message.style[styleId].value.color
      : message.style[styleId].defaultValue.color;
  }
  return message.style[styleId].value !== undefined
    ? message.style[styleId].value
    : message.style[styleId].defaultValue;
};

// This is the main function that builds the chart and functionality.
const draw = message => {
	// Reformatting the data.
  const d = parseData(message.tables.DEFAULT);
  // Get the groups of the second dimension and declare
  // as LegendOptions.
  var LegendOptions = [];
  if (message.tables.DEFAULT[0].dimensions[1] !== undefined) {
	  LegendOptions = parseGroups(message.tables.DEFAULT);
  }else{
	  var revGroup = message.fields.dimensions[0].name;
	  var dVals = [];
	  d[0].forEach(function(y){
		  y.group = revGroup;
		  dVals.push(y.value);
	  });
	  var maxdVals = dVals.reduce(function(a,b){return Math.max(a,b);});
	  LegendOptions.push({
		  group: revGroup,
		  values: dVals,
		  maxVal: maxdVals
	  });
  }
  // Find the maximum value for all metric values and round up to the next integer.
  // Example: if the max value is 5.5, then maxVal is 6.
  var maxVal = Math.round(LegendOptions.map(function(d){return d.maxVal}).reduce(function(a, b) {
	    return Math.max(a, b);
	}) * 10 + 1);
	
	// The number of levels should match maxVal.
	var levels = maxVal;
	
	// Adjust the level is the maxVal is greater than 10, which is 100%.
	// This ensures the chart will render properly at all times.
	if (maxVal > 10){
		if(maxVal > 50){
			maxVal = Math.ceil(maxVal/10)*10;
			levels = maxVal / 10;
		}else{
			maxVal = Math.ceil(maxVal/10)*10;
			levels = maxVal / 5;
		}
	}
  
  var id = 'body';
  var dataValues = [];
  var series = 0;

  // remove the canvas if it exists
  d3.select('body')
    .selectAll('svg')
    .remove();
  // remove the error handler if exists
  d3.select('body')
    .selectAll('div')
    .remove();

  // set margins
  // get the width and the height of the iframe
  var width = dscc.getWidth();
  var height = dscc.getHeight();
  
  var w = height - 150;
  var h = height - 150;
  
  // Declare configuration settings.
  var cfg = {
	 radius: 5,
	 w: w,
	 h: h,
	 factor: 1,
	 factorLegend: .85,
	 levels: levels,
	 maxValue: maxVal/10,
	 radians: 2 * Math.PI,
	 opacityArea: 0.5,
	 ToRight: 5,
	 TranslateX: 80,
	 TranslateY: 30,
	 ExtraWidthX: 300,
	 ExtraWidthY: 100,
	 fontFamily: message.theme.themeFontFamily,
	 fontSize: styleVal(message, 'font_size'),
	 levelColor: styleVal(message, 'level_color'),
	 labelColor: styleVal(message, 'label_color'),
	 lineColor: styleVal(message, 'line_color'),
	 themeColor: message.theme.themeSeriesColor,
	 filterColor: styleVal(message, 'filter_color'),
	};
	
	// Additional variables used further down.
	cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));
	var allAxis = (d[0].map(function(i, j){return i.axis}));
	var total = allAxis.length;
	var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
	var Format = d3.format(",.1%");
	d3.select(id).select("svg").remove();
	
	var g = d3.select(id)
			.append("svg")
			.attr("width", cfg.w+cfg.ExtraWidthX)
			.attr("height", cfg.h+cfg.ExtraWidthY)
			.style('padding', '50px')
			.append("g")
			.attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
			;
	// create tooltip
	var tooltip = d3
		.select(id)
		.append('div')
		.style('z-index', '10')
		.style('border', '1px solid')
		.style('border-color', '#bdbdbd')
		.style('background-color', '#ffffff')
		.style('box-shadow', '1px 1px 1px #e3e3e3')
		.style('visibility', 'hidden')
		.style('height', '40px')
		.style('opacity', 1)
		.style('position', 'absolute');
	
	tooltip.append('span').attr('id', 'title').style('display', 'block').style('padding-bottom', '5px');
	tooltip.append('span').attr('id', 'metric').style('display', 'block');
	
	//Circular segments
	for(var j=0; j<cfg.levels; j++){
	  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
	  g.selectAll(".levels")
	   .data(allAxis)
	   .enter()
	   .append("svg:line")
	   .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
	   .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
	   .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
	   .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
	   .attr("class", "line")
	   .style("stroke", cfg.levelColor)
	   .style("stroke-opacity", "0.75")
	   .style("stroke-width", "0.3px")
	   .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
	}

	//Text indicating at what % each level is
	for(var j=0; j<cfg.levels; j++){
	  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
	  g.selectAll(".levels")
	   .data([1]) //dummy data
	   .enter()
	   .append("svg:text")
	   .attr("x", function(d){return levelFactor*(1-cfg.factor*Math.sin(0));})
	   .attr("y", function(d){return levelFactor*(1-cfg.factor*Math.cos(0));})
	   .attr("class", "legend")
	   .style("font-family", cfg.fontFamily)
	   .style("font-size", cfg.fontSize)
	   .attr("transform", "translate(" + (cfg.w/2-levelFactor + cfg.ToRight) + ", " + (cfg.h/2-levelFactor) + ")")
	   .attr("fill", cfg.labelColor)
	   .text(Format((j+1)*cfg.maxValue/cfg.levels));
	}
	
	series = 0;

	// Create the various axis.
	var axis = g.selectAll(".axis")
			.data(allAxis)
			.enter()
			.append("g")
			.attr("class", "axis");

	axis.append("line")
		.attr("x1", cfg.w/2)
		.attr("y1", cfg.h/2)
		.attr("x2", function(d, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
		.attr("y2", function(d, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
		.attr("class", "line")
		.attr("id", function(d){return "axis-line-" + d.replace(/[^A-Z0-9]/ig, "_");})
		.style("stroke", cfg.lineColor)
		.style("stroke-width", "1px");

	axis.append("text")
		.attr("class", "legend")
		.attr("id", function(d){return "axis-text-" + d.replace(/[^A-Z0-9]/ig, "_");})
		.text(function(d){return d})
		.style("font-family", cfg.fontFamily)
		.style("font-size", cfg.fontSize)
		.attr("fill", cfg.labelColor)
		.attr("text-anchor", "middle")
		.attr("dy", "1.5em")
		.attr("transform", function(d, i){return "translate(0, -15)"})
		.attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-50*Math.sin(i*cfg.radians/total);})
		.attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))-20*Math.cos(i*cfg.radians/total);})
		.on('click', d => click(d, message));
		
	// Check is filter option is selected.
	const enableInteractions =
    message.interactions.onClick.value.type === 'FILTER' ? true : false;

	// If filtering is enabled and items have been selected, then adjust the color
	// of the axis and axis title.
  if (enableInteractions) {
	  var lineSelector = "";
	  var textSelector = "";
    if (message.interactions.onClick.value.data !== undefined) {
      const selected = message.interactions.onClick.value.data.values;
      selected.forEach(val => {
	      //console.log(val);
        lineSelector = "#axis-line-"+val[0].replace(/[^A-Z0-9]/ig, "_");
        d3.selectAll(lineSelector)
          .style('stroke', cfg.filterColor);
        textSelector = "#axis-text-"+val[0].replace(/[^A-Z0-9]/ig, "_");
        d3.selectAll(textSelector)
          .style('fill', cfg.filterColor);
      });
    }
  }

	// Build the shapes for each group.
	d.forEach(function(y, x){
	  dataValues = [];
	  g.selectAll(".nodes")
		.data(y, function(j, i){
		  dataValues.push([
			cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)), 
			cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
		  ]);
		});
	  dataValues.push(dataValues[0]);
	  g.selectAll(".area")
					 .data([dataValues])
					 .enter()
					 .append("polygon")
					 .attr("class", "radar-chart-serie"+series)
					 .style("stroke-width", "2px")
					 .style("stroke", cfg.themeColor[series].color)
					 .attr("points",function(d) {
						 var str="";
						 for(var pti=0;pti<d.length;pti++){
							 str=str+d[pti][0]+","+d[pti][1]+" ";
						 }
						 return str;
					  })
					 .style("fill", function(j, i){return cfg.themeColor[series].color})
					 .style("fill-opacity", cfg.opacityArea)
					 .on('mouseover', function (d){
										var z = "polygon."+d3.select(this).attr("class");
										g.selectAll("polygon")
										 .transition(200)
										 .style("fill-opacity", 0.1); 
										g.selectAll(z)
										 .transition(200)
										 .style("fill-opacity", .7);
									  })
					 .on('mouseout', function(){
										g.selectAll("polygon")
										 .transition(200)
										 .style("fill-opacity", cfg.opacityArea);
					 });
	  series++;
	});
	series=0;


	// Add circles to indecate each point on each axis.
	d.forEach(function(y, x){
	  g.selectAll(".nodes")
		.data(y).enter()
		.append("svg:circle")
		.attr("class", "radar-chart-serie"+series)
		.attr("id", function(j){ return "radar-circle-"+j.axis.replace(/\s+/g, '')+"-"+j.group.replace(/\s+/g, ''); })
		.attr('r', cfg.radius)
		.attr("alt", function(j){return Math.max(j.value, 0)})
		.attr("cx", function(j, i){
		  dataValues.push([
				cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)), 
				cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
			]);
			return cfg.w/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total));
		})
		.attr("cy", function(j, i){
		  return cfg.h/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total));
		})
		.attr("data-id", function(j){return j.axis})
		.style("fill", cfg.themeColor[series].color).style("fill-opacity", .9)
		.on('mouseover', function (d){
					var newX =  parseFloat(d3.select(this).attr('cx')) - 10;
					var newY =  parseFloat(d3.select(this).attr('cy')) - 5;
					
					var boundingBox = this.getBoundingClientRect();
					var tooltipStyleLeft = boundingBox.left + 5 + 'px';
					
					tooltip
						.attr('x', newX)
						.attr('y', newY)
						.style('top', boundingBox.top + 5 + 'px')
						.style('left', tooltipStyleLeft)
						.transition(200)
						.style('visibility', 'visible')
						.style('padding', '10px');
						
					tooltip
						.select("#title")
						.style('font-family', cfg.fontFamily)
						.style('font-size', cfg.fontSize + 'px')
						.style('color', '#6d6d6d')
						.text(d.axis)
						;
					
					tooltip
						.select("#metric")
						.text(d.group + " - " + message.fields.metrics[0].name + ": " + Format(d.value))
						.style('font-family', cfg.fontFamily)
						.style('font-size', cfg.fontSize + 'px')
						.style('color', '#6d6d6d')
						;
						
					var z = "polygon."+d3.select(this).attr("class");
					g.selectAll("polygon")
						.transition(200)
						.style("fill-opacity", 0.1); 
					g.selectAll(z)
						.transition(200)
						.style("fill-opacity", .7);
				  })
		.on('mouseout', function(){
					tooltip
						.transition(200)
						.style('visibility', 'hidden');
					g.selectAll("polygon")
						.transition(200)
						.style("fill-opacity", cfg.opacityArea);
				  })
		;

	  series++;
	});
	
	// Build the legend to help distinguish the groups/different shapes
	// from the second dimension.
	if (styleVal(message, 'show_legend')) {		   
	    var svg = d3.select(id)
			.selectAll('svg');
	
		//Create the title for the legend
		var text = svg.append("text")
			.attr("class", "title")
			.attr('transform', 'translate(90,0)') 
			.attr("x", cfg.w - 70)
			.attr("y", 10)
			.attr("font-size", cfg.fontSize)
			.attr("fill", cfg.labelColor);
				
		//Initiate Legend	
		var legend = svg.append("g")
			.attr("class", "legend")
			.attr("height", 100)
			.attr("width", 200)
			.attr('transform', 'translate(90,20)') 
			;
			//Create colour squares
			legend.selectAll('rect')
			  .data(LegendOptions.map(function(d){return d.group}))
			  .enter()
			  .append("rect")
			  .attr("x", cfg.w - 65)
			  .attr("y", function(d, i){ return i * 20;})
			  .attr("width", 10)
			  .attr("height", 10)
			  .style("fill", function(d, i){ return cfg.themeColor[i].color;})
			  ;
			//Create text next to squares
			legend.selectAll('text')
			  .data(LegendOptions.map(function(d){return d.group}))
			  .enter()
			  .append("text")
			  .attr("x", cfg.w - 52)
			  .attr("y", function(d, i){ return i * 20 + 9;})
			  .attr("font-size", cfg.fontSize)
			  .attr("fill", cfg.labelColor)
			  .text(function(d) { return d; })
			  ;	
	}
	
};

const drawViz = message => {
  try {
    draw(message);
  } catch (err) {
	draw(message);
    ut.displayError(ut.GENERAL_ERROR);
  }
};

// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}
