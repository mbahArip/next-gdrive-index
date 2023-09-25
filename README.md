![next-gdrive-index](./public/og.png)

<p align='center'>
  <a href='https://drive-demo.mbaharip.com'>Demo</a>
  ·
  <a href='https://github.com/mbahArip/next-gdrive-index/wiki/Deploying'>Deploying Guide</a>
  ·
  <a href='https://github.com/mbahArip/next-gdrive-index/wiki/FAQ'>FAQ</a>
</p>

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

All files fetched from Google Drive **NEED TO BE SHARED** with `Anyone with the link can view` permission.  
This is because Google Drive API can only access files that are shared with `Anyone with the link can view` permission.

But, every files `id` and `webContentLink` are encrypted with `AES-256-CBC` using your own key, so no one can access your files without the key.  
Except, if the files are larger than the `fileSizeLimit` (default: 4MB for vercel), then the download will be redirected to the raw file link.

## Known Issue

### File size limit

File size limit causing some files can't be previewed, and the download will be redirected to the raw file link.

### Long Response Time

The flow of the project are:

- Validate the path is valid or not. (Only applied for `/...[path]`)
- Fetch the password, readme, and files from Google Drive.
- Show to the user.

So, if you have a lot of files in your Google Drive, it might take a long time to fetch all the files.  
To improve the response time, I added a cache to the response, so the next time you access the same path, it will be faster.

ATM, it roughly take around 600 - 2 seconds to fetch all the data on my Google Drive.

### Shared Drive is now supported

~~I don't have Google Shared Drive, so I can't test it and implement it.~~  
Implemented by [@loadingthedev](https://github.com/loadingthedev) [(PR #4)](https://github.com/mbahArip/next-gdrive-index/pull/4)

### No support for Google Docs, Sheets, and Slides

For now, I don't have any plan to implement this, because I think it's not necessary.  
All Google Drive files like Docs, Sheets, and Slides are hidden from the list.
