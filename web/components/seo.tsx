import Head from "next/head";
import { WEBSITE_URL } from "constants/constants";
import {
  META_DESCRIPTION,
  META_IMAGE,
  META_KEYWORDS,
  META_TITLE,
} from "constants/config";
import { useSettings } from "contexts/settings/settings.context";

type Props = {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
};

export default function SEO({
  title,
  description = META_DESCRIPTION,
  image = META_IMAGE,
  keywords = META_KEYWORDS,
}: Props) {
  const { settings } = useSettings();
  const projectTitle = settings?.title || META_TITLE;
  const currentURL = WEBSITE_URL;
  const siteTitle = title ? title + " | " + projectTitle : projectTitle;

  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:type" content="Website" />
      <meta name="title" property="og:title" content={siteTitle} />
      <meta
        name="description"
        property="og:description"
        content={description}
      />
      <meta name="author" property="og:author" content={currentURL} />
      <meta property="og:site_name" content={currentURL} />
      <meta name="image" property="og:image" content={image} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content={currentURL} />
      <meta name="twitter:creator" content={currentURL} />
      <meta name="twitter:image" content={image} />
      <link rel="icon" href={settings?.favicon || "/favicon.png"} />
    </Head>
  );
}
