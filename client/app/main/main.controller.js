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
    for(var i=0;i< data.Elements.length; i++) {
      var currentStock = data.Elements[i];
      var dots = $scope.viz.selectAll('circle' + i)
        .data(currentStock.DataSeries.close.values)
        .enter()
        .append('circle')
      dots.attr('r', 2)
        .attr('cx', function(d, index) {return data.Positions[index]*600;})
        .attr('cy', function(d, index) {return 400-d;})
        .style('fill', $scope.colors[i])
      // console.log(dots)
    }
  };
  
});
