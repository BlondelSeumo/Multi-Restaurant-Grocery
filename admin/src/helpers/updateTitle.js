import { PROJECT_NAME } from 'configs/app-global';

export const updateTitle = (title) => {
  if (title?.length) {
    document.title = title;
  } else {
    document.title = PROJECT_NAME;
  }
};
