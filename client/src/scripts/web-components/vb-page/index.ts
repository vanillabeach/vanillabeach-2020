import { LitElement, css, html } from 'lit-element';
import * as PubSub from 'pubsub-js';
import { Config } from '../../config';
import { Signal } from '../vb-app/enums';

const fadeDuration = Config.style.fadeDuration;

export class Page extends LitElement {
  constructor() {
    super();
  }

  static get styles() {
    return css`
      :host {
        display: none;
      }

      :host(.show) {
        display: block;
      }

      :host .page-container {
        transition: opacity ${fadeDuration}ms ease-in;
        opacity: 0;
      }

      :host .page-container.show {
        opacity: 1;
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.bindPubSubEvents();
  }

  render() {
    return html`
      <section id="page-container" class="page-container">
        <slot></slot>
      </section>
    `;
  }

  private bindPubSubEvents() {
    PubSub.subscribe(Signal.AppSync, this.fadeIn.bind(this));
  }

  private fadeIn() {
    console.log('vb-page fade in');
    const pageEl: HTMLElement = this.shadowRoot.querySelector(
      '#page-container'
    );

    pageEl.classList.add('show');
  }
}

customElements.define('vb-page', Page);
