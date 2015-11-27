'use strict'

angular.module('module.tac.keyboard')

.controller('tac.keyboard.qwerty', [
  '$scope'
  '$modalInstance'
  'tac.keys'
  'tac.navigable.root'
  'tac.navigable.component'
  'tac.keyboard.qwerty.symbols'
  'tac.keyboard.content'
  'container'
  ($scope, $modalInstance, control, root_component, component, symbols, content, container) ->
    
    $scope.assets = container.assets
    
    keys = 
      real_alt:           false
      real_acute:         false
      real_shift:         false
      real_caps_lock:     false
      virtual_shift:      false
      virtual_caps_lock:  false
      last_virtual_shift: 0
      relapse_delay: 800
      sanitize: ->
        #xor
        if (if @real_caps_lock then not @virtual_caps_lock else @virtual_caps_lock)
          $scope.has_shift = $scope.caps_lock =  true
        else
          $scope.has_shift = $scope.caps_lock = @virtual_caps_lock = @real_caps_lock = false
        if @virtual_shift or @real_shift
          $scope.has_shift = !$scope.has_shift
        @real_acute = false
        
    content.process container
    
    modal_root = root_component('modal-keyboard-root')
    
    $modalInstance.result.finally ->
      control.unsubscribe modal_root
    
    control.subscribe modal_root
    
    $scope.navigable = component.vertical('modal-keyboard-main')
      .set_priority(2)
      .bind_to $scope, true
      
    $scope.navigable.handlers.go_back = (code, owner)->
      $modalInstance.dismiss()
      true  
      
    $scope.navigable.handlers.unknow = (code, owner)->
      if keys.real_shift
        symbol = symbols.special.shift[code.value]
      else
        symbol = symbols.special[code.value]
      symbol and append_character symbol
      $scope.$apply()
      
    $scope.navigable.handlers.letter = (code, owner)->
      append_letter code.letter
      $scope.$apply()
      
    $scope.navigable.handlers.number = (code, owner)->
      if keys.real_alt
        (symbol = symbols.alt[code.number]) and
        append_character symbol
      else if keys.real_shift
        (symbol = symbols.shift[code.number]) and
        append_character symbol
      else
        append_character code.number
      $scope.$apply()
      
    $scope.navigable.handlers.space_bar = (code, owner)->
      append_letter ' '
      $scope.$apply()
      
    $scope.navigable.handlers.alt_gr = (code, owner)->
      keys.real_alt = !code.disable
      
    $scope.navigable.handlers.acute = (code, owner)->
      keys.real_acute = true
      
    $scope.navigable.handlers['delete'] = (code, owner)->
      container.content.remove_one()
      $scope.$apply()
      
    $scope.navigable.handlers.shift = (code, owner)->
      keys.real_shift = !code.disable
      keys.virtual_shift = false
      keys.sanitize()
      $scope.$apply()
      
    $scope.navigable.handlers.caps_lock = (code, owner)->
      keys.real_caps_lock = not keys.real_caps_lock
      keys.sanitize()
      $scope.$apply()
      
    $scope.container = container
    
    $scope.set_active = (algo)->
      console.log algo
    
    append_character = (character)->
      container.content.write character
      $scope.has_simbol = false
      if keys.virtual_shift
        keys.virtual_shift = false
      keys.sanitize()
      
    append_letter = (letter)->
      if keys.real_acute
        letter = symbols.acute[letter] or letter
      append_character if $scope.has_shift then letter.toUpperCase() else letter
    
    $scope.tap_alphabetic = (button)->
      append_letter button.content
      
    $scope.tap_special = (button)->
      if $scope.has_simbol
        append_character button.special
      else
        append_character button.content
      
    $scope.tap_space = -> append_character ' '
    
    $scope.shift = ->
      previous_virtual_shift = keys.last_virtual_shift
      keys.last_virtual_shift = (new Date).getTime()
      if keys.last_virtual_shift - previous_virtual_shift < keys.relapse_delay
        #double shift
        keys.virtual_caps_lock = !keys.virtual_caps_lock
        keys.virtual_shift = false
      else
        keys.virtual_shift = not keys.virtual_shift
      keys.sanitize()
        
    $scope.simbol = ->
      if $scope.has_simbol
        $scope.has_simbol = false 
      else
        $scope.has_simbol = true 
      
    modal_root.add $scope.navigable
    
    $scope.resume = ->
      $modalInstance.dismiss()

    $scope.confirm = ->
      $modalInstance.close()
])

.controller('tac.keyboard.qwerty.letters', [
  '$scope'
  'tac.navigable.component'
  'tac.keyboard.qwerty.buttons'
  ($scope, component, buttons) ->
    
    $scope.navigable = component.multiline('modal-letters-frame', 10)
      .set_priority(1)
      .bind_to $scope
      
    $scope.buttons = buttons
    
])

.controller('tac.keyboard.qwerty.input', [
  '$scope'
  'tac.navigable.component'
  ($scope, component) ->
    
    $scope.navigable.handlers.left = ->
      handle = $scope.container.content.left()
      if handle then $scope.$apply()
      handle
    $scope.navigable.handlers.right = ->
      handle = $scope.container.content.right()
      if handle then $scope.$apply()
      handle
])

.constant('tac.keyboard.qwerty.symbols',
  acute:
    'a':'á'
    'e':'é'
    'i':'í'
    'o':'ó'
    'u':'ú'
  alt: 
    2:'@'
  shift: 
    1:'!'
    3:'#'
    4:'$'
    8:'('
    9:')'
  special:
    188: ','
    189: '-'
    190: '.'
    192: 'ñ'
    shift:
      188: ';'
      189: '_'
      190: ':'
      192: 'Ñ'

)

.factory('tac.keyboard.qwerty.buttons', [
  'tac.keyboard.qwerty.symbols'
  (symbols) ->
    
    ALPHABETIC = 'alphabetic'
    SPECIAL    = 'special'
    SIMPLE     = 'simple'
    
    special    = '!"@$%&*()='
    alphabetic = 'qwertyuiopasdfghjklñzxcvbnm' 
    simple     = ',.?'
    simple_s   = ';:¿'
    
    buttons = []
    
    map_and_push = (text,fn)-> 
      for index in [0..(text.length-1)]
        character = text.charAt index
        button = fn(character, index)
        buttons.push button
    
    map_and_push special, (character, index)->
      content: String(index)
      template: SPECIAL
      special: character
      
    map_and_push alphabetic, (character, index)->
      content: character
      template: ALPHABETIC
      special: symbols.acute[character] || character
      
    map_and_push simple, (character, index)->
      content: character
      template: SIMPLE
      special: simple_s.charAt index
    
    buttons
])







