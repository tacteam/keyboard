'use strict'

angular.module('module.tac.keyboard', [
  
  'angularLocalStorage'
  'module.tac.navigable'
  'module.tac.svg'
  
])

.factory('tac.keyboard',[
  '$modal'
  'tac.keys'
  'storage'
  ($modal, keys, storage) ->
    
    assets = 'assets/tac_components'
    
    storage_id = 'tac.keyboard.last'
    
    keyboards = 
      t9:
        key:         't9'
        windowClass: 't9-dialog'
        templateUrl: 't9.html'
        controller:  'tac.keyboard.t9'
      qwerty:
        key:         'qwerty'
        windowClass: 'qwerty-dialog'
        templateUrl: 'qwerty.html'
        controller:  'tac.keyboard.qwerty'
    
    last_keyboard = keyboards.qwerty
        
    do -> #safe storage checking 
      (last_keyboard_key = storage.get(storage_id)) and
      last_keyboard = keyboards[last_keyboard_key] or last_keyboard
    
    open = (keyboard, container)->
      if keyboard isnt last_keyboard
        last_keyboard = keyboard
        storage.set storage_id, keyboard.key
      modalInstance = $modal.open
        windowClass: keyboard.windowClass
        templateUrl: keyboard.templateUrl
        controller:  keyboard.controller
        resolve: container: () -> container
      container.modal = modalInstance
      modalInstance.result.then container.edition.success, container.edition.close
        
    keyboard =
      set_assets_path: (path)->
        assets = path
            
      edit : (text)->
        
        keys.create_level()
        done_callbacks=[]
        exit_callbacks=[]
        
        manager = do ->
          current = {} 
          create = ()->
            instance =
              close: ->
                if instance.cancelled then return
                keys.previous_level()
                callback() for callback in exit_callbacks
              success: ->
                if instance.cancelled then return
                keys.previous_level()
                callback(container.text) for callback in done_callbacks
                callback() for callback in exit_callbacks 
          generate:->
            current.cancelled = true
            current = create()
               
        container = 
          set_modal: (modal)-> container.modal = modal; this
          edition: manager.generate()
          assets: assets
          text: text
          to_t9: ()->
            container.edition = manager.generate()
            container.modal.opened.then ->
              container.modal.close()
              open keyboards.t9, container
            
          to_qwerty: ()->
            container.edition = manager.generate()
            container.modal.opened.then ->
            container.modal.close()
            open keyboards.qwerty, container
        
        open last_keyboard, container
        
        done: (callback)-> done_callbacks.push callback
        exit: (callback)-> exit_callbacks.push callback
   
    
   
])