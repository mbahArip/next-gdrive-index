![next-gdrive-index](./public/og.png)

<p align='center'>
  <a href='https://drive-demo.mbaharip.com'>Demo</a>
  ·
  <a href='https://github.com/mbahArip/next-gdrive-index/wiki/Deploying'>Deploying Guide</a>
  ·
  <a href='https://github.com/mbahArip/next-gdrive-index/wiki/FAQ'>FAQ</a>
</p>

## Version 2 is here!

It seems there are some bugs on mobile devices that prevent the files list from rendering properly.  
So I will use this chance to upgrade the project to `Next.js 14`, use `shadcn/ui`, and also add some new features.

There also some changes on the configuration file, so make sure to read the [Migration Guide](#migration-guide) if you're upgrading from version 1.x.

Here's what changed in version 2:

### New Features

- **Theme Select**, light mode? dark mode? you choose.
- **[shadcn/ui](https://ui.shadcn.com/)**, change the UI library to `shadcn/ui`.
- **Faster Response Time**, added cache to improve the response time.
- **Revalidate Data**, data fetching now utilizing revalidate. (can be changed from config file)
  > You can manually revalidate the data by sending POST request to `/api/revalidate` with `Authorization` header set to `{{ masterKey }}`.

### Changed

- **General Layout**, New fresh look with `shadcn/ui`.
- **Download Link**, Added token that will be expired after x hour(s). (can be changed from config file)
- **Raw Link**, Raw link only available for image, video, and audio files. Raw link are recommended for hosting web project assets or comments on forum.
- **Footer**, now you can customize the footer from config file, also added support for Markdown.
- **Data Fetching**, now using `Server Actions` instead of `API Routes`.
- **Encryption**, moved to `Server Actions`.
- **Typescript Config**, target changed from `ES5` to `ES2021`.
- **Environment Variable**, now focus on Server Side Environment Variable.
  - `NEXT_PUBLIC_ENCRYPTION_KEY` changed to `ENCRYPTION_KEY`.
  - `NEXT_PUBLIC_SITE_PASSWORD` changed to `SITE_PASSWORD`.
  - `MASTER_KEY` added.
- **Configuration File**, things are changed:
  - `version` bumped to `2.0`.
  - `masterKey` moved to `Environment Variable`.
  - `apiConfig.revalidate` added.
  - `siteConfig.siteNameTemplate` added.
  - `siteConfig.siteAuthor` added.
  - `siteConfig.robots` added.
  - `siteConfig.footer` added.
  - `siteConfig.defaultAccentColor` deprecated.
  - `siteConfig.breadcrumbMax` added.
  - `siteConfig.toaster` added.
  - `siteConfig.navbarItems[number].icons` changed to `lucide icons`.
  - `siteConfig.supports` added.

### Fixed

- Rendering issue on mobile devices.

### Dependency Update

- `@iconify/react` switched to `lucide-react`.
- `@mdx-js/loader` removed.
- `@mdx-js/react` removed.
- `@next/mdx` removed.
- `@popperjs/core` removed.
- `next` updated to `^14.1.4`.
- `next-seo` removed.
- `tailwind-merge` updated to `^2.2.2`.

## What is this?

`next-gdrive-index` is an indexer for Google Drive, it's a simple project that I made to index my files in Google Drive.  
It's aim to simplify the process of sharing files using Google Drive, and also implements some features that I think is useful for sharing files.

This project are **HEAVILY INSPIRED** by [onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index) by SpencerWooo.

### Why I made this?

when I compare the price between these two services, Google Drive still cheaper than Onedrive.  
For 100GB plan, Google Drive is IDR 269.000 / ~$18 USD annually, and Onedrive is IDR 319.000 / ~$21 USD annually.  
For free plan, Google Drive offering 15GB of storage, and Onedrive offering 5GB of storage.

I know there are a lot of people selling cheap edu account for Google Drive and Onedrive, but most of the time those account doesn't last long, especially Google Drive account. So I want to do it legit without buying cheap edu account or anything similar this time.

## Features

- **Private Index**, lock the whole index site with password.
- **Folder and file protection**, you can protect your folder and files with password.
- **Readme file**, you can add readme file for your folder, so you can add some description for your folder.
- **File preview**, you can preview some file types directly from the browser, without downloading it first.
  - Image preview
  - Video preview
  - Audio preview
  - Markdown preview
  - PDF preview
  - Document preview (docx, pptx, xlsx)
  - Code preview
  - Text preview
  - Manga preview (cbz)
- **File search**, you can search for files and folders easily.
- **Direct download**, you can download files directly from index site without opening Google Drive.
- **Raw file link**, you can use the raw file link for hosting your web project assets or comments on forum.

## File Security

> This only apply if `maxFileSize` is enabled.

You need to set the file sharing permission to `Anyone with the link can view` for the files that you want to share.

**Why?** because the download link will be redirected to the Google Drive download link, and it can only be accessed if the file is shared with `Anyone with the link can view` permission.

If not, the download link will be redirected to the Google Drive web content link, and it can be accessed without sharing the file.

But this might expose the file ID, so people might be able to access the files directly from Google Drive. (But I'm sure they can't access the folder itself, only the file that are being downloaded)

## Known Issue

### File size limit

> This only apply if you're using platform that have file size limit, like Vercel.  
> If you're using VPS or other platform that doesn't have file size limit, you can disable `maxFileSize` inside config file.

File size limit causing some files can't be previewed, and the download will be redirected to the raw file link.  
**This won't be fixed**, because it's a limitation from the deployment platform itself.

### Long Response Time

From version 2.0, We are using Cache to improve the response time.  
It might take a long time for deep nested folders, but once the data is fetched, it will be cached and the response time will be faster.

I also add [revalidate](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#revalidating-data) config on page file to 5 minutes. You can change the value inside `src/app/page.tsx` & `src/app/[...rest]/page.tsx`.

~~The flow of the project are:~~

- ~~Validate the path is valid or not. (Only applied for `/...[path]`)~~
- ~~Fetch the password, readme, and files from Google Drive.~~
- ~~Show to the user.~~

~~So, if you have a lot of files in your Google Drive, it might take a long time to fetch all the files.  
To improve the response time, I added a cache to the response, so the next time you access the same path, it will be faster.~~

~~ATM, it roughly take around 600 - 2 seconds to fetch all the data on my Google Drive.~~

### Shared Drive is now supported

~~I don't have Google Shared Drive, so I can't test it and implement it.~~  
Implemented by [@loadingthedev](https://github.com/loadingthedev) [(PR #4)](https://github.com/mbahArip/next-gdrive-index/pull/4)

### No support for Google Docs, Sheets, and Slides

For now, I don't have any plan to implement this, because I think it's not necessary.  
All Google Drive files like Docs, Sheets, and Slides are hidden from the list.

**PR are welcome if you want to implement this.**

## Migration Guide

If you're upgrading from version 1.x to version 2, there are some changes that you need to do:

### Configuration File

> You can check the new Configuration Schema on `/src/schema.ts`

There are some changes on the configuration file, here's the list of changes:

- `masterKey` **REMOVED**, we don't need this anymore

- `apiConfig.rootFolder` **CHANGED**, you need to encrypt the folder ID first  
  `https://drive-demo.mbaharip.com/api/internal/encrypt?q={{ folderId }}`

- `apiConfig.proxyThumbnail` **ADDED**, default value is `true`
- `siteConfig.siteNameTemplate` **ADDED**, default value is `%s - next-gdrive-index`
- `siteConfig.siteAuthor` **ADDED**, default value is `mbahArip`
- `siteConfig.robots` **ADDED**, default value is `noindex, nofollow`
- `siteConfig.footer` **ADDED**, default value is `Powered by next-gdrive-index`
- `siteConfig.defaultAccentColor` **REMOVED**, you can set the theme from `/src/app/globals.css` (more information about [shadcn/ui theme](https://ui.shadcn.com/docs/theming))
- `siteConfig.breadcrumbMax` **ADDED**, default value is `3`
- `siteConfig.toaster` **ADDED**, default value is `{ position: "bottom-right', duration: 3000 }`
- `siteConfig.navbarItems[number].icons` **CHANGED**, you need to use [Lucide Icons](https://lucide.dev/icons) now
- `siteConfig.supports` **ADDED**, you can leave it empty if you don't want to use it

### Environment Variable

Now all the environment variable are on the server side, so you need to change the environment variable:

- `NEXT_PUBLIC_ENCRYPTION_KEY` **CHANGED** to `ENCRYPTION_KEY`
- `NEXT_PUBLIC_SITE_PASSWORD` **CHANGED** to `SITE_PASSWORD`
- `NEXT_PUBLIC_VERCEL_URL` **CHANGED** to `NEXT_PUBLIC_DOMAIN`
