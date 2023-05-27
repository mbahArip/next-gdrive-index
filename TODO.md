# /
- ~~Override opengraph using banner image~~
- ~~Render readme file~~
- ~~Copy folder url~~
- ~~Copy file direct url~~
- ~~Download file url~~
- ~~Index password~~

# /:path
- ~~Override opengraph using banner image / thumbnail image~~
- ~~Render readme file~~
- ~~Copy folder url~~
- ~~Copy file direct url~~
- ~~Download file url~~
- ~~Password protected~~
  - Issues: Return 500 error if it's wrong password
- File Preview
  - 3D > 3DPreview
  - Audio > AudioPreview
  - Archive > UnknownPreview
  - RichText > MarkdownPreview
  - OfficeWord > OfficePreview
  - OfficeExcel > OfficePreview
  - OfficePowerPoint > OfficePreview
  - PDF > PDFPreview
  - Database > UnknownPreview
  - Image > ImagePreview
  - Code > CodePreview
  - Text > TextPreview
  - Video > VideoPreview
  - Font > UnknownPreview
  - Default > UnknownPreview
  - Binary > UnknownPreview

# /download/:path
- ~~Download file based on path~~
- ~~Validate path~~
- Protected file
- Token based for protected file