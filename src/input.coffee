'use strict'

angular.module('module.tac.keyboard')

.directive('keyboardInput', [
  ()->
    
    scroll_offset = 60
    
    fix = (frame, cursor)->
      fix_cursor_position = ->
      ol = cursor[0].offsetLeft
      sW = frame[0].scrollLeft + frame[0].clientWidth
      sL = frame[0].scrollLeft
      if ol > sW - scroll_offset
        frame.scrollLeft cursor[0].offsetLeft - frame[0].clientWidth + scroll_offset
      if ol < sL + scroll_offset
        frame.scrollLeft cursor[0].offsetLeft - scroll_offset
        
    restrict: 'A'
    link: (scope, element, attrs) ->
      cursor = element.find '#cursor'
      scope.$watch ->
        fix(element, cursor)

])