# Personal Website (Static, GitHub Pages Ready)

This is a static personal website with all content loaded from one file:

- `data/site-data.json`

## Sections included

1. Profile photo + bio + CV + relevant links
2. Education
3. Professional experience
4. Research experience
5. Publications
6. Attended conferences and workshops
7. World travel map
8. Music albums with links

## How to edit your information

Open `data/site-data.json` and update:

- `profile`
- `education`
- `professionalExperience`
- `researchExperience`
- `publications`
- `attendedConferencesWorkshops`
- `travelPlaces`
- `musicAlbums`

## Replace your profile photo and CV

1. Put your photo inside `assets/` (for example: `assets/my-photo.jpg`)
2. Put your CV PDF inside `assets/` (for example: `assets/cv.pdf`)
3. Update paths in `data/site-data.json`:
   - `profile.photo`: `assets/my-photo.jpg`
   - `profile.cv`: `assets/cv.pdf`

## Run locally

You can open `index.html` directly, but some browsers block JSON loading from local files.
Best: run a local server.

Example with Python:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000`

## Deploy to GitHub Pages

1. Create a GitHub repository and push this folder.
2. In GitHub: Settings -> Pages.
3. Under Build and deployment:
   - Source: Deploy from a branch
   - Branch: `main` (or `master`), folder `/ (root)`
4. Save.
5. Your site will be available at:
   - `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

If you want to host this as your main personal page (`https://YOUR-USERNAME.github.io/`), create the repository named exactly:

- `YOUR-USERNAME.github.io`
