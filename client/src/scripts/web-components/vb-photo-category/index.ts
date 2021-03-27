import * as PubSub from 'pubsub-js';
import { LitElement, css, html } from 'lit-element';
import { Config } from '../../config';
import { JournalSummary } from '../../model/journalSummary';
import { Navigation } from '../vb-app/navigation';
import { State } from '../vb-app/index';
import { Signal } from '../vb-app/enums';

const fadeDuration = Config.style.fadeDuration;

export class PhotoCategoryWebComponent extends LitElement {
  private name: string;
  private url: string;
  private href: string;

  static get properties() {
    return {
      name: {type: String},
      url: {type: String},
      href: {type: String},
    };
  }
  static get styles() {
    return css`
      .photo-category {
        width: 100%;
        height: 100%;
        display: block;
        position: relative;
        outline: none;
        cursor: pointer;
        overflow: hidden;
      }

      :host .foreground,
      :host .background {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
      }

      :host .foreground {
        z-index: 1;
        border: 1px solid;
        border-bottom: 5px solid;
        border-color: var(--content-foreground-color-translucent);
        box-sizing: border-box;
      }

      :host .background {
        z-index: 0;
        background-size: cover;
        filter: blur(3px);
        transform: scale(1.1);
      }
    `;
  }

  private bindEvents() {
    const container: HTMLElement = this.shadowRoot.querySelector(
      '#photo-category'
    );

    if (container) {
      container.addEventListener('click', this.viewPhoto);
    }
  }

  private unbindEvents() {
    const container: HTMLElement = this.shadowRoot.querySelector(
      '#photo-category'
    );

    if (container) {
      container.removeEventListener('click', this.viewPhoto);
    }
  }

  private viewPhoto() {

  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unbindEvents();
  }

  updated() {
    this.bindEvents();
  }

  render() {
    return html`
      <div id="photo-category" class="photo-category">
        <div class="foreground">${this.name}</div>
        <div class="background" style="background-image: url(${this.url})"></div>
      </div>
    `;
  }
}
customElements.define('vb-photo-category', PhotoCategoryWebComponent);
