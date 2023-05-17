![next-gdrive-index](./public/og.png)

## Status

Basic features are working now, can be used for daily use.  
You can check the demo [here](https://drive.mbaharip.com).

**Development will be paused for a few weeks, I will resume the project as soon as possible.**

## What is this?
`next-gdrive-index` is an indexer for Google Drive, it's a simple project that I made to index my files in Google Drive.  
It's aim to simplify the process of sharing files using Google Drive, and also implements some features that I think is useful for sharing files.

This project are **HEAVILY INSPIRED** by [onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index) by SpencerWooo.

### Why I made this?
I know there already some Google Drive indexer out there, but all of them are  using **Cloudflare** worker.  
I've tried to use it, but the speed isn't that great for me.  
Currently I'm using SpencerWooo's onedrive index, and it's working perfectly for me from usage perspective and speed.

But, if I compare the price between these two services, Google Drive still cheaper than Onedrive.  
For 100GB plan, Google Drive is IDR 269.000 / ~$18 USD annually, and Onedrive is IDR 319.000 / ~$21 USD annually.  
For free plan, Google Drive offering 15GB of storage, and Onedrive offering 5GB of storage.

I know there are a lot of people selling cheap edu account for Google Drive and Onedrive, but most of the time those account doesn't last long, especially Google Drive account. So I want to do it legit without buying cheap edu account or anything similar this time.

## Features
### Navigate through your Google Drive files and folders.
You can navigate through your Google Drive files and folders, just like you're browsing your local files.  
You can also set the root folder, so you can share only specific folder in your Google Drive.

### Theme support.
Choose your side!

### Site wide password protection.
You can lock the site so only those who know the password can access it.  
NOTE: This only protect the site, not the files. The files are still accessible if you know the link.

### Search for files and folders.
We implement native search for files and folders, so you can search for files and folders easily.

### File preview for some file types.
You can preview some file types directly from the browser, without downloading it first.  
Most files are Images, Videos, Audio, Markdown, and PDF. (I'm still adding more file types)

### Direct download for files.
Download files directly from index site without opening Google Drive.

### Raw file link for files.
You can use the raw file link for hosting your web project assets or comments on forum.

### Embed your readme file for folder.
You can embed your readme file for folder, so you can add some description for your folder.  
Simply upload `.readme.md` on your folder, and it will be displayed on the folder page.

### Override folder OpenGraph image.
You can override the folder OpenGraph image by uploading `.banner.(png/jpg/jpeg/webp/svg)` on your folder.

## Credits
- [onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index) by SpencerWooo for the inspiration and also some file type helpers.

---

## Known Issues
- ~~Fetching files from Google Drive API take too much time, it triggers 504 Error on Vercel.~~
- ~~Can't download big files, because of Vercel's 4.5MB limit for serverless function.~~ (Implement redirect to Google Drive download link instead of using Vercel serverless function for files bigger than 4MB)
  - Need to set the folder to public, so it can be downloaded directly from Google Drive.
  - The way to get files are changed because of this, now it's using the file name, and 8 first character of file id for hiding the id so no one can access it via Google Drive.
  - All id and webContentLink are now encrypted using AES-128-CBC.
- Protected folder cause long response time, because it need to fetch the file / folder first > fetch each of the parents till root > check if it's inside protected folder > then checking the password.
- Download might show scan warning, because it's using Google Drive's direct download link. 

## TODO
Todo list are moved to [here](./TODO.md).
