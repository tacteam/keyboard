'use strict'

angular.module('module.tac.keyboard')

.controller('tac.keyboard.t9', [
  '$scope'
  '$modalInstance'
  '$timeout'
  'tac.keys'
  'tac.keyboard.content'
  'tac.keyboard.t9.buttons'
  'tac.keyboard.t9.options'
  'container'
  ($scope, $modalInstance, $timeout, keys, content, buttons, options, container) ->
    
    $scope.assets = container.assets
    content.process container
    
    relapse_delay = 800
    delay_bar = -> $('#delay-bar')
      
    $scope.buttons = buttons
    $scope.options = options
    $scope.back_btn = {}
    $scope.menu_btn = {}
    
    $scope.mode = mode = {}
    
    last_action = 
      time: (new Date).getTime()
      button: false
      
    animate_delay = ()->
      delay_bar().width('100%')
      animate_delay.animate = true
      delay_bar().animate
        width: "0%"
      , relapse_delay
      
    animate_delay.stop = ->
      if animate_delay.animate
        delay_bar().stop()
        delay_bar().width('0%')
        animate_delay.animate = false
    
    log_action = (button)->
      last_action.time = (new Date).getTime()
      last_action.button = button
      
    relapse = (button)->
      last_action.button is button and
      (new Date).getTime() - last_action.time < relapse_delay
      
    get_by_key = (key)->
      str_key = String(key)
      for button in buttons
        if button.key is str_key
          return button
      console.log 'sin boton para ' + key
    
    animate = (button)->
      button.klass = 'pressed'
      $scope.$apply()
      $timeout ->
          button.klass = ''
          $scope.$apply()
        ,200
    
    controller = 
      handlers:
        right:-> container.content.right();$scope.$apply()
        left:-> container.content.left();$scope.$apply()
        menu:-> 
          controller.to_menu_mode()
          animate $scope.menu_btn
        anterior: (action)->
          animate get_by_key(action.key)
          container.content.remove_one()
        go_back: (action)->
          controller.prev()
          animate $scope.back_btn
        enter: (action)->
          $modalInstance.close()
          
      handle_button:(number)->
        button = get_by_key(number)
        if relapse button
          button.times += 1
          controller.current.relapse button
        else 
          controller.current.once button
          button.times = 0
        animate button
        log_action button
      
      zero: ->
        button = get_by_key(0)
        if @current.mode is 'numbers' then write '0' else write ' '
        animate button
        true
        
      one: ->
        animate get_by_key(1)
        @next()
          
      handle: (action) ->
        animate_delay.stop()
        if action.is_number
          mode.menu and @menu.handle(action.number) or
          action.number is 0 and @zero() or
          action.number is 1 and @one() or 
          @handle_button action.number
        else
          handler = @handlers[action.key]
          handler and handler(action)
          
      next:->
        if (@current_index + 1) < @states.length
          @set_state(@current_index + 1)
          return true
        return false
        
      prev:->
        if @current is @menu
          @set_state(@current_index)
        else
          if @current_index > 0
            @set_state(@current_index - 1)
          else
            $modalInstance.close()
        true
      
      set_state: (index)->
        mode[@current.mode] = false;
        @current_index = index
        @current = @states[@current_index]
        mode[@current.mode] = true;
        
      initialize:->
        @current_index = 0
        @current = @states[@current_index]
        mode[@current.mode] = true;
      
      menu:
        mode:'menu'
        handle: (number)->
          switch number
            when 1 then container.to_qwerty()
            when 2 then container.content.erase(); controller.prev(); $scope.$apply()
            when 3 then $modalInstance.dismiss()
          true
      
      to_menu_mode: ->
        mode[@current.mode] = false;
        @current = @menu
        mode[@current.mode] = true;
          
      states:[
          mode:'letters'
          once:(button)-> 
            container.content.write button.letters.charAt(0)
            animate_delay()
          relapse:(button)-> 
            position = button.times % button.letters.length
            container.content.rewrite button.letters.charAt(position)
            animate_delay()
        ,
          mode:'mayusc'
          once:(button)-> 
            container.content.write button.mayusc.charAt(0)
            animate_delay()
          relapse:(button)-> 
            position = button.times % button.mayusc.length
            container.content.rewrite button.mayusc.charAt(position)
            animate_delay()
        ,
          mode:'symbol'
          once:(button)-> 
            container.content.write button.symbol.charAt(0)
            animate_delay()
          relapse:(button)-> 
            position = button.times % button.symbol.length
            container.content.rewrite button.symbol.charAt(position)
            animate_delay()
        ,
          mode:'numbers'
          once:(button)-> 
            container.content.write button.number
          relapse:(button)-> 
            @once button
        ]
        
    controller.handlers['delete'] = 
    controller.handlers.letter =
    controller.handlers.alt_gr =
    controller.handlers.shift = 
      (code, owner)->
        container.to_qwerty()
    
    
    controller.initialize()
    container.content.sanitize()
    
    $modalInstance.result.finally ->
      keys.unsubscribe controller
    
    keys.subscribe controller
      
    $scope.container = container
    $scope.controller = controller
    
    
])

.factory('tac.keyboard.t9.buttons', [
  () ->
    make = (key, number, letters, mayusc, symbol)->
      key:     key
      number:  number  || ''
      letters: letters || ''
      mayusc:  mayusc  || ''
      symbol:  symbol  || ''
      
    [
        make '1', '1'
      ,
        make '2', '2', 'abc',  'ABC',  '.:$'
      ,
        make '3', '3', 'def',  'DEF',  ',;('
      ,
        make '4', '4', 'ghi',  'GHI',  '@*['
      ,
        make '5', '5', 'jkl',  'JKL',  '-+{'
      ,
        make '6', '6', 'mnño', 'MNÑO', '?¿)'
      ,
        make '7', '7', 'pqrs', 'PQRS', '!¡]'
      ,
        make '8', '8', 'tuv',  'TUV',  '/=}'
      ,
        make '9', '9', 'wxyz', 'WXYZ', '#_&'
      ,
        make 'epg'
      ,
        make '0', '0', '_', '_', '_'
      ,
        key:   'anterior'
        name:  '<[X]'
        svg:   'backspace'
    ]
])

.factory('tac.keyboard.t9.options', [
  () ->
    [
        key: '1'
        description: 'Cambiar a teclado querty'
      ,
        key: '2'
        description: 'Borrar texto'
      ,
        key: '3'
        description: 'Cancelar edicion'
    ]
])