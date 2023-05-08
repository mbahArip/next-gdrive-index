# Todo
Detailed what I need to do for this project.  
This is just a reminder for me, so I don't forget what I need to do.

Probably also include some ideas that I want to implement in the future.

## Frontend
### General
- ~~Site wide password protection~~
- Migrate to app directory (?)

### Navbar `8/8 Completed`
- ~~Search for files~~
  - ~~Open / Close search modal~~
  - ~~Search for files or folder~~
  - ~~Configurable search limit~~
  - ~~Close search modal when click outside of modal~~
- ~~Theme~~
  - ~~Switch theme~~
  - ~~Store theme preference in local storage~~
- ~~Navbar menu~~

### Layout Container `10/10 Completed`
This part contains only breadcrumb and view selection.

- ~~Breadcrumb~~
  - ~~Fetch breadcrumb~~
  - ~~Navigate through breadcrumb~~
  - ~~Limit breadcrumb~~
  - ~~Add `...` if breadcrumb is too long~~
  - ~~Add ellipsis if current file name is too long~~
  - ~~Configurable breadcrumb limit~~
- ~~Layout view~~
  - ~~Grid view~~
  - ~~List view~~
  - ~~Store view preference in local storage~~
  - ~~Close view selection when click outside~~

### Home `/` | `4/5 Completed`
- ~~Fetch files~~
- ~~Fetch readme if exist~~
- ~~Fetch banner if exist~~
- ~~Pagination~~
- Protected folder

### Folder `/folder/:id` | `5/6 Completed`
- ~~Check if folder exist~~
- ~~Fetch files~~
- ~~Fetch readme if exist~~
- ~~Fetch banner if exist~~
- ~~Pagination~~
- Protected folder

### File `/file/:id` | ``

## Backend
### General
Since Google Drive direct download need the file to be public, I implement the `partial file id` to keep people from directly accessing the Google Drive itself, and also encrypt the `id` and `webContentLink` from Google Drive API to ensure that no one can access the file directly from Google Drive.

- ~~Change `fileId` to `{file name}:{partial file id}`~~
- ~~Encrypt `id` and `webContentLink`~~
- ~~Making sure response time is fast enough. Aim for max 1.5s.~~
  - ~~Fetch root folder `600~900ms`~~
  - ~~Fetch file or folder `700~1400ms`~~
  - ~~Fetch breadcrumb `900~1500ms`~~
  - ~~Fetch readme `1100~1200ms`~~
    - ~~Fetch readme from specific folder `1200~1500ms`~~
  - ~~Fetch banner `500-800ms`~~
    - ~~Fetch banner from specific folder `500~800ms`~~
  - Protect folder

### Fetch files `/api/files` | `16/17 Completed`

- ~~Fetch file~~
- ~~Fetch folder~~
- ~~Paginated~~
- ~~Fetch info regarding readme file~~
- ~~Fetch info regarding banner file~~
- ~~Fetch info regarding password file~~ (Not used yet)
- Download file
  - ~~Redirect to Google Drive download link instead of using Vercel serverless function for files bigger than 4MB~~
  - ~~Only allow for files~~
  - Files inside protected folder
- ~~Get thumbnail for files~~
- ~~Get banner inside folder~~
  - ~~Only if banner file is inside the folder~~
  - ~~Redirect to Google Drive download link instead of using Vercel serverless function for files bigger than 4MB~~
  - ~~Check if banner file is image~~
- ~~Generate breadcrumb~~
  - ~~On folder~~
  - ~~On file~~
  - ~~Hide root folder~~
  - ~~Limiting breadcrumb length~~

### Get readme data `/api/readme` | `2/2 Completed`
This API route doesn't need authorization, because it's only used for getting readme data.

- ~~Get root folder readme~~
- ~~Get specific folder readme~~

### Get banner file id `/api/banner` | `2/2 Completed`
This API route doesn't need authorization, because it's only used for getting banner file id for Opengraph Image.

- ~~Get root folder banner~~
- ~~Get specific folder banner~~

### Search for files `/api/search` | `2/2 Completed`
- ~~Search for files and folder~~
- ~~Limit search result~~