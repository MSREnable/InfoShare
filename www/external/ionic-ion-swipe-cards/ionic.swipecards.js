(function(ionic) {

  // Get transform origin poly
  var d = document.createElement('div');

  var transitionKeys = ['webkitTransition', 'transition', '-webkit-transition', 'webkit-transition',
              '-moz-transition', 'moz-transition', 'MozTransition', 'mozTransition'];
  var TRANSITION = 'webkitTransition';
  for(var i = 0; i < transitionKeys.length; i++) {
    if(d.style[transitionKeys[i]] !== undefined) {
      TRANSITION = transitionKeys[i];
      break;
    }
  }

  var SwipeableCardController = ionic.views.View.inherit({
    initialize: function(opts) {
      this.cards = [];

      var ratio = window.innerWidth / window.innerHeight;

      this.maxWidth = window.innerWidth - (opts.cardGutterWidth || 0);
      this.maxHeight = opts.height || 300;
      this.cardGutterWidth = opts.cardGutterWidth || 10;
      this.cardPopInDuration = opts.cardPopInDuration || 400;
      this.cardAnimation = opts.cardAnimation || 'pop-in';
    },
    /**
     * Push a new card onto the stack.
     */
    pushCard: function(card) {
      var self = this;

      this.cards.push(card);
      this.beforeCardShow(card);

      card.transitionIn(this.cardAnimation);
      setTimeout(function() {
        card.disableTransition(self.cardAnimation);
      }, this.cardPopInDuration + 100);
    },
    /**
     * Set up a new card before it shows.
     */
    beforeCardShow: function() {
      var nextCard = this.cards[this.cards.length-1];
      if(!nextCard) return;
      
      nextCard.setPopInDuration(this.cardPopInDuration);
      nextCard.setZIndex(this.cards.length);
    },
    /**
     * Pop a card from the stack
     */
    popCard: function(animate) {
      var card = this.cards.pop();
      if(animate) {
        card.swipe();
      }
      return card;
    }
  });

  var SwipeableCardView = ionic.views.View.inherit({
    /**
     * Initialize a card with the given options.
     */
    initialize: function(opts) {
      opts = ionic.extend({
      }, opts);

      ionic.extend(this, opts);

      this.el = opts.el;

      this.startX = this.startY = this.x = this.y = 0;

      this.bindEvents();
    },

    /**
     * Set the X position of the card.
     */
    setX: function(x) {
      this.el.style[ionic.CSS.TRANSFORM] = 'translate3d(' + x + 'px,' + this.y + 'px, 0)';
      this.x = x;
      this.startX = x;
    },

    /**
     * Set the Y position of the card.
     */
    setY: function(y) {
      this.el.style[ionic.CSS.TRANSFORM] = 'translate3d(' + this.x + 'px,' + y + 'px, 0)';
      this.y = y;
      this.startY = y;
    },

    /**
     * Set the Z-Index of the card
     */
    setZIndex: function(index) {
      this.el.style.zIndex = index;
    },

    /**
     * Set the width of the card
     */
    setWidth: function(width) {
      this.el.style.width = width + 'px';
    },

    /**
     * Set the height of the card
     */
    setHeight: function(height) {
      this.el.style.height = height + 'px';
    },

    /**
     * Set the duration to run the pop-in animation
     */
    setPopInDuration: function(duration) {
      this.cardPopInDuration = duration;
    },

    /**
     * Transition in the card with the given animation class
     */
    transitionIn: function(animationClass) {
      var self = this;

      this.el.classList.add(animationClass + '-start');
      this.el.classList.add(animationClass);
      this.el.style.display = 'block';
      setTimeout(function() {
        self.el.classList.remove(animationClass + '-start');
      }, 100);
    },

    /**
     * Disable transitions on the card (for when dragging)
     */
    disableTransition: function(animationClass) {
      this.el.classList.remove(animationClass);
    },

    /**
     * Swipe a card out programtically
     */
    swipe: function() {
      this.transitionOut();
    },

    /**
     * Fly the card out or animate back into resting position.
     */
    transitionOut: function() {
      var self = this;

      if(this.x < 100) {
        this.el.style[TRANSITION] = '-webkit-transform 0.2s ease-in-out';
        this.el.style[ionic.CSS.TRANSFORM] = 'translate3d(' + (this.startX) + 'px,' + this.y + ', 0)';
        setTimeout(function() {
          self.el.style[TRANSITION] = 'none';
        }, 200);
      } else {
        // Fly out
        var duration = this.rotationAngle ? 0.2 : 0.5;
        this.el.style[TRANSITION] = '-webkit-transform ' + duration + 's ease-in-out';
        this.el.style[ionic.CSS.TRANSFORM] = 'translate3d(' + (window.innerWidth * 1.5) +  'px,' + this.y + ', 0)';
        this.onSwipe && this.onSwipe();

        // Trigger destroy after card has swiped out
        setTimeout(function() {
          self.onDestroy && self.onDestroy();
        }, duration * 1000);
      }
    },

    /**
     * Bind drag events on the card.
     */
    bindEvents: function() {
      var self = this;
      ionic.onGesture('dragstart', function(e) {
        ionic.requestAnimationFrame(function() { self._doDragStart(e) });
      }, this.el);

      ionic.onGesture('drag', function(e) {
        ionic.requestAnimationFrame(function() { self._doDrag(e) });
      }, this.el);

      ionic.onGesture('dragend', function(e) {
        ionic.requestAnimationFrame(function() { self._doDragEnd(e) });
      }, this.el);
    },

    _doDragStart: function(e) {
      //Nothing to do...
    },

    _doDrag: function(e) {
      this.x = this.startX + (e.gesture.deltaX);

      this.el.style[ionic.CSS.TRANSFORM] = 'translate3d(' + this.x + 'px, ' + this.y  + 'px, 0)';
    },
    
    _doDragEnd: function(e) {
      this.transitionOut(e);
    }
  });


  angular.module('ionic.contrib.ui.cards', ['ionic'])

  .directive('swipeCard', ['$timeout', function($timeout) {
    return {
      restrict: 'E',
      template: '<div class="swipe-card" ng-transclude></div>',
      require: '^swipeCards',
      transclude: true,
      scope: {
        onCardSwipe: '&',
        onDestroy: '&'
      },
      link: function($scope, $element, $attr, swipeCards) {
        var el = $element[0];

        // Instantiate our card view
        var swipeableCard = new SwipeableCardView({
          el: el,
          onSwipe: function() {
            $timeout(function() {
              $scope.onCardSwipe();
            });
          },
          onDestroy: function() {
            $timeout(function() {
              $scope.onDestroy();
            });
          },
        });
        $scope.$parent.swipeCard = swipeableCard;

        swipeCards.swipeController.pushCard(swipeableCard);

      }
    }
  }])

  .directive('swipeCards', ['$rootScope', function($rootScope) {
    return {
      restrict: 'E',
      template: '<div class="swipe-cards" ng-transclude></div>',
      transclude: true,
      scope: true,
      controller: function($scope, $element) {
        var swipeController = new SwipeableCardController({
        });

        $rootScope.$on('swipeCard.pop', function(isAnimated) {
          swipeController.popCard(isAnimated);
        });

        this.swipeController = swipeController;

        //return swipeController;
      }
    }
  }])

  .factory('$ionicSwipeCardDelegate', ['$rootScope', function($rootScope) {
    return {
      popCard: function($scope, isAnimated) {
        $rootScope.$emit('swipeCard.pop', isAnimated);
      },
      getSwipeableCard: function($scope) {
        return $scope.$parent.swipeCard;
      }
    }
  }]);

})(window.ionic);