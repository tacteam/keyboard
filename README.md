### TAC Development Guide

# tac-keyboard

Dynamic virtual keyboard navigable by remote control.
Edit the inputs from our page just adding an attribute to our html.
It has a qwerty keyboard navigable by arrows and a T9 keyboard with repeating typing over the numpad.

## Install

This repo is for distribution on `bower`. The source for this module is in the
[main TacTeam repo](https://github.com/tacteam/keyboard).
Please file issues and pull requests against that repo.

### bower

You can install this package with `bower`.

```shell
bower install tac-keyboard
```

Optionally you can add --save prefix to add package to bower.js

```shell
bower install tac-keyboard --save
```

Then add a `<script>` to your `index.html`:

```html
<script src="/bower_components/tac-keyboard/dist/keyboard.js"></script>
```

## Documentation

##### Angular dependency

You must add the component identifier to Angular dependencies in order to load module into the application.

```js
angular.module('main-application',[
  '...dependencies...',
  'module.tac.keyboard',
  '...dependencies...'
])
```

Note that **tac.keyboard** depends on 
[**angularLocalStorage**](https://github.com/agrublev/Angular-localStorage), 
[**tac.navigation**](https://github.com/tacteam/navigation) and 
[**tac.look.svg**](https://github.com/tacteam/look-svg) components. 
Make sure these are present.

##### Initialize component

This component need not be initialized

##### Using

```html
<input type="text" open-editor="tac.keyboard" some-other-attributes="value"/>
```

The attribute 'open-editor' will provide 'tac.keyboard' as a service when **tac.navigation** process the **click** action over the anchor.

## License

License is not available yet
