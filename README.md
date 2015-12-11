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
 - As an unauthenticated user, I can view all bars in my area.
 - As an authenticated user, I can add myself to a bar to indicate I am going there tonight.
 - As an authenticated user, I can remove myself from a bar if I no longer want to go there.
 - As an unauthenticated user, when I login I should not have to search again.

##### Known issues
 - The API may stop responding after multiple queries in quick succession. The autocomplete uses the API as well.