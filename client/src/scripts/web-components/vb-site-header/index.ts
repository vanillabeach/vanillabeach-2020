import * as PubSub from 'pubsub-js';
import { LitElement, css, unsafeCSS, html } from 'lit-element';
import { Config } from '../../config';
import { State } from '../vb-app/index';
import { Signal } from '../vb-app/enums';

export class SiteHeader extends LitElement {
  static get styles() {
    const backgroundUrl = css`${unsafeCSS(Config.url.server.backgrounds)}`;
    return css`
      :host {
          display: block;
      }    

      :host .logo {
          background-color: var(--foreground-color);
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
          color: var(--background-color);
          text-shadow: 0px 3px 0px var(--foreground-color);
          display: block;
      }
    `;
  }

  private bindEvents() {
  }

  private bindPubSubEvents() {
    PubSub.subscribe(Signal.AppSync, (_: string, state: State) => {});
  }

  private unbindEvents() {
  }

  private unbindPubSubEvents() {
    PubSub.unsubscribe(Signal.AppSync);
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
    this.bindEvents();
  }

  render() {
    return html`
      <section class="logo">
        <article id="scroll-container" class="scroll-container">
          <h1 id="logo-text"><span>VANILLA</span><span>BEACH</span></h1>
          <vb-nav></vb-nav>
        </article>
      </section>
      <section class="splash"></section>    
    `;
  }
}
customElements.define('vb-site-header', SiteHeader);
