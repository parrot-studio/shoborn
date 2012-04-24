class Tweet
  level3 = /[\(（]\s*[\´\']\s*[･・]\s*ω\s*[･・]\s*[\`｀]\s*[\)）]/
  level2a = /[\(（]\s*[\´\']\s*[･・]\s*ω\s*[･・]\s*[\`｀]?\s*[\)）]?/
  level2b = /[\(（]?\s*[\´\']?\s*[･・]\s*ω\s*[･・]\s*[\`｀]\s*[\)）]/
  level1 = /[\(（]?\s*.?\s*[･・]\s*ω\s*[･・]\s*.?\s*[\)）]?/
  levelca = /[･・]\s*ω\s*[･・]?/
  levelcb = /[･・]?\s*ω\s*[･・]/

  constructor: (tweet) ->
    @id = tweet.id_str ? ''
    @user = tweet.from_user ? ''
    @userName = tweet.from_user_name ? ''
    @text = tweet.text ? ''
    @imgUrl = tweet.profile_image_url ? ''
    @date = formatDate tweet.created_at
    @level = parseLevel @text
    @userUrl = "https://twitter.com/#!/#{@user}"
    @tweetUrl = "https://twitter.com/#!/#{@user}/status/#{@id}"

  parseLevel = (t) ->
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

  formatDate = (ds) ->
    return '' unless ds
    d = new Date ds
    "#{d.getFullYear()}/#{zeroPadding d.getMonth() + 1}/#{zeroPadding d.getDate()} #{zeroPadding d.getHours()}:#{zeroPadding d.getMinutes()}:#{zeroPadding d.getSeconds()}"

  zeroPadding = (n) ->
    n = n.toString()
    return n unless n.length == 1
    "0#{n}"

class TweetSearcher
  searchUrl = "http://search.twitter.com/search.json"

  result = []
  index = 0
  pageSize = 100
  nextId = null

  twitterSeaech = (params, func) ->
    p =
      url : searchUrl
      cache: false
      data : params
      dataType : "jsonp"
      success : ((data)-> func data)
    $.ajax p
    @

  parseTweet = (data) ->
    for d in data.results
      result.push new Tweet(d)
      nextId = d.id
    @

  search: (func) ->
    p =
      q: "(´･ω･`) -RT"
      lang: 'ja'
      rpp: pageSize
    p.max_id = nextId unless nextId == null
    twitterSeaech p, ((data) -> func parseTweet data)
    @

  nextFor: (level) ->
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
    nextId = null
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
  userParser = /@([a-zA-Z0-9_]+)/g
  fadeTime = 200
  roopTime = 500
  scrollTime = 600
  viewLevel = 1
  paused = false

  timer = new Timer roopTime
  searcher = new TweetSearcher

  addNext = ->
    timer.stop()
    return @ if paused
    t = searcher.nextFor viewLevel
    if t == null
      addMoreLink()
    else
      addTweet t
      timer.start addNext
    @

  replaceUserLink = (tx) ->
    tx.replace userParser, (auser, uid) ->
      "<a href='https://twitter.com/#!/#{uid}' target='_blank'>@#{uid}</a>"

  viewLv = (lv) ->
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

  createTweetBlock = (tweet) ->
    """
<div class="tweet-block span8">
  <div class="tweet-user-img">
    <img src="#{tweet.imgUrl}" />
  </div>
  <div class="tweet-body lv#{tweet.level}">
    <p>
      #{replaceUserLink tweet.text}<br/>
      <small>
        Lv:#{viewLv tweet.level}
        by <a href="#{tweet.userUrl}" target="_blank">#{tweet.user} / #{tweet.userName}</a>
        at <a href="#{tweet.tweetUrl}" target="_blank">#{tweet.date}</a>
      </small>
    </p>
  </div>
</div>
    """

  addTweet = (t) ->
    target = $(createTweetBlock t)
    $("#tweet-list").append target
    target.fadeIn fadeTime
    @

  addMoreLink = ->
    $("#more").fadeIn fadeTime
    @

  clear = ->
    timer.stop()
    $("#tweet-list").empty()
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
    searcher.search addNext
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
      viewLevel = parseInt target.attr 'data-shoborn-lv'
      $('#change-lv > button').removeClass 'btn-primary'
      target.addClass 'btn-primary'
      target.button 'toggle'
      rollback()
      timer.start addNext
      false

    $('#pause').click ->
      target = $('#pause')
      if paused
        paused = false
        timer.start addNext
        target.button 'reset'
      else
        paused = true
        timer.stop()
        target.button 'restart'
      target.button 'toggle'
      false

    $('#page-top').click ->
      $('body,html').animate {scrollTop: 0}, scrollTime
      false

    search()
    @
