import { LitElement, css, html, TemplateResult } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { Config } from '../../config';
import { Photo } from '../../model/photo';
import { Signal } from '../vb-app/enums';
import { State } from '../vb-app/index';

const fadeDuration = Config.style.fadeDuration;
const iconsUrl = Config.url.server.icons;

export class VBPhoto extends LitElement {
  private exitUrl: string;
  private photo: Photo;
  private photoId: string;
  private isFirstRender = true;

  constructor() {
    super();
  }

  static get properties() {
    return {
      photo: { type: String, attribute: false },
      photoId: { type: String },
      exitUrl: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      :host .full-screen-photo {
        position: fixed;
        background: var(--content-foreground-color)
          url(/resources/site/decorations/spinner.svg) center center no-repeat;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: var(--section-padding);
        z-index: 1;
      }

      :host .photo {
        display: block;
        margin: auto;
        opacity: 0;
        width: 100%;
        max-width: 1920px;
        height: 100%;
        background-color: var(--content-foreground-color);
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
        transition: opacity ${fadeDuration}ms ease-in;
      }

      :host .photo.fit {
        background-size: contain;
      }

      :host .photo .main-content .icon {
        width: 3em;
        height: 3em;
        background-color: var(--content-background-color);
        border: 0px;
        border-bottom: var(--under-border-thickness) solid
          var(--content-foreground-color-translucent);
        margin-right: 1em;
        cursor: pointer;
      }

      :host .photo .main-content .icon img {
        width: 1.5em;
      }

      :host .photo.show {
        opacity: 1;
      }

      :host .photo .main-content{
        transition: 500ms cubic-bezier(.14,1.12,.42,.98);
        background-color: var(--content-foreground-color-opaque);
        box-sizing: border-box;
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 300px;
        text-shadow: none;
        padding: calc(var(--section-padding) * 2);
        color: var(--content-background-color);
      }

      :host .photo .main-content.hide {
        height: 6em;
        overflow: hidden;
      }

      :host .photo .main-content.hide .minimize > img {
        transform: rotate(180deg);
        transform-origin: center center;
      }

      :host .photo .main-content > header > * {
        display: inline-block;
        vertical-align: top;
      }

      :host .photo .main-content h2 {
        margin-top: 0;
        font-family: var(--header-font-family);
        text-transform: uppercase;
      }

      :host .photo .main-content .comment {
        margin-top: 1em;
        font-style: italic;
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.bindPubSubEvents();
    this.getPhoto();
  }

  disconnectedCallback() {
    this.unbindEvents();
  }

  updated() {
    if (this.isFirstRender === true) {
      this.bindEvents();
      this.isFirstRender = false;
    }
  }

  render() {
    const photo = new Image();
    const url = this.photo
      ? this.getPhotoPath(this.photo.category, this.photo.id)
      : '';
    const title = this.photo ? this.photo.title : '';
    const entry = this.photo ? unsafeHTML(this.photo.entry) : '';
    const comment = this.photo
      ? html`<div class="comment">
          ${unsafeHTML(this.photo.comment.trim())}
        </div>`
      : html``;

    photo.src = url;
    photo.onload = () => {
      const photoIsNarrowOnWideScreen =
        window.innerWidth > window.innerHeight && photo.width < photo.height;
      const photoIsWideOnNarrowScreen =
        window.innerWidth < window.innerHeight && photo.width > photo.height;

      if (photoIsNarrowOnWideScreen || photoIsWideOnNarrowScreen) {
        this.shadowRoot.querySelector('#photo').classList.add('fit');
      }
      this.fadeIn();
    };

    return html` <div class="full-screen-photo">
      <div id="photo" class="photo" style="background-image: url(${url})">
        <section class="main-content" id="main-content">
          <header>
            <button class="icon" id="exit">
              <img src="${iconsUrl}/close.svg" title="Close" />
            </button>
            <button class="icon minimize" id="minimize">
              <img src="${iconsUrl}/minimize.svg" title="Close" />
            </button>
            <h2>${title}</h2>
          </header>
          ${entry} ${comment}
        </section>
      </div>
    </div>`;
  }

  private bindEvents() {
    this.bindExitEvent();
    this.bindMinimizeToggleEvent();
  }

  private bindExitEvent() {
    this.shadowRoot
      .querySelector('#exit')
      .addEventListener('click', this.exitEvent.bind(this));
  }

  private bindMinimizeToggleEvent() {
    this.shadowRoot
      .querySelector('#minimize')
      .addEventListener('click', this.minimizeToggleEvent.bind(this));
  }

  private bindPubSubEvents() {
    PubSub.subscribe(Signal.AppSync, (_: string, state: State) => {
      this.photo = state.pages.photosAndVideos.photos.entry;
    });
  }

  private fadeIn() {
    setTimeout(() => {
      this.shadowRoot.querySelector('#photo').classList.add('show');
    }, Config.timing.fadeInLatency);
  }

  private getPhoto() {
    PubSub.publish(Signal.PhotoEntryRequest, this.photoId);
  }

  private getPhotoPath(category: string, id: string): string {
    const photoId = `${id}/${id}.png`;
    const path = `${Config.url.server.photo.media}/${category}/${photoId}`;
    return encodeURI(path);
  }

  private minimizeToggleEvent() {
    this.shadowRoot.querySelector('#main-content').classList.toggle('hide');
  }

  private unbindEvents() {
    this.unbindExitEvent();
    this.unbindMinimizeToggleEvent();
  }

  private unbindExitEvent() {
    this.shadowRoot
      .querySelector('#exit')
      .removeEventListener('click', this.exitEvent.bind(this));
  }

  private unbindMinimizeToggleEvent() {
    this.shadowRoot
      .querySelector('#minimize')
      .removeEventListener('click', this.minimizeToggleEvent.bind(this));
  }

  private exitEvent() {
    if (this.exitUrl) {
      document.location.hash = this.exitUrl;
    }
  }
}

customElements.define('vb-photo', VBPhoto);
