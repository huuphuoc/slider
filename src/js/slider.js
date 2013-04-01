/**
 * Slider
 *
 * Copyright (c) 2013 Nguyen Huu Phuoc <thenextcms@gmail.com>
 */

(function($) {
    var Slider = function(element, options) {
        // The default options
        var defaultOptions = {
            // {String} The CSS selector to retrieve all slide items.
            // By default, it will get all children of the slider node
            selector: '*',

            // {String} The prefix that will be appended at the top to CSS class of prev, next, pagination, and slides
            classPrefix: 's-',

            // {Number} The size of slider in pixels.
            // If it is not defined, it will be determined when all slides are loaded completely
            width: null,
            height: null,

            // {Boolean} Setting it to TRUE will start the slider automatically
            autoPlay: true,

            // {Number} The number of milliseconds to show each slide
            interval: 4000,

            // {Boolean} Use the shortcut keys (<-/->) to go to the previous/next slide
            keyboard: true
        };

        this.$element     = $(element);
        this.options      = $.extend({}, defaultOptions, options);
        this.slides       = this.$element.children(this.options.selector);
        this.$viewPort    = null;
        this.$progressBar = null;
        this._timer       = null;

        // Track status
        this._currentSlide = 0;
        this._numSlides    = this.slides.length;
        this._isPlaying    = false;
        this._elapsedTime  = 0;
        this._startTime    = 0;

        this._init();
    };

    Slider.prototype = {
        _init: function() {
            var that = this;

            // Hide all slides
            this.slides.hide();

            // The slider will be structured as the following:
            //  <div class="x-wrapper">
            //      <div class="x-progressbar"></div>
            //      <div class="x-inner">                       <!-- Slides container -->
            //          <div class="x-slide"></div>
            //          <div class="x-slide x-active"></div>
            //      </div>
            //      <ol class="x-pagination">                   <!-- Pagination -->
            //          <li><a href="">1</a></li>
            //          <li class="x-active"><a href="">2</a></li>
            //      </ol>
            //      <a class="x-prev x-control">Prev</a>
            //      <a class="x-next x-control">Next</a>
            //  </div>
            this.$element.addClass(this.options.classPrefix + 'wrapper');
            this.slides.addClass(this.options.classPrefix + 'slide');

            this.$viewPort = $('<div/>')
                .addClass(this.options.classPrefix + 'inner')
                .addClass(this.options.classPrefix + 'loading');
            this.$element.wrapInner(this.$viewPort);

            // Wait for all images loaded
            var $images      = this.$element.find('img'),
                numImages    = $images.length,
                imagesLoaded = 0;
            $images.each(function() {
                var img = new Image();
                // This is safe way to get the size of image
                $(img)
                    .on('load', function() {
                        imagesLoaded++;
                        that.width  = that.width  || this.width;
                        that.height = that.height || this.height;
                        if (imagesLoaded >= numImages) {
                            that._completeLoading();
                        }
                    })
                    .attr('src', $(this).attr('src'));
            });
        },

        /**
         * Called when all images are loaded completely
         */
        _completeLoading: function() {
            var that = this;

            // Add progress bar
            this.$progressBar = $('<div/>')
                .addClass(this.options.classPrefix + 'progressbar')
                .prependTo(this.$element);
            this.$progressBar
                .data('width', this.width)
                .width(this.width)
                .hide();

            // Show the first one
            this.slides.eq(this._currentSlide).show();

            if (this.options.autoPlay) {
                this._start();
                this._timer = setTimeout(function() {
                    that.next();
                }, this.options.interval);
            }

            // Enable shortcut
            if (this.options.keyboard) {
                $(document).on('keyup', function(e) {
                    switch (e.keyCode) {
                        case 37:    // Left arrow key (<-)
                            that.prev();
                            // Prevent the page scrolling horizontally
                            return false;
                            break;
                        case 39:    // Right arrow key (->)
                        case 32:    // Space bar
                            that.next();
                            return false;
                            break;
                        default:
                            break;
                    }
                });
            }
        },

        _start: function() {
            this._elapsedTime = 0;
            this._startTime   = new Date().getTime();

            this.$progressBar
                .hide()
                .dequeue()
                .width(this.$progressBar.data('width'))
                .animate({
                    width: 'show'
                }, this.options.interval, 'linear');
        },

        _complete: function() {
            var that = this;
            this._isPlaying = false;
            this._timer     = setTimeout(function() {
                that._done();
            }, this.options.interval);
            this._start();
        },

        _done: function() {
            clearTimeout(this._timer);
            this.next();
        },

        // ------------
        // --- APIs ---
        // ------------

        /**
         * Show the previous slide
         */
        prev: function() {

        },

        /**
         * Shows the next slide
         */
        next: function() {
            // Hide the progress bar
            this.$progressBar
                .stop()
                .fadeOut(300, function() {
                    $(this).width($(this).data('width'));
                });

            // Just hide the current slide, show the next one
            this.slides.eq(this._currentSlide).css('display', 'none');
            this._currentSlide++;
            if (this._currentSlide >= this._numSlides - 1) {
                this._currentSlide = 0;
            }
            this.slides.eq(this._currentSlide).css('display', 'block');

            this._complete();
        }
    };

    // Plugin definition
    $.fn.cooslider = function(options) {
        return this.each(function() {
            var slider = $(this).data('Slider');
            if (null == slider) {
                slider = new Slider(this, options);
                $(this).data('Slider', slider);
            }
            return slider;
        });
    };
})(window.jQuery);
