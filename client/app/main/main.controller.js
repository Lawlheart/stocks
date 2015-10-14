'use strict';

angular.module('stocksApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $('#stocks-screen').addClass('hidden');
    $scope.loaded = false;
    $scope.colors = ["green", "blue", "purple", "teal", "orange"];
    $http.get('/api/stocks/allstocks').success(function(data) {
      console.log(data);
      $scope.stocks = data.stocks;

    }).error(function(error) {
      console.error(error);
      $http.post('/api/stocks/', {_id: "allstocks", stocks: []})
      .success(function(data) {
        console.log(data)
        $scope.stocks = data.stocks;
      })
    })
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
  }
  $scope.start = function() {
    var parameters = $scope.getParameters($scope.stocks);
    $('#start-screen').fadeOut();
    var url = 'http://dev.markitondemand.com/Api/v2/InteractiveChart/jsonp?parameters=' 
    url += encodeURI(JSON.stringify(parameters));
    url += '&callback=JSON_CALLBACK';

    $http.jsonp(url).success(function(data) {
      if($scope.stocks.length === 0) {
        $('#stocks-screen').removeClass('hidden').fadeIn();
        $scope.stocksData = [];
        $("#viz").empty();
        return;
      }
      console.log(data);
      $scope.renderStocks(data);
      $('#stocks-screen').removeClass('hidden').fadeIn();
      $scope.loaded = true;
    }).error(function(err) {
      console.error(err)
    })
  };

  $scope.addStock = function(newStock) {
    $scope.stocks.push(newStock);
    $scope.updateStocks();

  }
  $scope.removeStock = function(removedStock) {
    $scope.stocks = $scope.stocks.filter(function(stockName) {
      return stockName !== removedStock;
    })
    $scope.updateStocks();
  }
  $scope.updateStocks = function() {
    $http.delete('api/stocks/allstocks').success(function() {
      $http.post('api/stocks', {_id: "allstocks", stocks: $scope.stocks})
      .success(function(data) {
        console.log(data);
        $scope.start();
        $scope.newStock = "";
      })
    })
  }
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
        console.log(dots)
      }
  }


    // $scope.awesomeThings = [];

    // $http.get('/api/things').success(function(awesomeThings) {
    //   $scope.awesomeThings = awesomeThings;
    //   socket.syncUpdates('thing', $scope.awesomeThings);
    // });

    // $scope.addThing = function() {
    //   if($scope.newThing === '') {
    //     return;
    //   }
    //   $http.post('/api/things', { name: $scope.newThing });
    //   $scope.newThing = '';
    // };

    // $scope.deleteThing = function(thing) {
    //   $http.delete('/api/things/' + thing._id);
    // };

    // $scope.$on('$destroy', function () {
    //   socket.unsyncUpdates('thing');
    // });
  });
