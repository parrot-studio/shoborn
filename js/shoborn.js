(function() {
  var Timer, Tweet, TweetSearcher, View;

  Tweet = (function() {
    var formatDate, level1, level2a, level2b, level3, levelca, levelcb, parseLevel, zeroPadding;

    level3 = /[\(（]\s*[\´\']\s*[･・]\s*ω\s*[･・]\s*[\`｀]\s*[\)）]/;

    level2a = /[\(（]\s*[\´\']\s*[･・]\s*ω\s*[･・]\s*[\`｀]?\s*[\)）]?/;

    level2b = /[\(（]?\s*[\´\']?\s*[･・]\s*ω\s*[･・]\s*[\`｀]\s*[\)）]/;

    level1 = /[\(（]?\s*.?\s*[･・]\s*ω\s*[･・]\s*.?\s*[\)）]?/;

    levelca = /[･・]\s*ω\s*[･・]?/;

    levelcb = /[･・]?\s*ω\s*[･・]/;

    function Tweet(tweet) {
      var _ref, _ref2, _ref3, _ref4, _ref5;
      this.id = (_ref = tweet.id_str) != null ? _ref : '';
      this.user = (_ref2 = tweet.from_user) != null ? _ref2 : '';
      this.userName = (_ref3 = tweet.from_user_name) != null ? _ref3 : '';
      this.text = (_ref4 = tweet.text) != null ? _ref4 : '';
      this.imgUrl = (_ref5 = tweet.profile_image_url) != null ? _ref5 : '';
      this.date = formatDate(tweet.created_at);
      this.level = parseLevel(this.text);
      this.userUrl = "https://twitter.com/#!/" + this.user;
      this.tweetUrl = "https://twitter.com/#!/" + this.user + "/status/" + this.id;
    }

    parseLevel = function(t) {
      if (t == null) return 0;
      if (level3.test(t)) {
        return 3;
      } else if (level2a.test(t)) {
        return 2;
      } else if (level2b.test(t)) {
        return 2;
      } else if (level1.test(t)) {
        return 1;
      }
      return 0;
    };

    formatDate = function(ds) {
      var d;
      if (!ds) return '';
      d = new Date(ds);
      return "" + (d.getFullYear()) + "/" + (zeroPadding(d.getMonth() + 1)) + "/" + (zeroPadding(d.getDate())) + " " + (zeroPadding(d.getHours())) + ":" + (zeroPadding(d.getMinutes())) + ":" + (zeroPadding(d.getSeconds()));
    };

    zeroPadding = function(n) {
      n = n.toString();
      if (n.length !== 1) return n;
      return "0" + n;
    };

    return Tweet;

  })();

  TweetSearcher = (function() {
    var index, nextId, pageSize, parseTweet, result, searchUrl, twitterSeaech;

    function TweetSearcher() {}

    searchUrl = "http://search.twitter.com/search.json";

    result = [];

    index = 0;

    pageSize = 100;

    nextId = null;

    twitterSeaech = function(params, func) {
      var p;
      p = {
        url: searchUrl,
        cache: false,
        data: params,
        dataType: "jsonp",
        success: (function(data) {
          return func(data);
        })
      };
      $.ajax(p);
      return this;
    };

    parseTweet = function(data) {
      var d, _i, _len, _ref;
      _ref = data.results;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        d = _ref[_i];
        result.push(new Tweet(d));
        nextId = d.id;
      }
      return this;
    };

    TweetSearcher.prototype.search = function(func) {
      var p;
      p = {
        q: "(´･ω･`) -RT",
        lang: 'ja',
        rpp: pageSize
      };
      if (nextId !== null) p.max_id = nextId;
      twitterSeaech(p, (function(data) {
        return func(parseTweet(data));
      }));
      return this;
    };

    TweetSearcher.prototype.nextFor = function(level) {
      var l, r, ret;
      l = level || 1;
      while (index < result.length) {
        r = result[index];
        index += 1;
        if (r.level >= l) {
          ret = r;
          break;
        }
      }
      return ret != null ? ret : null;
    };

    TweetSearcher.prototype.reset = function() {
      result = [];
      index = 0;
      nextId = null;
      return this;
    };

    TweetSearcher.prototype.rollback = function() {
      return index = 0;
    };

    return TweetSearcher;

  })();

  Timer = (function() {
    var cycle, func, timer;

    timer = null;

    func = null;

    cycle = 1000;

    function Timer(c) {
      cycle = c;
    }

    Timer.prototype.start = function(func) {
      timer = setTimeout((function() {
        return func();
      }), cycle);
      return this;
    };

    Timer.prototype.stop = function() {
      if (timer) clearTimeout(timer);
      timer = null;
      return this;
    };

    return Timer;

  })();

  View = (function() {
    var addMoreLink, addNext, addTweet, clear, createTweetBlock, fadeTime, paused, replaceUserLink, reset, rollback, roopTime, scrollTime, search, searcher, timer, userParser, viewLevel, viewLv;

    function View() {}

    userParser = /@([a-zA-Z0-9_]+)/g;

    fadeTime = 200;

    roopTime = 500;

    scrollTime = 600;

    viewLevel = 1;

    paused = false;

    timer = new Timer(roopTime);

    searcher = new TweetSearcher;

    addNext = function() {
      var t;
      timer.stop();
      if (paused) return this;
      t = searcher.nextFor(viewLevel);
      if (t === null) {
        addMoreLink();
      } else {
        addTweet(t);
        timer.start(addNext);
      }
      return this;
    };

    replaceUserLink = function(tx) {
      return tx.replace(userParser, function(auser, uid) {
        return "<a href='https://twitter.com/#!/" + uid + "' target='_blank'>@" + uid + "</a>";
      });
    };

    viewLv = function(lv) {
      switch (lv) {
        case 0:
          return '(･ω･)';
        case 1:
          return '(´･ω･`)';
        case 2:
          return '(´･ω･`)ω･`)';
        case 3:
          return '(´･ω･`)ω･`)ω･`)';
        default:
          return '';
      }
    };

    createTweetBlock = function(tweet) {
      return "<div class=\"tweet-block span8\">\n  <div class=\"tweet-user-img\">\n    <img src=\"" + tweet.imgUrl + "\" />\n  </div>\n  <div class=\"tweet-body lv" + tweet.level + "\">\n    <p>\n      " + (replaceUserLink(tweet.text)) + "<br/>\n      <small>\n        Lv:" + (viewLv(tweet.level)) + "\n        by <a href=\"" + tweet.userUrl + "\" target=\"_blank\">" + tweet.user + " / " + tweet.userName + "</a>\n        at <a href=\"" + tweet.tweetUrl + "\" target=\"_blank\">" + tweet.date + "</a>\n      </small>\n    </p>\n  </div>\n</div>";
    };

    addTweet = function(t) {
      var target;
      target = $(createTweetBlock(t));
      $("#tweet-list").append(target);
      target.fadeIn(fadeTime);
      return this;
    };

    addMoreLink = function() {
      $("#more").fadeIn(fadeTime);
      return this;
    };

    clear = function() {
      timer.stop();
      $("#tweet-list").empty();
      $("#more").hide();
      return this;
    };

    reset = function() {
      clear();
      searcher.reset();
      return this;
    };

    rollback = function() {
      clear();
      searcher.rollback();
      return this;
    };

    search = function() {
      searcher.search(addNext);
      return this;
    };

    $(function() {
      $("#reload").click((function() {
        reset();
        search();
        return false;
      }));
      $('#about').modal({
        show: false
      });
      $('#more').hide();
      $("#more").click(function() {
        $("#more").hide();
        search();
        return false;
      });
      $('#change-lv').button();
      $('#change-lv > button').click(function(e) {
        var target;
        target = $(e.target);
        viewLevel = parseInt(target.attr('data-shoborn-lv'));
        $('#change-lv > button').removeClass('btn-primary');
        target.addClass('btn-primary');
        target.button('toggle');
        rollback();
        timer.start(addNext);
        return false;
      });
      $('#pause').click(function() {
        var target;
        target = $('#pause');
        if (paused) {
          paused = false;
          timer.start(addNext);
          target.button('reset');
        } else {
          paused = true;
          timer.stop();
          target.button('restart');
        }
        target.button('toggle');
        return false;
      });
      $('#page-top').click(function() {
        $('body,html').animate({
          scrollTop: 0
        }, scrollTime);
        return false;
      });
      search();
      return this;
    });

    return View;

  })();

}).call(this);
