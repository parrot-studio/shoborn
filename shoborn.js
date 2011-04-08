var SHOBORN = function(){
  var that = {};

  var search_url = "http://yats-data.com/yats/search";
  var search_param = {
    query : "(´･ω･`)",
    page : 1,
    fast : ""
  };

  var result = [];
  var index = 0;
  var page_index = 1;
  var view_level = 1;

  var api_search = function(func){
    $.ajax({
      url : search_url,
      cache : false,
      data : search_param,
      dataType : "jsonp",
      jsonp : "json",
      success : func
    });
  };

  var tweet = function(t){
    var that = {};
    var raw = t || {};

    var get = function(name){
      return raw[name] ? raw[name] : "";
    }

    var data = SHOBORN_PARSER(get("content"));

    that.id = function(){
      return get("id");
    }

    that.user = function(){
      return get("user");
    }

    that.text = function(){
      return get("content");
    }

    that.img_url = function(){
      return get("image");
    }

    that.date = function(){
      return get("time");
    }

    that.level = function(){
      return data.level();
    }

    that.score = function(){
      return data.score();
    }

    that.combo = function(){
      return data.combo();
    }

    return that;
  }

  var parse_tweet = function(data){
    $.each(data, function(i, d){
      result.push(tweet(d));
    });
  }

  that.search = function(func){
    search_param.page = page_index;
    api_search(function(data){
      parse_tweet(data);
      page_index += 1;
      func();
    });
  }

  that.shoborn_test = function(name, func){
    search_param.page = page_index;
    $.getJSON("./" + name, {}, function(data){
      parse_tweet(data.results);
      page_index += 1
      func();
    });
  }

  that.results = function(){
    var ret = [];
    $.each(result, function(i, r){
      if (r.level() >= view_level){
        ret.push(r);
      }
    });
    return ret;
  }

  that.set_level = function(l){
    view_level = l;
  }

  that.result_first = function(){
    index = 0;
  }

  that.result_next = function(){
    var ret = null;

    while(index < result.length){
      var r = result[index];
      index += 1;
      if (r.level() >= view_level){
        ret = r
        break;
      }
    }

    return ret;
  }

  that.result_clear = function(){
    result = [];
    index = 0;
    page_index = 1;
  }

  that.view_level = function(){
    return view_level;
  }

  return that;
}();
