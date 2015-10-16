### guia de desarrollo TAC

# tac-keyboard

Teclado virtual dinámico navegable por control remoto.
Permite editar los *inputs* de nuestra página con solo agregar un atributo a nuestro html.
Dispone de teclado qwerty navegable por flechas y otro T9 con tipeo repetitivo sobre el *numpad*.

## Install

Este repositorio de distribuye a travez del administrador `bower`. Los fuentes de este módulo se pueden encontrar en el
[repositorio general TacTeam](https://github.com/tacteam/keyboard).
Sientase a gusto de reportar problemas o proponer nuevas *features* en este repositorio

### bower

Este módulo puede ser instalado con `bower`.

```shell
bower install tac-keyboard
```

Opcionalmente puede agregar el prefijo --save para agregar la dependencia al archivo bower.js

```shell
bower install tac-keyboard --save
```

Luego agregue el correpondiente tag `<script>` a su `index.html`:

```html
<script src="/bower_components/tac-keyboard/dist/keyboard.js"></script>
```

## Documentación

##### Dependencia Angular

```js
angular.module('main-application',[
  '...dependencies...'
  'module.tac.keyboard'
  '...dependencies...'
])
```

Tenga en cuenta que **tac.keyboard** depende de los componentes
[**angularLocalStorage**](https://github.com/agrublev/Angular-localStorage), 
[**tac.navigation**](https://github.com/tacteam/navigation) y 
[**tac.look.svg**](https://github.com/tacteam/look-svg). 
Asegúrese de que estén presentes.

##### Inicialización del componente

Este componente no necesita ser inicializado.

##### Uso

```html
<input type="text" open-editor="tac.keyboard" otros-atributos="valor"/>
```

El atributo 'open-editor' ofrecerá 'tac.keyboard' como un servicio cuando **tac.navigation** procese la acción **click** sobre el enlace.

## Licencia

No disponible aún.
