console.log('Demo Helper Loaded');
angular.module('DemoHelper', ['winch'])
  .directive('translateHelper', ['$window', 'translateService', function($window, ts) {
    return {
      restrict: 'A',
      link: function(scope) {
        scope.loaded = true;
        console.log('Loaded Trans Helper');
        var translateEl = angular.element($window.document.querySelector('#translate-el'));
        scope.transUp = function() {
          console.log('Scroll Up');
          translateEl.css(ts.translateCSS(0, -500));
        };
        scope.transDown = function() {
          console.log('Scroll Down');
          translateEl.css(ts.translateCSS(0, 500));
        };
      }
    };
  }])
  .directive('loadDynamicPortal', ['$compile', function($compile) {
    return {
      restrict: 'A',
      templateUrl: 'dynamic.html',
      replace: true,
      link: function(scope, elem) {
        console.log('Loaded Dynamic');
        scope.count = 0;
        scope.addImage = function() {
          angular.element(
            elem[0].querySelector('.content-scroll')
          ).append(
            $compile(
              '<winch-img src="http://placehold.it/350x150&text=Dynamic+Append+' + (scope.count += 1) + '"></winch-img>'
            )(angular.element(elem[0].querySelector('.content-scroll')).scope())
          );
          angular.element(elem[0].querySelector('.content-scroll')).scope().checkPortal();
        };
      }
    };
  }])
  .directive('testFilter', ['$filter', '$compile', function($filter, $compile) {
    return {
      restrict: 'A',
      templateUrl: 'filter.html',
      link: function(scope, elem) {
        console.log('Loaded');
        var data = $filter('winchify')('<div><img src="http://placehold.it/350x150&text=Filter+Load+1">' +
          '<p>Hello World</p><p>Hello World</p><p>Hello World</p><p>Hello World</p><p>Hello World</p>' +
          '<br><br><br><br><br><img src="http://placehold.it/350x150&text=Filter+Load+2">' +
          '<p>Foo bar</p><p>Hello World</p><p>Hello World</p><p>Hello World</p><br><br><br><br><br>' +
          '<IMG src="http://placehold.it/350x150&text=Filter+Load+3"><p>Hello World</p><p>Hello World</p>' +
          '<br><br><ImG src="http://placehold.it/350x150&text=Filter+Load+4"></div>', 'filter-portal');
        console.log(data);
        angular.element(
          elem[0].querySelector('.content-scroll')
        ).append(
          $compile(data)(angular.element(elem[0].querySelector('.content-scroll')).scope())
        );
        angular.element(elem[0].querySelector('.content-scroll')).scope().checkPortal();
      }
    };
  }])
  .directive('triggerValidation', [function() {
    return {
      link: function(scope) {
        scope.triggerValidation = function() {
          scope.$broadcast('winch:validation');
        };
      }
    };
  }])
  .directive('demoDynamic',[function(){
    return {
      link: function(scope){
        scope.getUrl = function(val){
          if(val){
            return 'http://placehold.it/350x150&text=' + val;
          }else{
            return 'http://placehold.it/350x150&text=' + new Date().getTime();
          }
        };
        scope.getUrlExp = 'http://placehold.it/350x150&text=expression';
      }
    };
  }])
  .service('translateService', function() {
    var currentPositionX = 0,
      currentPositionY = 0;

    this.translateCSS = function(movebyX, movebyY) {
      currentPositionX += movebyX;
      currentPositionY += movebyY;

      return {
        '-webkit-transform': 'translate(' + currentPositionX + 'px, ' + currentPositionY + 'px)',
        'transform': 'translate(' + currentPositionX + 'px, ' + currentPositionY + 'px)'
      };
    };
  });