import { LitElement, css, html } from 'lit-element';
import { Config } from '../../config';
import { Signal } from '../vb-app/enums';
import { State } from '../vb-app/index';

export class Background extends LitElement {
  private backgroundImage: HTMLImageElement;
  private foregroundImage: HTMLImageElement;
  private maskImage: HTMLImageElement;
  private canPaint: boolean;

  static get properties() {
    return {
      pageId: { type: String },
    };
  }

  constructor() {
    super();
    this.canPaint = false;
    this.setAttribute('pageId', Config.navigationDefault);
  }

  connectedCallback() {
    super.connectedCallback();
    this.bindPubSubEvents();
    this.bindWindowEvents();
  }

  disconnectedCallback() {
    this.unbindPubSubEvents();
    this.unbindWindowEvents();
  }

  private bindPubSubEvents() {
    PubSub.subscribe(Signal.AppSync, (_: string, state: State) => {
      console.log('pageId', state.user.selectedPage);
      this.setAttribute('pageId', state.user.selectedPage);
      this.init();
    });
  }

  private unbindPubSubEvents() {
    PubSub.unsubscribe(Signal.AppSync);
  }

  private bindWindowEvents() {
    window.addEventListener('scroll', this.paintMural.bind(this));
    window.addEventListener('resize', this.resizeMural.bind(this));
  }

  private paintMural() {
    if (this.canPaint === false) {
      return;
    }

    const muralEl: HTMLCanvasElement = this.shadowRoot.querySelector('#mural');
    const ctx = muralEl.getContext('2d');
    const parallaxRatio = window.innerHeight / document.body.offsetHeight;
    const imageRatio =
      this.foregroundImage.width < this.foregroundImage.height
        ? this.foregroundImage.height / this.foregroundImage.width
        : this.foregroundImage.width / this.foregroundImage.height;

    const muralWidth = Math.min(window.innerWidth, Config.size.backgroundMax);
    const muralHeight = muralEl.offsetWidth * imageRatio;

    ctx.drawImage(
      this.backgroundImage,
      0,
      window.scrollY * parallaxRatio * -0.6,
      muralWidth,
      muralHeight
    );
    ctx.drawImage(
      this.foregroundImage,
      0,
      window.scrollY * parallaxRatio * -1,
      muralWidth,
      muralHeight
    );
  }

  private renderBackground() {
    const pageId = this.getAttribute('pageId');
    const backgroundPath = `${Config.url.server.backgrounds}/${pageId}`;
    const muralEl: HTMLCanvasElement = this.shadowRoot.querySelector('#mural');
    function checkBackgroundsHaveLoaded() {
      if (
        this.backgroundImage.width > 0 &&
        this.foregroundImage.width > 0 &&
        this.maskImage.width > 0
      ) {
        this.canPaint = true;
        this.resizeMural();
        setTimeout(() => muralEl.classList.add('show'), 500);
      }
    }

    muralEl.classList.remove('show');

    this.canPaint = false;
    this.backgroundImage = new Image();
    this.foregroundImage = new Image();
    this.maskImage = new Image();
    this.backgroundImage.src = `${backgroundPath}/background.png`;
    this.foregroundImage.src = `${backgroundPath}/foreground.png`;
    this.maskImage.src = `${backgroundPath}/mask.png`;
    this.backgroundImage.onload = checkBackgroundsHaveLoaded.bind(this);
    this.foregroundImage.onload = checkBackgroundsHaveLoaded.bind(this);
    this.maskImage.onload = checkBackgroundsHaveLoaded.bind(this);
  }

  private setBackgroundColor() {
    const baseColorEl:HTMLElement = this.shadowRoot.querySelector('#base-color');
    const pageId = this.getAttribute('pageId');
    const pageKeys = Object.keys(Config.navigation);
    const selectedPage = pageKeys.filter(
      (page: string) => Config.navigation[page].pageId === pageId
    ).join();

    console.log('selectedPage', selectedPage, Config.navigation[selectedPage]?.hasBrightBackground);

    if (Config.navigation[selectedPage]?.hasBrightBackground === true) {
      baseColorEl.classList.remove('dark-background');
    } else {
      baseColorEl.classList.add('dark-background');
    }
  }

  private resizeMural() {
    const muralEl: HTMLElement = this.shadowRoot.querySelector('#mural');
    const width = Math.min(window.innerWidth, Config.size.backgroundMax);
    const height = window.innerHeight;

    muralEl.setAttribute('width', `${width}`);
    muralEl.setAttribute('height', `${height}`);
    this.paintMural();
  }

  private init() {
    this.setBackgroundColor();
    this.renderBackground();
  }

  updated() {
    this.init();
  }

  private unbindWindowEvents() {
    window.removeEventListener('scroll', this.paintMural.bind(this));
    window.addEventListener('resize', this.resizeMural.bind(this));
  }

  static get styles() {
    return css`
      :host {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: -100;
        overflow: hidden;
        opacity: 1;
      }

      :host .base-color {
        width: 100%;
        height: 100%;
        transition: background-color 200ms ease-in;
        background-color: var(--body-background-color-light);
      }

      :host .base-color.dark-background {
        background-color: var(--body-background-color-dark);
      }

      :host #mural {
        box-sizing: border-box;
        transition: opacity 0.2s ease-in;
        max-width: ${Config.size.backgroundMax};
        display: block;
        margin: auto;
        opacity: 0;
      }

      :host #mural.show {
        opacity: 1;
      }
    `;
  }

  render() {
    return html`
      <div class="base-color" id="base-color">
        <canvas id="mural" class="mural"></canvas>
      </div>
    `;
  }
}
customElements.define('vb-background', Background);
