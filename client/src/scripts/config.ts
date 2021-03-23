const serverUrl = 'http://localhost:4040/server';

interface navLabel {
  pageId: string;
  label: string;
  needsLogin?: true;
}

const navigation: { [key: string]: navLabel } = {
  journal: {
    pageId: 'home',
    label: 'Journal',
  },
  photosAndVideos: {
    pageId: 'photos-and-videos',
    label: 'Photos & Videos',
  },
  magazine: {
    pageId: 'magazine',
    label: 'Magazine',
  },
  junk: {
    pageId: 'junk',
    label: 'Junk',
  },
};

export const Config = {
  size: {
    backgroundMax: 1280,
    mainHeaderSplash: 200,
  },
  navigationDefault: 'home',
  navigation,
  style: {
    fadeDuration: 200,
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
        categoryPhotos: `${serverUrl}/categoryPhotos`,
        media: `/resources/photos`,
      },
    },
  },
};
