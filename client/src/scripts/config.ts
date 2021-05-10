const serverUrl = 'http://localhost:4040/server';

interface navLabel {
  pageId: string;
  label: string;
  needsLogin?: true;  
  hasBrightBackground: boolean;
  showInNavigation?: boolean;
}

const navigation: { [key: string]: navLabel } = {
  journal: {
    pageId: 'journal',
    label: 'Journal',
    hasBrightBackground: true,
  },
  photosAndVideos: {
    pageId: 'photos-and-videos',
    label: 'Photos & Videos',
    hasBrightBackground: false,
  },
  magazine: {
    pageId: 'magazine',
    label: 'Magazine',
    hasBrightBackground: false,
  },
  junk: {
    pageId: 'junk',
    label: 'Junk',
    hasBrightBackground: false,
  },
};

export const Config = {
  size: {
    backgroundMax: 1280,
    mainHeaderSplash: 200,
  },
  navigationDefault: 'journal',
  navigation,
  style: {
    fadeDuration: 200,
  },
  timing: {
    fadeInLatency: 200,
  },
  url: {
    server: {
      backgrounds: `/resources/site/backgrounds`,
      journal: {
        entry: `${serverUrl}/journal`,
        list: `${serverUrl}/journals`,
        media: `/resources/journal`,
      },
      photo: {
        categories: `${serverUrl}/categoryPhotos`,
        photosForCategory: `${serverUrl}/photos`,
        media: `/resources/photos`,
      },
    },
  },
};
