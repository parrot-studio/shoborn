(function() {
  var Timer, Tweet, TweetSearcher, View;

  Tweet = (function() {
    var format_date, level1, level2a, level2b, level3, levelca, levelcb, parse_level, zero_padding;

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
      this.user_name = (_ref3 = tweet.from_user_name) != null ? _ref3 : '';
      this.text = (_ref4 = tweet.text) != null ? _ref4 : '';
      this.img_url = (_ref5 = tweet.profile_image_url) != null ? _ref5 : '';
      this.date = format_date(tweet.created_at);
      this.level = parse_level(this.text);
      this.user_url = "https://twitter.com/#!/" + this.user;
      this.tweet_url = "https://twitter.com/#!/" + this.user + "/status/" + this.id;
    }

    parse_level = function(t) {
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

    format_date = function(ds) {
      var d;
      if (!ds) return '';
      d = new Date(ds);
      return "" + (d.getFullYear()) + "/" + (zero_padding(d.getMonth() + 1)) + "/" + (zero_padding(d.getDate())) + " " + (zero_padding(d.getHours())) + ":" + (zero_padding(d.getMinutes())) + ":" + (zero_padding(d.getSeconds()));
    };

    zero_padding = function(n) {
      n = n.toString();
      if (n.length !== 1) return n;
      return "0" + n;
    };

    return Tweet;

  })();

  TweetSearcher = (function() {
    var index, max_id, page_index, page_size, parse_tweet, result, search_url, twitter_seaech;

    function TweetSearcher() {}

    search_url = "http://search.twitter.com/search.json";

    result = [];

    index = 0;

    page_index = 1;

    page_size = 100;

    max_id = null;

    twitter_seaech = function(params, func) {
      var p;
      p = {
        url: search_url,
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

    parse_tweet = function(data) {
      var d, _i, _len, _ref, _ref2;
      _ref = data.results;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        d = _ref[_i];
        result.push(new Tweet(d));
      }
      if (max_id === null) {
        max_id = (_ref2 = data.results[0]) != null ? _ref2.id_str : void 0;
      }
      page_index += 1;
      return this;
    };

    TweetSearcher.prototype.search = function(func) {
      var p;
      p = {
        q: "(´･ω･`) -RT",
        lang: 'ja',
        page: page_index,
        rpp: page_size
      };
      if (max_id !== null) p.max_id = max_id;
      twitter_seaech(p, (function(data) {
        return func(parse_tweet(data));
      }));
      return this;
    };

    TweetSearcher.prototype.next_for = function(level) {
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
      page_index = 1;
      max_id = null;
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
    var add_more_link, add_next, add_tweet, clear, create_tweet_block, fade_time, paused, replace_user_link, reset, rollback, roop_time, search, searcher, timer, user_parser, view_level, view_lv;

    function View() {}

    user_parser = /@([a-zA-Z0-9_]+)/g;

    fade_time = 200;

    roop_time = 500;

    view_level = 1;

    paused = false;

    timer = new Timer(roop_time);

    searcher = new TweetSearcher;

    add_next = function() {
      var t;
      timer.stop();
      if (paused) return this;
      t = searcher.next_for(view_level);
      if (t === null) {
        add_more_link();
      } else {
        add_tweet(t);
        timer.start(add_next);
      }
      return this;
    };

    replace_user_link = function(tx) {
      return tx.replace(user_parser, function(auser, uid) {
        return "<a href='https://twitter.com/#!/" + uid + "' target='_blank'>@" + uid + "</a>";
      });
    };

    view_lv = function(lv) {
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

    create_tweet_block = function(tweet) {
      return "<div class=\"tweet-block span8\">\n  <div class=\"tweet-user-img\">\n    <img src=\"" + tweet.img_url + "\" />\n  </div>\n  <div class=\"tweet-body lv" + tweet.level + "\">\n    <p>\n      " + (replace_user_link(tweet.text)) + "<br/>\n      <small>\n        Lv:" + (view_lv(tweet.level)) + "\n        by <a href=\"" + tweet.user_url + "\" target=\"_blank\">" + tweet.user + " / " + tweet.user_name + "</a>\n        at <a href=\"" + tweet.tweet_url + "\" target=\"_blank\">" + tweet.date + "</a>\n      </small>\n    </p>\n  </div>\n</div>";
    };

    add_tweet = function(t) {
      var target;
      target = $(create_tweet_block(t));
      $("#tweet_list").append(target);
      target.fadeIn(fade_time);
      return this;
    };

    add_more_link = function() {
      $("#more").fadeIn(fade_time);
      return this;
    };

    clear = function() {
      timer.stop();
      $("#tweet_list").empty();
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
      searcher.search(add_next);
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
        view_level = parseInt(target.attr('data-shoborn-lv'));
        $('#change-lv > button').removeClass('btn-primary');
        target.addClass('btn-primary');
        target.button('toggle');
        rollback();
        timer.start(add_next);
        return false;
      });
      $('#pause').click(function(e) {
        var target;
        target = $(e.target);
        if (paused) {
          paused = false;
          timer.start(add_next);
          target.button('reset');
        } else {
          paused = true;
          timer.stop();
          target.button('restart');
        }
        target.button('toggle');
        return false;
      });
      $('#page-top').click(function(e) {
        $('body,html').animate({
          scrollTop: 0
        }, 600);
        return false;
      });
      search();
      return this;
    });

    return View;

  })();

}).call(this);
