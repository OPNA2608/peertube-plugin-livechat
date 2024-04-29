/* eslint-disable max-len */
import { html } from 'lit'
import tplIcons from '../../../src/shared/templates/icons.js'

export default () => {
  // Here we are adding some additonal icons to ConverseJS defaults
  const converseJsIcons = tplIcons()

  return html`
    ${converseJsIcons}

    <!--
    Font Awesome Free 5.13.0 by @fontawesome - https://fontawesome.com
    License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
    -->
    <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
    <symbol id="icon-list" viewBox="0 0 448 512">
      <path d="M40 48C26.7 48 16 58.7 16 72v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V72c0-13.3-10.7-24-24-24H40zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM16 232v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V232c0-13.3-10.7-24-24-24H40c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V392c0-13.3-10.7-24-24-24H40z"></path>
    </symbol>
    </svg>
  `
}
