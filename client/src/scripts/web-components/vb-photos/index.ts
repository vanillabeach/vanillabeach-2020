import * as PubSub from 'pubsub-js';
import { LitElement, TemplateResult, css, html } from 'lit-element';
import { Config } from '../../config';
import { Photo } from '../../model/photo';
import { Signal } from '../vb-app/enums';
import { State } from '../vb-app/index';

const renderEffects = false;
const fadeDuration = Config.style.fadeDuration;

type PhotoUrlParams = {
  category: string;
  photoId: string;
};

class PhotosWebComponent extends LitElement {
  private photosById: { [key: string]: Photo };
  private category: string;
  private pageId: string;
  private photoId: string;
  private albumTiles: TemplateResult[];
  private albumTitle: string;

  constructor() {
    super();
    this.pageId = Config.navigation.photosAndVideos.pageId;
  }

  static get properties() {
    return {
      category: { type: String, reflect: true },
      pageId: { type: String },
      photoId: { type: String },
      albumTiles: { type: Array, attribute: false },
      albumTitle: { type: String, attribute: false },
    };
  }

  static get styles() {
    return css`
      :host {
        line-height: 1.5;
        font-family: var(--body-font-family);
        font-size: var(--body);
        color: var(--body-text-color);
        text-shadow: var(--body-text-shadow);
      }

      :host h1 {
        font-size: var(--h1);
      }
      :host h2 {
        font-size: var(--h2);
      }

      :host h3 {
        font-size: var(--h3);
      }

      :host h4 {
        font-size: var(--h4);
      }

      :host .photo-categories {
        display: flex;
        padding-left: 20px;
        padding-right: 20px;
      }

      :host .photo-category,
      :host .photo-thumbnail {
        flex: 1;
        height: 200px;
        box-sizing: border-box;
        padding-left: 10px;
        padding-right: 10px;
        padding-bottom: 20px;
      }

      :host .photo-category:first-of-type,
      :host .photo-thumbnail:first-of-type {
        padding-left: 0px;
      }

      :host .photo-category:last-of-type,
      :host .photo-thumbnail:last-of-type {
        padding-right: 0px;
      }

      :host #photos {
        transition: opacity ${fadeDuration}ms ease-in 2s;
        opacity: 0;
      }

      :host #photos.show {
        transition: ease-in;
        opacity: 1;
      }

      :host #photos .category {
        width: 300px;
        height: 200px;
        border: 1px solid black;
        background-size: cover;
        background-position: center center;
      }

      :host #photos .photos-header {
        -webkit-font-smoothing: antialiased;
        font-family: var(--header-font-family);
        text-align: center;
        text-transform: uppercase;
        padding-top: 10px;
      }

      :host #photos .photos-header .photos-title {
        color: var(--content-foreground-color);
        font-weight: 100;
      }

      :host a {
        color: var(--link-color);
        font-size: var(--body) !important;
        display: inline-block;
        background-color: #00000011;
        text-decoration: none;
        padding-left: 0.2em;
        padding-right: 0.2em;
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.bindPubSubEvents();
    this.getPhotos();
  }

  disconnectedCallback() {
    this.unbindPubSubEvents();
  }

  attributeChangedCallback(
    name: string,
    oldval: string | null,
    newval: string | null
  ) {
    if (name === 'category') {
      this.photosById = {};
      this.getPhotos(newval);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }

  render() {
    if (this.albumTiles === undefined) {
      return html``;
    }

    let fullSizePhoto = html``;
    if (this.photoId !== undefined) {
      const photoId = this.photoId;
      const exitUrl = `${this.pageId}/${this.category}`;

      fullSizePhoto = html`
        <vb-photo photoId="${photoId}" exitUrl="${exitUrl}"></vb-photo>`;
    }

    return html`
      ${fullSizePhoto}
      <section id="photos" class="show">        
        <div class="frame">
        <header class="photos-header">
          <h2 class="photo-title">${this.albumTitle}</h2>
        </header>     
          ${this.albumTiles}                                    
      </section>`;
  }

  private bindPubSubEvents() {
    PubSub.subscribe(
      Signal.UrlChange,
      (category: string, page: { name: string; param: string }) => {
        if (page.name !== this.pageId) {
          return;
        }
        const params = this.getUrlParams(page.param);

        this.fadeOut(() => {
          this.category = params.category;
          this.photoId = params.photoId;
          this.fadeIn();
        });
      }
    );

    PubSub.subscribe(Signal.AppSync, (_: string, state: State) => {
      const categories = state.pages.photosAndVideos.photos.categories;
      if (!categories) {
        return;
      }
      const contentIds = categories.map((photo: Photo) => photo.id);

      let photosById: { [key: string]: Photo } = {};
      categories.forEach((photo: Photo) => {
        photosById[photo.id] = photo;
      });
      this.photosById = photosById;
      this.setAlbumTiles(contentIds);
      this.setAlbumTitle();
    });
  }

  private unbindPubSubEvents() {
    PubSub.unsubscribe(Signal.AppSync);
  }

  private fadeIn() {
    window.scrollTo(0, 0);
    const photosEl: HTMLElement = this.shadowRoot.querySelector('#photos');
    photosEl.classList.add('show');
  }

  private fadeOut(callback?: Function) {
    const photosEl: HTMLElement = this.shadowRoot.querySelector('#photos');
    photosEl.classList.remove('show');
    if (callback) {
      setTimeout(callback.bind(this), fadeDuration);
    }
  }

  private getPhotos(category?: string) {
    PubSub.publish(Signal.PhotosRequest, category);
  }

  private getPhotoPath(
    category: string,
    id: string,
    isThumbnail = true
  ): string {
    const photoId = isThumbnail ? `${id}/${id}_small.jpg` : `${id}/${id}.png`;
    const path = `${Config.url.server.photo.media}/${category}/${photoId}`;
    return encodeURI(path);
  }

  private getUrlParams(urlParam: string): PhotoUrlParams {
    const param = decodeURIComponent(urlParam).split('/');
    return {
      category: param[0],
      photoId: param[1],
    };
  }

  private setAlbumTiles(photoIds: string[]) {
    const isPhoto = this.category !== undefined && this.category.length > 0;
    const numberOfColumns = isPhoto ? 4 : 2;
    const photoIdsByRow: string[][] = [];
    let accumulator: string[] = [];

    photoIds.forEach((id: string, index: number) => {
      if (index !== 0 && index % numberOfColumns === 0) {
        photoIdsByRow.push(accumulator);
        accumulator = [id];
      } else {
        accumulator.push(id);
      }
    });
    if (accumulator.length > 0) {
      photoIdsByRow.push(accumulator);
    }

    this.albumTiles = photoIdsByRow.map(
      (photos: string[]) => html`
        <div class="photo-categories">
          ${photos.map((key: string) => {
            const { category, id, title } = this.photosById[key];

            const description = 'Lorem Ipsum';
            const categoryId = encodeURIComponent(category.toLowerCase());
            const url = this.getPhotoPath(category, id);
            const href = isPhoto
              ? `${this.pageId}/${categoryId}/${id}`
              : `${this.pageId}/${categoryId}`;

            if (isPhoto) {
              return html`
                <div class="photo-thumbnail">
                  <vb-photo-thumbnail
                    src="${url}"
                    href="${href}"
                  ></vb-photo-thumbnail>
                </div>
              `;
            }

            return html`
              <div class="photo-category">
                <vb-photo-category
                  photoTitle="${title}"
                  description="${description}"
                  name="${category}"
                  src="${url}"
                  href="${href}"
                ></vb-photo-category>
              </div>
            `;
          })}
        </div>
      `
    );
  }

  private setAlbumTitle() {
    this.albumTitle = this.category ? this.category : 'Albums';
  }
}

customElements.define('vb-photos', PhotosWebComponent);
