# Todo
Detailed what I need to do for this project.  
This is just a reminder for me, so I don't forget what I need to do.

Probably also include some ideas that I want to implement in the future.

## Frontend
### General

### Navbar `8/8 Completed`
- [x] Responsive
- [x] Search
  - [x] Open / Close search modal
  - [x] Search for files or folder
  - [x] Configurable search limit
  - [x] Close search modal when click outside of modal
- [x] Theme
  - [x] Switch theme
  - [x] Store theme preference in local storage
- [x] Navbar menu

### View bar (Top bar) `9/10 Completed`
This part contains only breadcrumb and view selection.
- [x] Breadcrumb
  - [x] Fetch breadcrumb
  - [x] Navigate through breadcrumb
  - [x] Limit breadcrumb
  - [x] Add `...` if breadcrumb is too long
  - [ ] Add ellipsis if current file name is too long
  - [x] Configurable breadcrumb limit
- [x] Layout view
  - [x] Grid view
  - [x] List view
  - [x] Store view preference in local storage
  - [x] Close view selection when click outside

### Home `/` | `4/5 Completed`
- [x] Fetch files
- [x] Fetch readme if exist
- [x] ~~Fetch banner if exist~~ Fetch banner in server side for Opengraph Image
- [x] Pagination
- [ ] Protected root folder

### Folder `/folder/:id` | ``
- [ ] Server side check if folder exist, if not redirect to 404 page
- [ ] Fetch files
- [ ] Fetch readme if exist
- [ ] Fetch banner in server side for Opengraph Image
- [ ] Protected folder

## Backend
### General
Since Google Drive direct download need the file to be public, I implement the `partial file id` to keep people from directly accessing the Google Drive itself, and also encrypt the `id` and `webContentLink` from Google Drive API to ensure that no one can access the file directly from Google Drive.
- [x] Change `fileId` to `{file name}:{partial file id}`
- [x] Encrypt `id` and `webContentLink`
- [x] Making sure response time is fast enough. Aim for max 1.5s.
  - [x] Fetch root folder `600~900ms`
  - [x] Fetch file or folder `700~1400ms`
  - [x] Fetch breadcrumb `900~1500ms`
  - [x] Fetch readme `1100~1200ms`
  - [x] Fetch banner `500-900ms`
  - [ ] Protect folder

### Fetch files `/api/files` | `14/17 Completed`
- [x] Fetch file
- [x] Fetch folder
- [x] Paginated
- [x] Fetch info regarding readme file
- [x] Fetch info regarding banner file
- [x] Fetch info regarding password file (Not used yet)
- [ ] Download file
  - [x] Redirect to Google Drive download link instead of using Vercel serverless function for files bigger than 4MB
  - [x] Only allow for files
  - [ ] Files inside protected folder
- [x] Get thumbnail for files
- [ ] Get banner inside folder
  - [x] Only if banner file is inside the folder
  - [ ] Redirect to Google Drive download link instead of using Vercel serverless function for files bigger than 4MB
  - [ ] Check if banner file is image
- [x] Generate breadcrumb
  - [x] On folder
  - [x] On file
  - [x] Hide root folder
  - [x] Limiting breadcrumb length

### Get readme data `/api/readme` | `1/2 Completed`
This API route doesn't need authorization, because it's only used for getting readme data.
- [x] Get root folder readme
- [ ] Get specific folder readme

### Get banner file id `/api/banner` | `2/2 Completed`
This API route doesn't need authorization, because it's only used for getting banner file id for Opengraph Image.
- [x] Get root folder banner
- [x] Get specific folder banner

### Search for files `/api/search` | `2/2 Completed`
- [x] Search for files and folder
- [x] Limit search result