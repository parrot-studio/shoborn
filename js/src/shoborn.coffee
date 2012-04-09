class Tweet
  level3 = /[\(（]\s*[\´\']\s*[･・]\s*ω\s*[･・]\s*[\`｀]\s*[\)）]/;
  level2a = /[\(（]\s*[\´\']\s*[･・]\s*ω\s*[･・]\s*[\`｀]?\s*[\)）]?/;
  level2b = /[\(（]?\s*[\´\']?\s*[･・]\s*ω\s*[･・]\s*[\`｀]\s*[\)）]/;
  level1 = /[\(（]?\s*.?\s*[･・]\s*ω\s*[･・]\s*.?\s*[\)）]?/;
  levelca = /[･・]\s*ω\s*[･・]?/;
  levelcb = /[･・]?\s*ω\s*[･・]/;

  constructor: (tweet) ->
    @id = tweet.id_str ? ''
    @user = tweet.from_user ? ''
    @user_name = tweet.from_user_name ? ''
    @text = tweet.text ? ''
    @img_url = tweet.profile_image_url ? ''
    @date = format_date tweet.created_at
    @level = parse_level @text
    @user_url = "https://twitter.com/#!/#{@user}"
    @tweet_url = "https://twitter.com/#!/#{@user}/status/#{@id}"

  parse_level = (t) ->
    return 0 unless t?
    if level3.test t
      return 3
    else if level2a.test t
      return 2
    else if level2b.test t
      return 2
    else if level1.test t
      return 1
    0

  format_date = (ds) ->
    return '' unless ds
    d = new Date ds
    "#{d.getFullYear()}/#{zero_padding d.getMonth() + 1}/#{zero_padding d.getDate()} #{zero_padding d.getHours()}:#{zero_padding d.getMinutes()}:#{zero_padding d.getSeconds()}"

  zero_padding = (n) ->
    n = n.toString()
    return n unless n.length == 1
    "0#{n}"

class TweetSearcher
  search_url = "http://search.twitter.com/search.json"

  result = []
  index = 0
  page_index = 1
  page_size = 100
  max_id = null

  twitter_seaech = (params, func) ->
    p =
      url : search_url,
      cache: false,
      data : params,
      dataType : "jsonp",
      success : ((data)-> func data)
    $.ajax p
    @

  parse_tweet = (data) ->
    for d in data.results
      result.push new Tweet(d)
    max_id = data.results[0]?.id_str if max_id == null
    page_index += 1
    @

  search: (func) ->
    p =
      q: "(´･ω･`) -RT",
      lang: 'ja'
      page: page_index,
      rpp: page_size
    p.max_id = max_id unless max_id == null
    twitter_seaech p, ((data) -> func parse_tweet data)
    @

  next_for: (level) ->
    l = (level || 1)
    while index < result.length
      r = result[index]
      index += 1
      if r.level >= l
        ret = r
        break
    ret ? null

  reset: ->
    result = []
    index = 0
    page_index = 1
    max_id = null
    @

  rollback: -> index = 0

class Timer

  timer = null
  func = null
  cycle = 1000

  constructor: (c) ->
    cycle = c

  start: (func) ->
    timer = setTimeout (-> func()), cycle
    @

  stop: ->
    clearTimeout timer if timer
    timer = null
    @

class View
  user_parser = /@([a-zA-Z0-9_]+)/g
  fade_time = 200
  roop_time = 500
  view_level = 1
  paused = false

  timer = new Timer roop_time
  searcher = new TweetSearcher

  add_next = ->
    timer.stop()
    return @ if paused
    t = searcher.next_for view_level
    if t == null
      add_more_link()
    else
      add_tweet t
      timer.start add_next
    @

  replace_user_link = (tx) ->
    tx.replace user_parser, (auser, uid) ->
      "<a href='https://twitter.com/#!/#{uid}' target='_blank'>@#{uid}</a>"

  view_lv = (lv) ->
    switch lv
      when 0
        '(･ω･)'
      when 1
        '(´･ω･`)'
      when 2
        '(´･ω･`)ω･`)'
      when 3
        '(´･ω･`)ω･`)ω･`)'
      else
        ''

  create_tweet_block = (tweet) ->
    """
<div class="tweet-block span8">
  <div class="tweet-user-img">
    <img src="#{tweet.img_url}" />
  </div>
  <div class="tweet-body lv#{tweet.level}">
    <p>
      #{replace_user_link tweet.text}<br/>
      <small>
        Lv:#{view_lv tweet.level}
        by <a href="#{tweet.user_url}" target="_blank">#{tweet.user} / #{tweet.user_name}</a>
        at <a href="#{tweet.tweet_url}" target="_blank">#{tweet.date}</a>
      </small>
    </p>
  </div>
</div>
    """

  add_tweet = (t) ->
    target = $(create_tweet_block t)
    $("#tweet_list").append target
    target.fadeIn fade_time
    @

  add_more_link = ->
    $("#more").fadeIn fade_time
    @

  clear = ->
    timer.stop()
    $("#tweet_list").empty()
    $("#more").hide()
    @

  reset = ->
    clear()
    searcher.reset()
    @

  rollback = ->
    clear()
    searcher.rollback()
    @

  search = ->
    searcher.search add_next
    @

  $ ->
    $("#reload").click (-> reset(); search(); false)
    $('#about').modal(show : false)
    $('#more').hide()

    $("#more").click ->
      $("#more").hide()
      search()
      false

    $('#change-lv').button()
    $('#change-lv > button').click (e) ->
      target = $(e.target)
      view_level = parseInt target.attr 'data-shoborn-lv'
      $('#change-lv > button').removeClass 'btn-primary'
      target.addClass 'btn-primary'
      target.button 'toggle'
      rollback()
      timer.start add_next
      false

    $('#pause').click (e) ->
      target = $(e.target)
      if paused
        paused = false
        timer.start add_next
        target.button 'reset'
      else
        paused = true
        timer.stop()
        target.button 'restart'
      target.button 'toggle'
      false

    $('#page-top').click (e) ->
      $('body,html').animate {scrollTop: 0}, 600
      false

    search()
    @
