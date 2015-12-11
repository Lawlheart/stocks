#STOCKS
##### by Kenneth Black

Single Page App that charts the stock market using data from the Markit on demand Market Data API. Chart updates for all users in real time whenever a stock is added or removed.

##### I learned

 - How to connect to a third party API for stocks data.
 - How to make an autocomplete box from API data.
 - How to use d3.js to visualize data.
 - How to use toast notifications to warn the user of errors.
 - How to refresh d3 elements so the proper items stay on top.
 - How to use socket.io to deliver updates to users in real time.

##### Skills used 
 - MongoDB
 - Express.js
 - AngularJS
 - Node.js
 - JavaScript
 - d3.js
 - Socket.io
 - Yeoman
 - Grunt
 - oAuth
 - HTML5
 - CSS3
 - RESTful APIs
 - AJAX

##### User Stories
 - As a user, I can view a graph displaying the recent trend lines for each added stock.
 - As a user, I can add new stocks by their symbol name.
 - As a user, I can remove stocks.
 - As a user, I can see changes in real-time when any other user adds or removes a stock.

##### Known issues
 - The API may stop responding after multiple queries in quick succession. The autocomplete uses the API as well.