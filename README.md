// LOGO OR BANNER GOES HERE

## Status
Currently still in development, ~~but main features are already working as intended.~~ Preview and download files are not working because of Vercel's limit for serverless function.  Working on a workaround for this.

You can check the demo [here](https://drive.mbaharip.com).

## What is this?
gudora-index is an indexer for Google Drive, it's a simple project that I made to index my files in Google Drive.  
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

## Features
- Share files without any hassle
- Preview files before downloading
- Render readme file inside the folder
- Protect your folder with password
- Search for files easily
- Direct view or download files
  - Can be used for hosting assets for your website

## How to use
### Prerequisites
- Google Drive account
- Google Drive API key
- Vercel account

### Setup
1. Fork [gudora-index/mbaharip](https://github.com/mbaharip/gudora-index) repository
2. Open [Setup page](https://drive.mbaharip.com/setup) and follow the instructions
3. Change the `site.config.js` to your liking
4. Deploy your forked repository to Vercel
5. Open your Vercel project, and go to **Settings > Environment Variables**
6. Add `ENCRYPTION_KEY`, `JWT_KEY`, and `NEXT_PUBLIC_DOMAIN` environment variables
7. Redeploy your project
8. Done!

## Credits
- [onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index) by SpencerWooo for the inspiration and also some file type helpers.

---

## Known Issues
- Fetching files from Google Drive API take too much time, it triggers 504 Error on Vercel.
- Can't download big files, because of Vercel's 10MB limit for serverless function.

## TODO
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
- [ ] ~~Pretty path URL~~ (Not possible, since Google Drive allowing multiple files with same name)