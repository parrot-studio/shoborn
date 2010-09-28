var SHOBORN_PARSER = function(t){
  var that = {};
  var level = 0;
  var score = 0;
  var combo = 0;

  var level3 = /[\(（]\s*[\´\']\s*[･・]\s*ω\s*[･・]\s*[\`｀]\s*[\)）]/;
  var level2a = /[\(（]\s*[\´\']\s*[･・]\s*ω\s*[･・]\s*[\`｀]?\s*[\)）]?/;
  var level2b = /[\(（]?\s*[\´\']?\s*[･・]\s*ω\s*[･・]\s*[\`｀]\s*[\)）]/;
  var level1 = /[\(（]?\s*.?\s*[･・]\s*ω\s*[･・]\s*.?\s*[\)）]?/;
  var levelca = /[･・]\s*ω\s*[･・]?/;
  var levelcb = /[･・]?\s*ω\s*[･・]/;

  that.level = function(){
    return level;
  }

  that.score = function(){
    return score;
  }

  that.combo = function(){
    return combo
  }

  var parse = function(t){
    level = parse_level(t);

    if (level > 0){
      var ret = parse_score(t);
      score = ret.score || 0;
      combo = ret.combo || 0;
    }
  }

  var parse_level = function(t){
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

  var replace_blank = function(target, parser){
    return target.replace(parser, function(t){
      var ret = "";
      var i ;
      for(i = 0; i< t.length; i+= 1){
        ret += " ";
      }
      return ret;
    });
  }

  var s_score = function(l){
    if (l === 1){
      return 5;
    } else if (l === 2){
      return 20;
    } else if (l === 3){
      return 100;
    }
    return 0;
  }

  var calc_score = function(list){
    if (list.length <= 0){
      return {};
    }

    list.sort(function(a, b){
      return a.index - b.index;
    });

    var s = 0;
    var c = 0;
    $.each(list, function(i, d){
      c += 1;
      s += s_score(d.level) * c;
    });
    if (c > 1){
      s += c * 10;
    }

    return {
      score : s,
      combo : c
    };
  }

  var parse_and_replace = function(target, parser){
    var ret = null;
    if (parser.exec(target)){
      var ind = RegExp.leftContext.length;
      var next = replace_blank(target, parser);
      ret = {
        index : ind,
        target : next
      };
    }
    return ret;
  }

  var parse_score = function(t){
    if (level <= 0){
      return 0;
    }

    var target = t;
    var buf = [];
    var rsl;

    if (level >= 3){
      while(true){
        rsl = parse_and_replace(target, level3);
        if (rsl){
          target = rsl.target;
          buf.push({
            index : rsl.index,
            level : 3
          });
        } else {
          break;
        }
      }
    }

    if (level >= 2){
      while(true){
        rsl = parse_and_replace(target, level2a);
        if (rsl){
          target = rsl.target;
          buf.push({
            index : rsl.index,
            level : 2
          });
        }

        if (rsl === null){
          rsl = parse_and_replace(target, level2b);
          if (rsl){
            target = rsl.target;
            buf.push({
              index : rsl.index,
              level : 2
            });
          }
        }

        if (rsl === null){
          break;
        }
      }
    }

    while(true){
      rsl = parse_and_replace(target, level1);
      if (rsl){
        target = rsl.target;
        buf.push({
          index : rsl.index,
          level : 1
        });
      } else {
        break;
      }
    }

    while(true){
      rsl = parse_and_replace(target, levelca);
      if (rsl){
        target = rsl.target;
        buf.push({
          index : rsl.index,
          level : 0
        });
      }

      if (rsl === null){
        rsl = parse_and_replace(target, levelcb);
        if (rsl){
          target = rsl.target;
          buf.push({
            index : rsl.index,
            level : 0
          });
        }
      }

      if (rsl === null){
        break;
      }
    }

    return calc_score(buf);
  }

  parse(t);

  return that;
}
