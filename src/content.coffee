'use strict'

angular.module('module.tac.keyboard')

.factory('tac.keyboard.content',[
  ()->
    letters = (text)->
      result = []
      for letter, index in text
        result.push
          key:  letter
          index: index
      result
      
    set_content = (container)->  
      content = container.content = {}
      content.erase = ->
        content.before = ''
        content.after = ''
        content.sanitize()
        
      content.write = (letter)->
        content.before += letter
        content.sanitize()
          
      content.remove_one = ->
        content.before = content.before.substring(0, content.before.length-1)
        content.sanitize()
        
      content.rewrite = (letter)->
        content.before = content.before.substring(0, content.before.length-1) + letter
        content.sanitize()
          
      content.init = ()->
        content.before = container.text
        content.after = ''
        content.sanitize()
      
      content.left = ->
        if @before.length > 0
          last = @before.charAt @before.length-1
          @after = last + @after
          @before = @before.substring(0, @before.length-1)
          @sanitize()
          true
        
      content.right = ->
        if @after.length > 0
          first = @after.charAt 0
          @before += first
          @after = @after.substring(1, @after.length)
          @sanitize()
          true
          
      content.sanitize = ->
        container.text = content.before + content.after
        content.before_letters = letters content.before
        content.after_letters = letters content.after
      
    process: (container) ->
      if not container.content
        set_content container
      container.content.init()

])