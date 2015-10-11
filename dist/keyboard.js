(function() {
  'use strict';
  angular.module('module.tac.keyboard').factory('tac.keyboard.content', [
    function() {
      var letters, set_content;
      letters = function(text) {
        var index, letter, result, _i, _len;
        result = [];
        for (index = _i = 0, _len = text.length; _i < _len; index = ++_i) {
          letter = text[index];
          result.push({
            key: letter,
            index: index
          });
        }
        return result;
      };
      set_content = function(container) {
        var content;
        content = container.content = {};
        content.erase = function() {
          content.before = '';
          content.after = '';
          return content.sanitize();
        };
        content.write = function(letter) {
          content.before += letter;
          return content.sanitize();
        };
        content.remove_one = function() {
          content.before = content.before.substring(0, content.before.length - 1);
          return content.sanitize();
        };
        content.rewrite = function(letter) {
          content.before = content.before.substring(0, content.before.length - 1) + letter;
          return content.sanitize();
        };
        content.init = function() {
          content.before = container.text;
          content.after = '';
          return content.sanitize();
        };
        content.left = function() {
          var last;
          if (this.before.length > 0) {
            last = this.before.charAt(this.before.length - 1);
            this.after = last + this.after;
            this.before = this.before.substring(0, this.before.length - 1);
            this.sanitize();
            return true;
          }
        };
        content.right = function() {
          var first;
          if (this.after.length > 0) {
            first = this.after.charAt(0);
            this.before += first;
            this.after = this.after.substring(1, this.after.length);
            this.sanitize();
            return true;
          }
        };
        return content.sanitize = function() {
          container.text = content.before + content.after;
          content.before_letters = letters(content.before);
          return content.after_letters = letters(content.after);
        };
      };
      return {
        process: function(container) {
          if (!container.content) {
            set_content(container);
          }
          return container.content.init();
        }
      };
    }
  ]);

}).call(this);

(function() {
  'use strict';
  angular.module('module.tac.keyboard').directive('keyboardInput', [
    function() {
      var fix, scroll_offset;
      scroll_offset = 60;
      fix = function(frame, cursor) {
        var fix_cursor_position, ol, sL, sW;
        fix_cursor_position = function() {};
        ol = cursor[0].offsetLeft;
        sW = frame[0].scrollLeft + frame[0].clientWidth;
        sL = frame[0].scrollLeft;
        if (ol > sW - scroll_offset) {
          frame.scrollLeft(cursor[0].offsetLeft - frame[0].clientWidth + scroll_offset);
        }
        if (ol < sL + scroll_offset) {
          return frame.scrollLeft(cursor[0].offsetLeft - scroll_offset);
        }
      };
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var cursor;
          cursor = element.find('#cursor');
          return scope.$watch(function() {
            return fix(element, cursor);
          });
        }
      };
    }
  ]);

}).call(this);

(function() {
  'use strict';
  angular.module('module.tac.keyboard', ['angularLocalStorage', 'module.tac.navigable', 'module.tac.svg']).factory('tac.keyboard', [
    '$modal', 'tac.keys', 'storage', function($modal, keys, storage) {
      var assets, keyboard, keyboards, last_keyboard, open, storage_id;
      assets = 'assets/tac_components';
      storage_id = 'tac.keyboard.last';
      keyboards = {
        t9: {
          key: 't9',
          windowClass: 't9-dialog',
          templateUrl: 't9.html',
          controller: 'tac.keyboard.t9'
        },
        qwerty: {
          key: 'qwerty',
          windowClass: 'qwerty-dialog',
          templateUrl: 'qwerty.html',
          controller: 'tac.keyboard.qwerty'
        }
      };
      last_keyboard = keyboards.qwerty;
      (function() {
        var last_keyboard_key;
        return (last_keyboard_key = storage.get(storage_id)) && (last_keyboard = keyboards[last_keyboard_key] || last_keyboard);
      })();
      open = function(keyboard, container) {
        var modalInstance;
        if (keyboard !== last_keyboard) {
          last_keyboard = keyboard;
          storage.set(storage_id, keyboard.key);
        }
        modalInstance = $modal.open({
          windowClass: keyboard.windowClass,
          templateUrl: keyboard.templateUrl,
          controller: keyboard.controller,
          resolve: {
            container: function() {
              return container;
            }
          }
        });
        container.modal = modalInstance;
        return modalInstance.result.then(container.edition.success, container.edition.close);
      };
      return keyboard = {
        set_assets_path: function(path) {
          return assets = path;
        },
        edit: function(text) {
          var container, done_callbacks, exit_callbacks, manager;
          keys.create_level();
          done_callbacks = [];
          exit_callbacks = [];
          manager = (function() {
            var create, current;
            current = {};
            create = function() {
              var instance;
              return instance = {
                close: function() {
                  var callback, _i, _len, _results;
                  if (instance.cancelled) {
                    return;
                  }
                  keys.previous_level();
                  _results = [];
                  for (_i = 0, _len = exit_callbacks.length; _i < _len; _i++) {
                    callback = exit_callbacks[_i];
                    _results.push(callback());
                  }
                  return _results;
                },
                success: function() {
                  var callback, _i, _j, _len, _len1, _results;
                  if (instance.cancelled) {
                    return;
                  }
                  keys.previous_level();
                  for (_i = 0, _len = done_callbacks.length; _i < _len; _i++) {
                    callback = done_callbacks[_i];
                    callback(container.text);
                  }
                  _results = [];
                  for (_j = 0, _len1 = exit_callbacks.length; _j < _len1; _j++) {
                    callback = exit_callbacks[_j];
                    _results.push(callback());
                  }
                  return _results;
                }
              };
            };
            return {
              generate: function() {
                current.cancelled = true;
                return current = create();
              }
            };
          })();
          container = {
            set_modal: function(modal) {
              container.modal = modal;
              return this;
            },
            edition: manager.generate(),
            assets: assets,
            text: text,
            to_t9: function() {
              container.edition = manager.generate();
              return container.modal.opened.then(function() {
                container.modal.close();
                return open(keyboards.t9, container);
              });
            },
            to_qwerty: function() {
              container.edition = manager.generate();
              container.modal.opened.then(function() {});
              container.modal.close();
              return open(keyboards.qwerty, container);
            }
          };
          open(last_keyboard, container);
          return {
            done: function(callback) {
              return done_callbacks.push(callback);
            },
            exit: function(callback) {
              return exit_callbacks.push(callback);
            }
          };
        }
      };
    }
  ]);

}).call(this);

(function() {
  'use strict';
  angular.module('module.tac.keyboard').controller('tac.keyboard.qwerty', [
    '$scope', '$modalInstance', 'tac.keys', 'tac.navigable.root', 'tac.navigable.extensible', 'tac.keyboard.content', 'container', function($scope, $modalInstance, control, root_component, extensible, content, container) {
      var append_character, modal_root;
      $scope.assets = container.assets;
      content.process(container);
      modal_root = root_component('modal-keyboard-root');
      $modalInstance.result["finally"](function() {
        return control.unsubscribe(modal_root);
      });
      control.subscribe(modal_root);
      $scope.navigable = extensible.create_vertical('modal-keyboard-main').set_priority(2).bind_to($scope, true);
      $scope.navigable.handlers.go_back = function() {
        $modalInstance.dismiss();
        return true;
      };
      $scope.container = container;
      append_character = function(character) {
        $scope.has_shift = false;
        $scope.has_simbol = false;
        return container.content.write(character);
      };
      $scope.tap = function(button) {
        return append_character(button.content);
      };
      $scope.tap_alphabetic = function(button) {
        if ($scope.has_shift) {
          return append_character(button.content.toUpperCase());
        } else {
          return append_character(button.content);
        }
      };
      $scope.tap_special = function(button) {
        if ($scope.has_simbol) {
          return append_character(button.special);
        } else {
          return append_character(button.content);
        }
      };
      $scope.tap_space = function() {
        return append_character(' ');
      };
      $scope.shift = function() {
        if ($scope.has_shift) {
          return $scope.has_shift = false;
        } else {
          return $scope.has_shift = true;
        }
      };
      $scope.simbol = function() {
        if ($scope.has_simbol) {
          return $scope.has_simbol = false;
        } else {
          return $scope.has_simbol = true;
        }
      };
      modal_root.add($scope.navigable);
      $scope.resume = function() {
        return $modalInstance.dismiss();
      };
      return $scope.confirm = function() {
        return $modalInstance.close();
      };
    }
  ]).controller('tac.keyboard.qwerty.letters', [
    '$scope', 'tac.navigable.extensible', 'tac.keyboard.qwerty.buttons', '$timeout', function($scope, extensible, buttons, $timeout) {
      $scope.navigable = extensible.create_multiline('modal-letters-frame', 10).set_priority(0).bind_to($scope);
      return $scope.buttons = buttons;
    }
  ]).factory('tac.keyboard.qwerty.buttons', [
    function() {
      return [
        {
          kind: 'button.special',
          content: '1',
          special: '!'
        }, {
          kind: 'button.special',
          content: '2',
          special: '"'
        }, {
          kind: 'button.special',
          content: '3',
          special: '·'
        }, {
          kind: 'button.special',
          content: '4',
          special: '$'
        }, {
          kind: 'button.special',
          content: '5',
          special: '%'
        }, {
          kind: 'button.special',
          content: '6',
          special: '&'
        }, {
          kind: 'button.special',
          content: '7',
          special: '/'
        }, {
          kind: 'button.special',
          content: '8',
          special: '('
        }, {
          kind: 'button.special',
          content: '9',
          special: ')'
        }, {
          kind: 'button.special',
          content: '0',
          special: '='
        }, {
          kind: 'alphabetic',
          content: 'q'
        }, {
          kind: 'alphabetic',
          content: 'w'
        }, {
          kind: 'alphabetic',
          content: 'e'
        }, {
          kind: 'alphabetic',
          content: 'r'
        }, {
          kind: 'alphabetic',
          content: 't'
        }, {
          kind: 'alphabetic',
          content: 'y'
        }, {
          kind: 'alphabetic',
          content: 'u'
        }, {
          kind: 'alphabetic',
          content: 'i'
        }, {
          kind: 'alphabetic',
          content: 'o'
        }, {
          kind: 'alphabetic',
          content: 'p'
        }, {
          kind: 'alphabetic',
          content: 'a'
        }, {
          kind: 'alphabetic',
          content: 's'
        }, {
          kind: 'alphabetic',
          content: 'd'
        }, {
          kind: 'alphabetic',
          content: 'f'
        }, {
          kind: 'alphabetic',
          content: 'g'
        }, {
          kind: 'alphabetic',
          content: 'h'
        }, {
          kind: 'alphabetic',
          content: 'j'
        }, {
          kind: 'alphabetic',
          content: 'k'
        }, {
          kind: 'alphabetic',
          content: 'l'
        }, {
          kind: 'alphabetic',
          content: "ñ"
        }, {
          kind: 'alphabetic',
          content: 'z'
        }, {
          kind: 'alphabetic',
          content: 'x'
        }, {
          kind: 'alphabetic',
          content: 'c'
        }, {
          kind: 'alphabetic',
          content: 'v'
        }, {
          kind: 'alphabetic',
          content: 'b'
        }, {
          kind: 'alphabetic',
          content: 'n'
        }, {
          kind: 'alphabetic',
          content: 'm'
        }, {
          kind: 'button',
          content: ','
        }, {
          kind: 'button',
          content: '.'
        }, {
          kind: 'button',
          content: '?'
        }
      ];
    }
  ]);

}).call(this);

angular.module('module.tac.keyboard').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('qwerty.alphabetic.html',
    "<a class=\"button alphabetic\" \n" +
    "  ng-click=\"tap_alphabetic(button)\"\n" +
    "  navigable-leaf-model=\"button\"\n" +
    "  ng-class=\"{hover:button.navigable.active}\"\n" +
    "  href>\n" +
    "  <div ng-hide=\"has_shift\">\n" +
    "    {{button.content}}\n" +
    "  </div>\n" +
    "  <div ng-show=\"has_shift\">\n" +
    "    {{button.content.toUpperCase()}}\n" +
    "  </div>\n" +
    "</a>"
  );


  $templateCache.put('qwerty.button.html',
    "<a class=\"button key-button\" \n" +
    "  ng-click=\"tap(button)\"\n" +
    "  navigable-leaf-model=\"button\"\n" +
    "  ng-class=\"{hover:button.navigable.active}\"\n" +
    "  href>\n" +
    "  <div>\n" +
    "    {{button.content}}\n" +
    "  </div>\n" +
    "</a>\n"
  );


  $templateCache.put('qwerty.button.special.html',
    "<a class=\"button key-button-special\" \n" +
    "  ng-click=\"tap_special(button)\"\n" +
    "  navigable-leaf-model=\"button\"\n" +
    "  ng-class=\"{hover:button.navigable.active}\"\n" +
    "  href>\n" +
    "  <div ng-hide=\"has_simbol\">\n" +
    "    {{button.content}}\n" +
    "  </div>\n" +
    "  <div ng-show=\"has_simbol\">\n" +
    "    {{button.special}}\n" +
    "  </div>\n" +
    "</a>"
  );


  $templateCache.put('qwerty.html',
    "<div>\n" +
    "  <div class=\"modal-body\" >\n" +
    "    <div class=\"main-frame\" >\n" +
    "      <div class=\"input-frame\" keyboard-input id=\"input-frame\">\n" +
    "       <div class=\"input\" >\n" +
    "         <span ng-repeat=\"letter in container.content.before_letters\"><span class=\"space\" ng-if=\"letter.key==' '\">_</span><span ng-if=\"letter.key!=' '\">{{letter.key}}</span></span>\n" +
    "       </div>\n" +
    "       <div class=\"cursor\" id=\"cursor\"></div>\n" +
    "       <div class=\"input\">\n" +
    "         <span ng-repeat=\"letter in container.content.after_letters\"><span class=\"space\" ng-if=\"letter.key==' '\">_</span><span ng-if=\"letter.key!=' '\">{{letter.key}}</span></span>\n" +
    "       </div>\n" +
    "      </div>\n" +
    "      <div class=\"letters-frame\" ng-controller=\"tac.keyboard.qwerty.letters\">\n" +
    "        <div ng-repeat=\"button in buttons\">\n" +
    "          <div ng-include=\"'qwerty.' + button.kind +'.html'\"> </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <div class=\"actions-frame\" \n" +
    "        ng-controller=\"tac.navigable.horizontal\"\n" +
    "        identifier=\"image header\" \n" +
    "        priority=\"1\"\n" +
    "        >\n" +
    "        <a class=\"button shift\" \n" +
    "          ng-click=\"$parent.shift()\"\n" +
    "          navigable-leaf=\"0\"\n" +
    "          navigable-leaf-id=\"shift-button\"\n" +
    "          navigable-leaf-class=\"hover\"\n" +
    "          href>\n" +
    "          <svg class=\"shift-icon\" inline-svg-model=\"{{assets}}/qwerty/shift.svg\"></svg>\n" +
    "        </a>\n" +
    "        <a class=\"button simbols\" \n" +
    "          ng-click=\"$parent.simbol()\"\n" +
    "          navigable-leaf=\"1\"\n" +
    "          navigable-leaf-id=\"simbol-button\"\n" +
    "          navigable-leaf-class=\"hover\"\n" +
    "          href>\n" +
    "          <span>#$%</span>\n" +
    "        </a>\n" +
    "        <a class=\"button space\" \n" +
    "          ng-click=\"tap_space()\"\n" +
    "          navigable-leaf=\"2\"\n" +
    "          navigable-leaf-id=\"space-button\"\n" +
    "          navigable-leaf-class=\"hover\"\n" +
    "          href>\n" +
    "          <span>espacio</span>\n" +
    "        </a>\n" +
    "        <a class=\"button delete\"\n" +
    "          ng-click=\"container.content.remove_one()\"\n" +
    "          navigable-leaf=\"3\"\n" +
    "          navigable-leaf-id=\"delete-button\"\n" +
    "          navigable-leaf-class=\"hover\"\n" +
    "          href>\n" +
    "          <span>borrar</span>\n" +
    "        </a>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  \n" +
    "  <div class=\"modal-footer\">\n" +
    "    <div class=\"modal-controls\"\n" +
    "      ng-controller=\"tac.navigable.horizontal\"\n" +
    "      identifier=\"image header\" \n" +
    "      priority=\"2\">\n" +
    "      <a class=\"modal-close\" \n" +
    "        navigable-leaf=\"2\"\n" +
    "        navigable-leaf-id=\"resume image modal\"\n" +
    "        navigable-leaf-class=\"hover\" \n" +
    "        ng-click=\"confirm()\"\n" +
    "        href >\n" +
    "        Aceptar\n" +
    "      </a>\n" +
    "      <a class=\"modal-resume\" \n" +
    "        navigable-leaf=\"1\"\n" +
    "        navigable-leaf-id=\"resume image modal\"\n" +
    "        navigable-leaf-class=\"hover\" \n" +
    "        ng-click=\"resume()\"\n" +
    "        href >\n" +
    "        Cancelar\n" +
    "      </a>\n" +
    "      <a class=\"keyboard-next\" \n" +
    "        navigable-leaf=\"0\"\n" +
    "        navigable-leaf-id=\"resume image modal\"\n" +
    "        navigable-leaf-class=\"hover\" \n" +
    "        ng-click=\"container.to_t9()\"\n" +
    "        href >\n" +
    "        Teclado T9\n" +
    "      </a>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

}]);

(function() {
  'use strict';
  angular.module('module.tac.keyboard').controller('tac.keyboard.t9', [
    '$scope', '$modalInstance', '$timeout', 'tac.keys', 'tac.keyboard.content', 'tac.keyboard.t9.buttons', 'tac.keyboard.t9.options', 'container', function($scope, $modalInstance, $timeout, keys, content, buttons, options, container) {
      var animate, animate_delay, controller, delay_bar, get_by_key, last_action, log_action, mode, relapse, relapse_delay;
      $scope.assets = container.assets;
      content.process(container);
      relapse_delay = 800;
      delay_bar = function() {
        return $('#delay-bar');
      };
      $scope.buttons = buttons;
      $scope.options = options;
      $scope.back_btn = {};
      $scope.menu_btn = {};
      $scope.mode = mode = {};
      last_action = {
        time: (new Date).getTime(),
        button: false
      };
      animate_delay = function() {
        delay_bar().width('100%');
        animate_delay.animate = true;
        return delay_bar().animate({
          width: "0%"
        }, relapse_delay);
      };
      animate_delay.stop = function() {
        if (animate_delay.animate) {
          delay_bar().stop();
          delay_bar().width('0%');
          return animate_delay.animate = false;
        }
      };
      log_action = function(button) {
        last_action.time = (new Date).getTime();
        return last_action.button = button;
      };
      relapse = function(button) {
        return last_action.button === button && (new Date).getTime() - last_action.time < relapse_delay;
      };
      get_by_key = function(key) {
        var button, str_key, _i, _len;
        str_key = String(key);
        for (_i = 0, _len = buttons.length; _i < _len; _i++) {
          button = buttons[_i];
          if (button.key === str_key) {
            return button;
          }
        }
        return console.log('sin boton para ' + key);
      };
      animate = function(button) {
        button.klass = 'pressed';
        $scope.$apply();
        return $timeout(function() {
          button.klass = '';
          return $scope.$apply();
        }, 200);
      };
      controller = {
        handlers: {
          right: function() {
            container.content.right();
            return $scope.$apply();
          },
          left: function() {
            container.content.left();
            return $scope.$apply();
          },
          menu: function() {
            controller.to_menu_mode();
            return animate($scope.menu_btn);
          },
          anterior: function(action) {
            animate(get_by_key(action.key));
            return container.content.remove_one();
          },
          go_back: function(action) {
            controller.prev();
            return animate($scope.back_btn);
          },
          enter: function(action) {
            return $modalInstance.close();
          }
        },
        handle_button: function(number) {
          var button;
          button = get_by_key(number);
          if (relapse(button)) {
            button.times += 1;
            controller.current.relapse(button);
          } else {
            controller.current.once(button);
            button.times = 0;
          }
          animate(button);
          return log_action(button);
        },
        zero: function() {
          var button;
          button = get_by_key(0);
          if (this.current.mode === 'numbers') {
            write('0');
          } else {
            write(' ');
          }
          animate(button);
          return true;
        },
        one: function() {
          animate(get_by_key(1));
          return this.next();
        },
        handle: function(action) {
          var handler;
          animate_delay.stop();
          if (action.is_number) {
            return mode.menu && this.menu.handle(action.number) || action.number === 0 && this.zero() || action.number === 1 && this.one() || this.handle_button(action.number);
          } else {
            handler = this.handlers[action.key];
            return handler && handler(action);
          }
        },
        next: function() {
          if ((this.current_index + 1) < this.states.length) {
            this.set_state(this.current_index + 1);
            return true;
          }
          return false;
        },
        prev: function() {
          if (this.current === this.menu) {
            this.set_state(this.current_index);
          } else {
            if (this.current_index > 0) {
              this.set_state(this.current_index - 1);
            } else {
              $modalInstance.close();
            }
          }
          return true;
        },
        set_state: function(index) {
          mode[this.current.mode] = false;
          this.current_index = index;
          this.current = this.states[this.current_index];
          return mode[this.current.mode] = true;
        },
        initialize: function() {
          this.current_index = 0;
          this.current = this.states[this.current_index];
          return mode[this.current.mode] = true;
        },
        menu: {
          mode: 'menu',
          handle: function(number) {
            switch (number) {
              case 1:
                container.to_qwerty();
                break;
              case 2:
                container.content.erase();
                controller.prev();
                $scope.$apply();
                break;
              case 3:
                $modalInstance.dismiss();
            }
            return true;
          }
        },
        to_menu_mode: function() {
          mode[this.current.mode] = false;
          this.current = this.menu;
          return mode[this.current.mode] = true;
        },
        states: [
          {
            mode: 'letters',
            once: function(button) {
              container.content.write(button.letters.charAt(0));
              return animate_delay();
            },
            relapse: function(button) {
              var position;
              position = button.times % button.letters.length;
              container.content.rewrite(button.letters.charAt(position));
              return animate_delay();
            }
          }, {
            mode: 'mayusc',
            once: function(button) {
              container.content.write(button.mayusc.charAt(0));
              return animate_delay();
            },
            relapse: function(button) {
              var position;
              position = button.times % button.mayusc.length;
              container.content.rewrite(button.mayusc.charAt(position));
              return animate_delay();
            }
          }, {
            mode: 'symbol',
            once: function(button) {
              container.content.write(button.symbol.charAt(0));
              return animate_delay();
            },
            relapse: function(button) {
              var position;
              position = button.times % button.symbol.length;
              container.content.rewrite(button.symbol.charAt(position));
              return animate_delay();
            }
          }, {
            mode: 'numbers',
            once: function(button) {
              return container.content.write(button.number);
            },
            relapse: function(button) {
              return this.once(button);
            }
          }
        ]
      };
      controller.initialize();
      container.content.sanitize();
      $modalInstance.result["finally"](function() {
        return keys.unsubscribe(controller);
      });
      keys.subscribe(controller);
      $scope.container = container;
      return $scope.controller = controller;
    }
  ]).factory('tac.keyboard.t9.buttons', [
    function() {
      var make;
      make = function(key, number, letters, mayusc, symbol) {
        return {
          key: key,
          number: number || '',
          letters: letters || '',
          mayusc: mayusc || '',
          symbol: symbol || ''
        };
      };
      return [
        make('1', '1'), make('2', '2', 'abc', 'ABC', '.:$'), make('3', '3', 'def', 'DEF', ',;('), make('4', '4', 'ghi', 'GHI', '@*['), make('5', '5', 'jkl', 'JKL', '-+{'), make('6', '6', 'mnño', 'MNÑO', '?¿)'), make('7', '7', 'pqrs', 'PQRS', '!¡]'), make('8', '8', 'tuv', 'TUV', '/=}'), make('9', '9', 'wxyz', 'WXYZ', '#_&'), make('epg'), make('0', '0', '_', '_', '_'), {
          key: 'anterior',
          name: '<[X]',
          svg: 'backspace'
        }
      ];
    }
  ]).factory('tac.keyboard.t9.options', [
    function() {
      return [
        {
          key: '1',
          description: 'Cambiar a teclado querty'
        }, {
          key: '2',
          description: 'Borrar texto'
        }, {
          key: '3',
          description: 'Cancelar edicion'
        }
      ];
    }
  ]);

}).call(this);

angular.module('module.tac.keyboard').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('t9.html',
    "<div>\n" +
    "  <div class=\"modal-body\" >\n" +
    "    <div class=\"main-frame\" >\n" +
    "      <div class=\"input-frame\" keyboard-input id=\"input-frame\">\n" +
    "       <div class=\"input\" >\n" +
    "         <span ng-repeat=\"letter in container.content.before_letters\"><span class=\"space\" ng-if=\"letter.key==' '\">_</span><span ng-if=\"letter.key!=' '\">{{letter.key}}</span></span>\n" +
    "       </div>\n" +
    "       <div class=\"cursor\" id=\"cursor\"></div>\n" +
    "       <div class=\"input\">\n" +
    "         <span ng-repeat=\"letter in container.content.after_letters\"><span class=\"space\" ng-if=\"letter.key==' '\">_</span><span ng-if=\"letter.key!=' '\">{{letter.key}}</span></span>\n" +
    "       </div>\n" +
    "      </div>\n" +
    "      <div class=\"delay-frame\">\n" +
    "        <div class=\"delay-bar\" id=\"delay-bar\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <div class=\"menu-frame\">\n" +
    "        <div class=\"menu\" ng-class=\"{'disable':mode.menu}\">\n" +
    "          <a class=\"menu-btn\" ng-class=\"menu_btn.klass\" ng-click=\"controller.to_menu_mode()\" href>\n" +
    "            menu\n" +
    "          </a>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <div class=\"go-back-frame\">\n" +
    "        <div class=\"go-back\">\n" +
    "          <a class=\"go-back-btn\" ng-click=\"controller.prev()\" ng-class=\"back_btn.klass\" href>\n" +
    "            volver\n" +
    "          </a>\n" +
    "        </div>\n" +
    "        <div class=\"go-back-description\">\n" +
    "          <span ng-hide=\"!mode.letters\">\n" +
    "            Cerrar teclado\n" +
    "          </span>\n" +
    "          <span ng-show=\"mode.mayusc\">\n" +
    "            Volver a modo minuscula\n" +
    "          </span>\n" +
    "          <span ng-show=\"mode.symbol\">\n" +
    "            Volver a modo texto\n" +
    "          </span>\n" +
    "          <span ng-show=\"mode.numbers\">\n" +
    "            Volver a modo simbolos\n" +
    "          </span>\n" +
    "          <span ng-show=\"mode.menu\">\n" +
    "            Ocultar opciones\n" +
    "          </span>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <div class=\"buttons-frame\" ng-hide=\"mode.menu\">\n" +
    "        <div ng-hide=\"mode.numbers\" ng-click=\"controller.next()\" class=\"modes\" href>\n" +
    "          <a class=\"mode letters\" ng-class=\"{'selected':mode.letters}\">\n" +
    "            abc\n" +
    "          </a>\n" +
    "          <a class=\"mode mayusc\" ng-class=\"{'selected':mode.mayusc}\">\n" +
    "            ABC\n" +
    "          </a>\n" +
    "          <a class=\"mode symbol\" ng-class=\"{'selected':mode.symbol}\">\n" +
    "            @.?,\n" +
    "          </a>\n" +
    "          <a class=\"mode numbers\">\n" +
    "            123\n" +
    "          </a>\n" +
    "        </div>\n" +
    "        <a ng-show=\"mode.numbers\" class=\"button\" ng-class=\"buttons[0].klass\" href>\n" +
    "          {{buttons[0].key}}\n" +
    "        </a>\n" +
    "        <div ng-repeat=\"button in buttons\" ng-show=\"$index!=0\">\n" +
    "          <a class=\"button\" ng-class=\"button.klass\" href>\n" +
    "            <div ng-if=\"button.svg\" class=\"svg-button\" inline-svg-model=\"{{assets}}/t9/{{button.svg}}.svg\"></div>\n" +
    "            <div ng-if=\"!button.svg\" ng-show=\"button.name\">\n" +
    "              {{button.name}}\n" +
    "            </div>\n" +
    "            <div ng-if=\"!button.svg\" ng-show=\"!button.name\">\n" +
    "              <div ng-hide=\"!mode.letters\">\n" +
    "                {{button.letters}}\n" +
    "              </div>\n" +
    "              <div ng-show=\"mode.mayusc\">\n" +
    "                {{button.mayusc}}\n" +
    "              </div>\n" +
    "              <div ng-show=\"mode.symbol\">\n" +
    "                <span class=\"symbol\" ng-repeat=\"symbol in button.symbol\">\n" +
    "                  {{symbol}}\n" +
    "                </span>\n" +
    "              </div>\n" +
    "              <div ng-show=\"mode.numbers\">\n" +
    "                {{button.number}}\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </a>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <div class=\"options-frame\" ng-show=\"mode.menu\">\n" +
    "        <a ng-repeat=\"option in options\" class=\"option\" ng-class=\"option.klass\" href>\n" +
    "          <div class=\"option-key\">\n" +
    "            {{option.key}}\n" +
    "          </div>\n" +
    "          <div class=\"option-description\">\n" +
    "            {{option.description}}\n" +
    "          </div>\n" +
    "        </a>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

}]);
