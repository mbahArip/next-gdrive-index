![next-gdrive-index](./public/og.png)

## Status
### Project halted at the moment.
Found out it's not cfworker fault, but Google Drive API is the one that slow.  
It took 500ms to 1s response time to fetch files, took longer if it's inside protected folder.
It can be faster if I'm using `@upstash/redis` to cache the response, but for free tier it capped on 10k request per day. (It should've enough for most people)

I'm currently working on a workaround for this, but it's not a priority for me at the moment.

~~Currently still in development, ~~but main features are already working as intended.~~ Preview and download files are not working because of Vercel's limit for serverless function.  Working on a workaround for this.~~

~~You can check the demo [here](https://drive.mbaharip.com).~~

## What is this?
`next-gdrive-index` is an indexer for Google Drive, it's a simple project that I made to index my files in Google Drive.  
It's aim to simplify the process of sharing files using Google Drive, and also implements some features that I think is useful for sharing files.

This project are **HEAVILY INSPIRED** by [onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index) by SpencerWooo.

### Why?
I know there already some Google Drive indexer out there, but all of them are  using **Cloudflare** worker.  
I've tried to use it, but the speed isn't that great for me.  
Currently I'm using SpencerWooo's onedrive index, and it's working perfectly for me from usage perspective and speed.

But, if I compare the price between these two services, Google Drive still cheaper than Onedrive.  
For 100GB plan, Google Drive is IDR 269.000 / ~$18 USD annually, and Onedrive is IDR 319.000 / ~$21 USD annually.  
For free plan, Google Drive offering 15GB of storage, and Onedrive offering 5GB of storage.

I know there are a lot of people selling cheap edu account for Google Drive and Onedrive, but most of the time those account doesn't last long, especially Google Drive account. So I want to do it legit without buying cheap edu account or anything similar this time.

## Credits
- [onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index) by SpencerWooo for the inspiration and also some file type helpers.

---

## Known Issues
- Fetching files from Google Drive API take too much time, it triggers 504 Error on Vercel.
- ~~Can't download big files, because of Vercel's 4.5MB limit for serverless function.~~ (Implement redirect to Google Drive download link instead of using Vercel serverless function for files bigger than 4MB)
  - Need to set the folder to public, so it can be downloaded directly from Google Drive.
  - The way to get files are changed because of this, now it's using the file name, and 8 first character of file id for hiding the id so no one can access it via Google Drive.
  - All id and webContentLink are now encrypted using AES-128-CBC.
- Protected folder cause long response time, because it need to fetch the file / folder first > fetch each of the parents till root > check if it's inside protected folder > then checking the password.
- Download might show scan warning, because it's using Google Drive's direct download link.

## TODO
- [ ] Aim for max 1.5s response time for every API routes
  - Fetch all routes - 600~900ms
  - Fetch file or folder - 700~1400ms
- [x] Navigate through folders
- [ ] File preview
  - [x] Audio
  - [x] Code
  - [x] Default
  - [x] Image
  - [x] Markdown
  - [ ] 3D Model
  - [ ] Office files (Word, Excel, PowerPoint)
  - [x] PDF
  - [x] Text
  - [x] Video
- [x] Search for files
- [x] Direct view the files
- [x] Download files
- [x] Render Readme file
- [x] Password protection
  - [x] Create token hash for sharing protected ~~files that valid for x hours~~ 
  - [ ] Implement time limit for token
- [x] ~~Pretty path URL~~ ~~(Not possible, since Google Drive allowing multiple files with same name)~~ (Kinda pretty now, it consist of the file name, then 8 character of file id for security) 