# Currently in Development
This project is currently in development, and not ready for deployment yet.

---

// LOGO OR BANNER GOES HERE

## What is this?
guDora-index is an indexer for Google Drive, it's a simple project that I made to index my files in Google Drive.  
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
TBA

## TODO
- [x] Navigate through folders
- [ ] File preview
- [x] Search for files
- [x] Render Readme file
- [ ] Password protection
  - [ ] Create token hash for sharing protected files that valid for x hours 
- [ ] ~~Pretty path URL~~ (Not possible, since Google Drive allowing multiple files with same name)