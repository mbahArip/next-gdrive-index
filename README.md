![banner](/public/og.webp)

> [!IMPORTANT]  
> It is **RECOMMENDED** to generate configuration from your deployment instead of demo site  
> If you experiencing `Failed to decrypt data` error, you should try to regenerate your configuration from your deployment instead

<p align='center'>
	<a href='https://drive-demo.mbaharip.com' target='_blank'>Demo Site</a>
		·
	<a href='https://drive-demo.mbaharip.com/ngdi-internal/deploy' target='_blank'>Deploy / Version Upgrade Guide</a>
		·
	<a href='#' target='_blank'>How to Deploy (Youtube)</a>
</p>
<p align='center'>
	<img src='https://img.shields.io/github/package-json/v/mbaharip/next-gdrive-index?label=Production' alt='Demo version' />
	<img src='https://img.shields.io/github/package-json/v/mbaharip/next-gdrive-index/v2?label=Preview' alt='Dev' />
</p>

<!-- Generate TOC -->

## Table of Contents

- [What is this?](#what-is-this)
- [Why I made this?](#why-i-made-this)
- [Features](#features)
- [Known Issues](#known-issues)
  - [File size limit](#file-size-limit)
  - [No support for Google Docs, Sheets, and Slides](#no-support-for-google-docs-sheets-and-slides)
  - [No support for Shortcut](#no-support-for-shortcut)
  - [Encryption cause error](#encryption-cause-error)
  - [Can't seek on audio and video preview](#cant-seek-on-audio-and-video-preview)
  - [Shared Drive is not supported](#shared-drive-is-not-supported)
- [Might be Implemented](#might-be-implemented)
  - [Internationalization / i18n](#internationalization--i18n)
  - [Multiple drive](#multiple-drive)
  - [Authentication](#authentication)
- [Running on Local](#running-on-local)
- [How to Contribute](#how-to-contribute)
- [Support and Donations](#support-and-donations)
- [License](#license)

## What is this?

`next-gdrive-index` is a Google Drive directory index.
The aim of this project is to simplify the process of sharing files using Google Drive, and also add some features that _I think_ is useful when sharing a files.

This project are **HEAVILY INSPIRED** by [onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index) by [SpencerWooo](https://github.com/spencerwooo).

## Why I made this?

> **TLDR;** \
> It is cheaper to use Google Drive than other similar service

There are a lot cloud storage service like Onedrive, Dropbox, Mega, etc.
But, between all those service, I think Google Drive is a lot cheaper than others (at least in my region).

Here are the pricing comparison between free and cheapest plan
_Price are converted to IDR, since it's easier for me to compare this using my own currency_

| Service          | Free plan       | Paid plan | Price                  | Price to Storage                            | Transfer Quota |
| :--------------- | :-------------- | :-------- | :--------------------- | :------------------------------------------ | :------------: |
| **Google Drive** | 15GB            | 2TB       | 135k IDR<br>~112k IDR  | <u>14.8GB / 1k / mo<br>17.8GB / 1k / yr</u> |  **<u>X</u>**  |
| **Onedrive**\*\* | 5GB             | 1TB       | 96k IDR<br>80k IDR     | 10.4GB / 1k / mo<br>12.5GB / 1k / yr        |  **<u>X</u>**  |
| **Dropbox**\*    | 2GB             | 2TB       | ~191k IDR<br>~159k IDR | 10.5GB / 1k / mo<br>12.5GB / 1k / yr        |       O        |
| **MEGA**         | **<u>20GB</u>** | 2TB       | ~174k IDR<br>~145k IDR | 11.5GB / 1k / mo<br>13.8GB / 1k / yr        |       O        |

> \* Price are in USD, and there are no regional price for IDR \
> \*\* There are no 2TB plan

By using this data, I picked Google Drive instead other service.
I know there are a lot of people selling cheap education account especially for Google Drive and Onedrive, but most of the time <u>those account doesn't last long</u>.

## Features

- **Private Index**, protect the whole site with a password
- **Folder and file protection**, protect certain path with a password
- **Readme file**, add description (or whatever) inside a readme to be rendered when you open the folder
- **File preview**, preview the file before download ( Preview file size limit can be adjusted )
  - Image preview
  - Video preview
  - Audio preview
  - Document preview
  - Code / Text / Markdown preview
  - Manga preview (cbz)
- **Embed media**, embed media like video or audio to your site
- **File search**, search by the file or folder name
- **Direct download**, download directly via API route instead of google drive link ( Size limit can be adjusted )
- **Raw file link**, embed your media files
- **Light/Dark mode**, choose your side!
- **Customizable Theme**, we are using `shadcn/ui` now! you can customize your site with the theme you like
- **Links**, add social, or information link on the navbar
- **Sponsors**, using this for thing for community? add a sponsor / donate button on your navbar!

## Known Issues

### File size limit

> [!IMPORTANT]
> This only apply if `maxFileSize` is enabled / more than 0

You need to set the file sharing permission to `Anyone with the link can view` on the root folder.

**Why?**
The download link will be redirected if the file you're trying to download is bigger than the `maxFileSize`, and most of platform are limiting the response body size (ex: Vercel limit is 4MB).
If you don't set the permission, people can't access or download the file.

> [!WARNING]
> This will **expose the file ID**
> While they can view the file directly from Google Drive, they can't see or browse the folder that contains the file from Google Drive.

### No support for Google Docs, Sheets, and Slides

For now, I don't have any plan to implement this, because I think it's not necessary.

### No support for Shortcut

While I think it's important, I don't have any plan to implement this for now.

### TS video file doesn't recognized

Somehow google return the mime type as code instead of video. I don't know how to fix this, so for now you can't preview the TS video file.

### ~~Encryption cause error~~

~~It seems the configurator are generating wrong encrypted folder ID, so it will cause error when you try to access the folder.~~
Should be fixed on v2.0.4, waiting for feedback / confirmation

### ~~Can't seek on audio and video preview~~

~~It looks like you can't seek the audio and video preview, so you need to listen / watch from the beginning.~~
Fixed on v2.0.2

### ~~Shared Drive is not supported~~

~~I don't have Shared Drive, so I can't test it and implement it~~
Implemented by [@loadingthedev](https://github.com/loadingthedev) [(PR #4)](https://github.com/mbahArip/next-gdrive-index/pull/4)

## Might be Implemented

Here are things that I want, and might be implemented on the future

### Internationalization / i18n

It should be a good idea to have the site and deploying guide with multiple language support.

### Multiple drive

It's either from multiple Google Drive account with multiple Service Account, or a basic single Google Drive account with multiple root start point either in their own Drive or Shared Drive

### Authentication

Probably a good feature if you are a content creator that only want the one who subscribed to you get the files.
It might need a database, but idk if I can implement it without the need of database

## Running on Local

- **Clone the repository**
  `git clone https://github.com/mbaharip/next-gdrive-index.git`
  `cd next-gdrive-index`
- **Install required dependencies**
  `npm install`
  `yarn install`
- **Add environment file**
  - **Using Configuration**
    - Open [Deploy guide page](https://drive-demo.mbaharip.com/deploy#config)
    - Scroll to the bottom to see the configuration form
    - Fill out the form and download the file
    - Extract the `.env` file to the root folder
  - **Using example file**
    - `cp .env.example .env`
    - Fill out everything
- Run the app
  `npm run dev`
  `yarn dev`
- Check the app on `http://localhost:3000`

## How to Contribute

Want to add new feature or improve the existing one? or you find a bug and fixed it yourself?

- Please check the issue tab first to see if someone already reporting a bug, or if you want to check any new feature / enhancement that not yet implemented
- Use code base from the latest version branch instead of the `main`, since it was made for development on current version
- Create a Pull Request, and wait for me checking your code

## Support and Donations

If you think I deserve it, you can support me by:

- [Paypal (USD)](https://paypal.me/mbaharip)
- [Ko-fi (USD)](https://ko-fi.com/mbaharip)
- [Saweria (IDR)](https://saweria.co/mbaharip)

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.
