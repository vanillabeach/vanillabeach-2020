import { LitElement, css, html, TemplateResult } from 'lit-element';
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

      :host .photo .icon {
        width: 64px;
        height: 64px;
        background-color: var(--content-background-color);
        border: 0px;
        border-bottom: var(--under-border-thickness) solid
          var(--content-foreground-color-translucent);
      }

      :host .photo .icon img {
        width: 32px;
      }

      :host .photo.show {
        opacity: 1;
      }

      :host .photo > section {
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

      :host .photo > section h2 {
        margin-top: 0;
        font-family: var(--header-font-family);
        text-transform: uppercase;
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
    this.bindEvents();
  }

  render() {
    const photo = new Image();
    const url = this.photo
      ? this.getPhotoPath(this.photo.category, this.photo.id)
      : '';
    const title = this.photo ? this.photo.title : '';
    const entry = this.photo ? this.photo.entry : '';

    photo.src = url;
    photo.onload = () => {
      const photoIsNarrowOnWideScreen = ((window.innerWidth > window.innerHeight) && (photo.width < photo.height));
      const photoIsWideOnNarrowScreen = ((window.innerWidth < window.innerHeight) && (photo.width > photo.height));
      console.log('photo', photo.width, photo.height, photoIsNarrowOnWideScreen, photoIsWideOnNarrowScreen);

      if (photoIsNarrowOnWideScreen || photoIsWideOnNarrowScreen) {
        this.shadowRoot.querySelector('#photo').classList.add('fit');
      }
      this.fadeIn();
    }

    return html` <div class="full-screen-photo">
      <div id="photo" class="photo" style="background-image: url(${url})">
        <button class="icon" id="exit">
          <img src="${iconsUrl}/close.svg" title="Close" />
        </button>
        <section>
          <h2>${title}</h2>
          ${entry}
        </section>
      </div>
    </div>`;
  }

  private bindEvents() {
    this.bindExitEvent();
  }

  private bindExitEvent() {
    this.shadowRoot
      .querySelector('#exit')
      .addEventListener('click', this.exitEvent.bind(this));
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
    console.log('PUBLISH PHOTO ENTRY REQUEST');
    PubSub.publish(Signal.PhotoEntryRequest, this.photoId);
  }

  private getPhotoPath(category: string, id: string): string {
    const photoId = `${id}/${id}.png`;
    const path = `${Config.url.server.photo.media}/${category}/${photoId}`;
    return encodeURI(path);
  }

  private unbindEvents() {
    this.unbindExitEvent();
  }

  private unbindExitEvent() {
    this.shadowRoot
      .querySelector('#exit')
      .removeEventListener('click', this.exitEvent.bind(this));
  }

  private exitEvent() {
    console.log('exitUrl', this.exitUrl);

    if (this.exitUrl) {
      document.location.hash = this.exitUrl;
    }
  }
}

customElements.define('vb-photo', VBPhoto);
