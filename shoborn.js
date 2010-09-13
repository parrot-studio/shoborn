var SHOBORN = function(){
  var that = {};

  var search_param = {
    q : "\uff65\u03c9\u30FB",
    rpp : 100,
    page : 1,
    locale : "ja",
    show_user : true
  };

  var result = [];
  var index = 0;
  var page_index = 1;
  var view_level = 1;

  var level3 = /[\(（]\s*[\´\']\s*[･・]\s*ω\s*[･・]\s*[\`｀]\s*[\)）]/;
  var level2a = /[\(（]\s*[\´\']\s*[･・]\s*ω\s*[･・]\s*[\`｀]?\s*[\)）]?/;
  var level2b = /[\(（]?\s*[\´\']?\s*[･・]\s*ω\s*[･・]\s*[\`｀]\s*[\)）]/;
  var level1 = /[\(（]?\s*.?\s*[･・]\s*ω\s*[･・]\s*.?\s*[\)）]?/;

  var level_judge = function(t){
    if (t === ""){
      return 0;
    }

    if (level3.test(t)){
      return 3;
    } else if(level2a.test(t)){
      return 2;
    } else if(level2b.test(t)){
      return 2;
    } else if(level1.test(t)){
      return 1;
    }

    return 0;
  }

  var tweet = function(t){
    var that = {};
    var raw = t || {};

    var get = function(name){
      return raw[name] ? raw[name] : "";
    }

    that.id = function(){
      return get("id");
    }

    that.user = function(){
      return get("from_user");
    }

    that.text = function(){
      return get("text");
    }

    that.img_url = function(){
      return get("profile_image_url");
    }

    that.date = function(){
      var d = get("created_at");
      if (d === ""){
        return ""
      }
      return new Date(d).toLocaleString();
    }

    that.level = function(){
      return level_judge(get("text"));
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
    $.getJSON("http://search.twitter.com/search.json?callback=?", search_param, function(data){
      parse_tweet(data.results);
      page_index += 1
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
