var VIEW = function(){
  var that = {};
  var timer = null;
  var roop_time = 1200;
  var fade_time = 500;
  var user_parser = /@([a-zA-Z0-9_]+)/g;

  var stop_timer = function(){
    if (timer !== null){
      clearTimeout(timer);
    }
    timer = null;
  }

  var view = function(){
    var t = SHOBORN.result_next();
    if (t === null){
      stop_timer();
      $("#more").fadeIn(fade_time);
      return;
    }

    $("#list").append(tweet_block(t));
    var target = $("#tw" + t.id());
    target.addClass(function(){
      return "lv" + t.level();
    });
    target.fadeIn(500);

    timer = setTimeout(function() {
      view();
    }, roop_time);
  }

  var tweet_block = function(t){
    var b = "";
    b += "<div class='tweet_block' id='tw" + t.id() + "'>";

    b += "<div class='tweet_left'>";
    b += "<div class='tweet_lv'>Lv:" + t.level() + "</div>";
    b += "<div class='tweet_img'>";
    b += "<img class='tweet_icon' src='" + t.img_url() + "'/>";
    b += "</div>";
    b += "</div>";

    b += "<div class='tweet_body'>";
    b += "<div class='tweet_user'> From : " + user_link(t.user()) + "</div>";
    b += "<div class='tweet_text'>" + replace_user_link(t.text()) + "</div>";
    b += "<div class='tweet_date'>";
    b += "<a href='http://twitter.com/" + t.user() + "/status/" + t.id() + "'>";
    b += t.date() + "</a>"
    b  += "</div>";
    b += "</div>";

    b += "</div>";

    return b;
  }

  var user_link = function(u, h){
    h = h || "";
    return "<a href='http://twitter.com/" + u + "' target='_blank'>" + h + u + "</a>";
  }

  var replace_user_link = function(t){
    return t.replace(user_parser, function(c, name){
      return user_link(name, '@');
    });
  }

  that.clear = function(){
    stop_timer();
    $("#list").empty();
    $("#more").hide();
  }

  that.change_level = function(lv){
    SHOBORN.set_level(lv);
    SHOBORN.result_first();
    that.clear();
    view();
  }

  that.reset = function(){
    that.clear();
    SHOBORN.result_clear();
  }

  that.search = function(){
    $("#more").hide();
    SHOBORN.search(function(){
      view();
    });
  }

  that.search_test = function(){
    $("#more").hide();
    SHOBORN.shoborn_test('data1.json', function(){
      view();
    });
  }

  that.view_level = function(){
    return SHOBORN.view_level();
  }

  return that;
}();





