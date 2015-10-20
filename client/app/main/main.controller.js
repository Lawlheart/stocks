'use strict';

angular.module('stocksApp')

.controller('MainCtrl', function ($scope, $http, socket) {

  //on page load, sets up variables, calls stocks api
  $('#stocks-screen').addClass('hidden');
  $scope.colors = ["green", "blue", "purple", "teal", "orange"];
  $http.get('/api/stocks/allstocks').success(function(data) {
    $scope.stocks = data.stocks;
    //syncs socket updates with getMarkitData as a callback
    socket.syncUpdates('stock', [], function(event, item, object) {
      $scope.stocks = item
      $scope.getMarkitData();
    });
  }).error(function(error) {
    // if allstocks doesn't exist, creates it with empty stocks array
    $http.post('/api/stocks/', {_id: "allstocks", stocks: []})
    .success(function(data) {
      console.log("no allstocks data, creating empty data", data)
      $scope.stocks = data.stocks;
    })
  })
  
  //takes the stocks array and converts it into the api query parameters
  $scope.getParameters = function(stocks) {
    var parameters = { 
        "Normalized":false,
        "NumberOfDays":365,
        "DataPeriod":"Day",
        "Elements":[]
      };
    for(var i=0;i<stocks.length;i++) {
      parameters.Elements.push({
        "Symbol":stocks[i],
        "Type":"price",
        "Params":["c"]
      })
    }
    return parameters;
  };

  //call getParameters, gets data from markit api, calls renderStocks if stocks.length > 0
  $scope.getMarkitData = function() {
    $('#start-screen').fadeOut();
    var parameters = encodeURI(JSON.stringify($scope.getParameters($scope.stocks)));
    $http.jsonp('http://dev.markitondemand.com/Api/v2/InteractiveChart/jsonp?parameters=' + parameters + '&callback=JSON_CALLBACK').success(function(data) {
      //if stocks array is empty, empties viz, stocksData, otherwise, calls renderStocks
      $('#stocks-screen').removeClass('hidden').fadeIn();
      if($scope.stocks.length > 0) {
        $scope.renderStocks(data);
      } else {
        $scope.stocksData = [];
        $("#viz").empty();
      }
    }).error(function(err) {
      console.error(err)
    })
  };

  //adds newStock input, calls updateStocks
  $scope.addStock = function(newStock) {
    $scope.stocks.push(newStock);
    $scope.updateStocks();
  };

  //removes removedStock input, calls updateStocks
  $scope.removeStock = function(removedStock) {
    $scope.stocks = $scope.stocks.filter(function(stockName) {
      return stockName !== removedStock;
    })
    $scope.updateStocks();
  };

  //updates stocks api with new $scope.stocks value, calls getMarkitData 
  $scope.updateStocks = function() {
    $http.put('api/stocks/allstocks', {_id: "allstocks", stocks: $scope.stocks}).success(function(data) {
      $scope.getMarkitData();
      $scope.newStock = "";
    })
  };

  //renders stocks using d3. data input is raw data from Markit API
  $scope.renderStocks = function(data) {
    $("#viz").empty();
    $scope.viz = d3.select('#viz')
    $scope.stocksData = data.Elements;

    //set up x variables
    //set up xDomain by parsing time and passing it into d3.extent
    var parseTime = d3.time.format('%Y-%m-%dT%H:%M:%S');
    var xScale = d3.time.scale().range([900, 0]);
    var xAxis = d3.svg.axis().scale(xScale).orient('bottom').ticks(10);
    var xMin = d3.min(data.Dates, function(d) {
      var time = parseTime.parse(d);
      time.setMonth(time.getMonth() - 1);
      return time
    });
    var xMax = d3.max(data.Dates, function(d) {
      var time = parseTime.parse(d);
      time.setMonth(time.getMonth() + 1);
      return time
    });
    console.log([xMin, xMax])
    xScale.domain([xMin, xMax]);
    $scope.viz.append('g')
      .attr('class', 'x axis')
      .call(xAxis)
      .selectAll('text')
      .attr('transform', function() {
        return 'rotate(-65)'
      })
      .style('text-anchor', 'end')
      .style('font-size', '10px')
      .attr('cx', '-10px')
      .attr('cy', '10px')


    //set up y variables
    //Set up yDomain by combining all datasets to one array, then using d3.extent
    var yScale = d3.scale.linear().range([400,0]);
    var yAxis = d3.svg.axis().scale(yScale).orient('left').ticks(10);
    var allData = [];
    for(var i=0;i<data.Elements.length;i++) {
      allData = allData.concat(data.Elements[i].DataSeries.close.values)
    }
    var yDomain = d3.extent(allData, function(d) {
      return parseInt(d)*1.1;
    });
    yScale.domain(yDomain);
    $scope.viz.append('g')
      .attr('class', 'y axis')
      .call(yAxis);


    for(var i=0;i< data.Elements.length; i++) {

      var dots = $scope.viz.selectAll('g.dots.data-set.' + data.Elements[i].Symbol)
        .data(data.Elements[i].DataSeries.close.values)
        .enter()
        .append('g')
        .attr('class', 'dots data-set')
        .attr('class', data.Elements[i].Symbol)

      dots.attr('transform', function(d, index) {
        var date = parseTime.parse(data.Dates[index]);
        var x = xScale(date) + 50;
        var y = yScale(d);
        return 'translate(' + x + ',' + y + ')'
      })
        .style('fill', $scope.colors[i])
        .style('stroke', '#222')

      dots.append('circle')
          .attr('r', 3);

      dots.append('text').text(function(d) {
          return "$" + d
        })
        .style('display', 'none');

      dots.on("mouseenter", function(d, i) {
        var dot = d3.select(this);
        dot.select('text')
           .style('display', 'block');
      });

      dots.on("mouseleave", function(d, i) {
        d3.select(this)
           .select('text')
           .style('display', 'none');
      });



      console.log(data)
    }
  };
  
});
