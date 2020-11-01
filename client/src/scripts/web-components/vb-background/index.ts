import { LitElement, css, html } from 'lit-element';
import { Config } from '../../config';

export class Background extends LitElement {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  static get styles() {
    return css`
      :host .mural {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background: var(--backgroundHome) top center;
        background-color: var(--background);
        background-size: cover;
        background-repeat: no-repeat;
        z-index: -100;
      }
    `;
  }

  render() {
    return html`<section class="mural"></section>`;
  }
}
customElements.define('vb-background', Background);
