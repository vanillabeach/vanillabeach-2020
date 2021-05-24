import * as PubSub from 'pubsub-js';
import { LitElement, css, unsafeCSS, html } from 'lit-element';
import { Config } from '../../config';
import { State } from '../vb-app/index';
import { Signal } from '../vb-app/enums';

const fadeDuration = Config.style.fadeDuration;

export class SiteHeader extends LitElement {
  static get styles() {
    const backgroundUrl = css`${unsafeCSS(Config.url.server.backgrounds)}`;
    return css`
      :host {
          display: block;
          position: relative;
          z-index: 1;
      }    

      :host .container {
        transition: opacity ${fadeDuration}ms ease-in;
        opacity: 0;
      }

      :host .container.show {
        opacity: 1;
      }

      :host .logo {
          background-color: var(--content-foreground-color);
          height: 100px;
          text-align: center;
      }

      :host .scroll-container {
        position: relative;
        top: 0;
      }

      :host .splash {
          background: url('${backgroundUrl}/bg-header-wide.png') bottom center repeat-x;
          background-size: cover;
          height: ${Config.size.mainHeaderSplash}px;
          text-align: center;
      }

      :host h1 {
          font-family: var(--header-font-family);
          font-size: 800%;
          font-weight: normal;
          margin: 0;          
          padding: 0;
          padding-top: 20px;
          line-height: 1;
          color: var(--content-background-color);
          text-shadow: 0px 3px 0px var(--content-foreground-color);
          display: block;
      }
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unbindEvents();
    this.unbindPubSubEvents();
  }

  connectedCallback() {
    super.connectedCallback();
    this.bindPubSubEvents();
  }

  updated() {
    window.setTimeout(this.fadeIn.bind(this), Config.timing.siteFadeInLatency / 2);
    this.bindEvents();
  }

  render() {
    return html`
      <div class="container" id="container">
        <section class="logo">
          <article id="scroll-container" class="scroll-container">
            <h1 id="logo-text"><span>VANILLA</span><span>BEACH</span></h1>
            <vb-nav></vb-nav>
          </article>
        </section>
        <section class="splash"></section>    
      </div>
    `;
  }

  private bindEvents() {
  }

  private bindPubSubEvents() {
    PubSub.subscribe(Signal.AppSync, (_: string, state: State) => {});
  }

  private fadeIn() {
    const containerEl = this.shadowRoot.querySelector('#container');

    containerEl.classList.add('show');
  }

  private unbindEvents() {
  }

  private unbindPubSubEvents() {
    PubSub.unsubscribe(Signal.AppSync);
  }
}
customElements.define('vb-site-header', SiteHeader);
