'use strict'

angular.module('module.tac.keyboard')

.controller('tac.keyboard.qwerty', [
  '$scope'
  '$modalInstance'
  'tac.keys'
  'tac.navigable.root'
  'tac.navigable.extensible'
  'tac.keyboard.content'
  'container'
  ($scope, $modalInstance, control, root_component, extensible, content, container) ->
    
    $scope.assets = container.assets
    
    content.process container
    
    modal_root = root_component('modal-keyboard-root')
    
    $modalInstance.result.finally ->
      control.unsubscribe modal_root
    
    control.subscribe modal_root
    
    $scope.navigable = extensible.create_vertical('modal-keyboard-main')
      .set_priority(2)
      .bind_to $scope, true
      
    $scope.navigable.handlers.go_back = ->
      $modalInstance.dismiss()
      true  
      
    $scope.container = container
    
    append_character = (character)->
      $scope.has_shift = false
      $scope.has_simbol = false
      container.content.write character
    
    $scope.tap = (button)->
      append_character button.content
      
    $scope.tap_alphabetic = (button)->
      if $scope.has_shift
        append_character button.content.toUpperCase()
      else
        append_character button.content
      
    $scope.tap_special = (button)->
      if $scope.has_simbol
        append_character button.special
      else
        append_character button.content
      
    $scope.tap_space = -> append_character ' '
    
    $scope.shift = ->
      if $scope.has_shift
        $scope.has_shift = false 
      else
        $scope.has_shift = true 
        
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
  'tac.navigable.extensible'
  'tac.keyboard.qwerty.buttons'
  '$timeout'
  ($scope, extensible, buttons, $timeout) ->
    
    $scope.navigable = extensible.create_multiline('modal-letters-frame', 10)
      .set_priority(0)
      .bind_to $scope
      
    $scope.buttons = buttons
])

.factory('tac.keyboard.qwerty.buttons', [
  () ->
    [
      { kind: 'button.special', content: '1', special: '!' }
      { kind: 'button.special', content: '2', special: '"' }
      { kind: 'button.special', content: '3', special: '·' }
      { kind: 'button.special', content: '4', special: '$' }
      { kind: 'button.special', content: '5', special: '%' }
      { kind: 'button.special', content: '6', special: '&' }
      { kind: 'button.special', content: '7', special: '/' }
      { kind: 'button.special', content: '8', special: '(' }
      { kind: 'button.special', content: '9', special: ')' }
      { kind: 'button.special', content: '0', special: '=' }
      { kind: 'alphabetic', content: 'q'},
      { kind: 'alphabetic', content: 'w'},
      { kind: 'alphabetic', content: 'e'},
      { kind: 'alphabetic', content: 'r'},
      { kind: 'alphabetic', content: 't'},
      { kind: 'alphabetic', content: 'y'},
      { kind: 'alphabetic', content: 'u'},
      { kind: 'alphabetic', content: 'i'},
      { kind: 'alphabetic', content: 'o'},
      { kind: 'alphabetic', content: 'p'},
      { kind: 'alphabetic', content: 'a'},
      { kind: 'alphabetic', content: 's'},
      { kind: 'alphabetic', content: 'd'},
      { kind: 'alphabetic', content: 'f'},
      { kind: 'alphabetic', content: 'g'},
      { kind: 'alphabetic', content: 'h'},
      { kind: 'alphabetic', content: 'j'},
      { kind: 'alphabetic', content: 'k'},
      { kind: 'alphabetic', content: 'l'},
      { kind: 'alphabetic', content: "ñ"},
      { kind: 'alphabetic', content: 'z'},
      { kind: 'alphabetic', content: 'x'},
      { kind: 'alphabetic', content: 'c'},
      { kind: 'alphabetic', content: 'v'},
      { kind: 'alphabetic', content: 'b'},
      { kind: 'alphabetic', content: 'n'},
      { kind: 'alphabetic', content: 'm'},
      { kind: 'button', content: ','},
      { kind: 'button', content: '.'},
      { kind: 'button', content: '?'},
    ]
    
])







