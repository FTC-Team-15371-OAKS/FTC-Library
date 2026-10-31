# Contributing to FTC-Library

Thanks for helping build a shared FTC engineering library. Contributions can be new
resources, corrections to existing metadata, site improvements, or documentation.

## Before you submit

- Submit only work you created or have permission to share.
- Credit the creator and state a license.
- Remove secrets, API keys, private student information, and anything that is not intended
  to be public.
- Prefer stable public links over temporary share links.
- Keep file sizes reasonable. For very large CAD packages or videos, link to a release,
  public drive, or Onshape document instead of committing a huge file.

## Contributor workflow

### Option A: Use the website form

1. Open `submit.html` on the deployed site.
2. Fill in the resource metadata.
3. Click **Open GitHub issue**.
4. Attach files to the issue or paste public links.
5. Submit the issue and respond to maintainer questions.

### Option B: Use the GitHub issue form

Open a new issue and choose **Submit a resource**. The structured form collects the same
metadata. Attach files after the issue is created.

### Option C: Open a pull request

Use this when you already know the repository layout and want to add the resource directly.

1. Add files under `resources/<category-id>/<resource-id>/`.
2. Add the resource object to `data/resources.json`.
3. Run `npm run validate`.
4. Open a pull request using the repository template.

## Required metadata

Every approved resource needs:

- Resource name
- Team number, or `null` for an organization resource
- Season
- Category
- Description
- Attribution / original source
- License
- At least one link, local file, or source URL
- Date added

Accepted categories:

- `engineering-portfolios`
- `cad-models`
- `programming`
- `electronics`
- `documentation`
- `tools-resources`

The full data schema is in [`schema/resources.schema.json`](schema/resources.schema.json).

## File storage

Use this layout:

```text
resources/<category-id>/<resource-id>/<file>
```

Example:

```text
resources/programming/team-15371-command-template/
resources/programming/team-15371-command-template/TeamCode.zip
resources/programming/team-15371-command-template/README.md
```

Guidelines:

- `resource-id` must match the `id` in `data/resources.json`.
- Prefer lowercase, hyphen-separated file and folder names.
- Keep original formats where useful: PDF, STEP, STL, ZIP, images, Markdown.
- Include a license file in the resource folder when the license requires it.
- Do not use Git LFS for files that need to be served directly by GitHub Pages.
- The validator rejects local file paths outside `resources/` and paths containing `..`.

## Maintainer review checklist

Before approving a submission:

- [ ] The resource is relevant to FTC and fits a category.
- [ ] The team number, team name, and season are accurate.
- [ ] The description clearly explains what the resource is and when it is useful.
- [ ] Attribution credits the creator and notes adaptations.
- [ ] The license is stated and compatible with public hosting.
- [ ] Links are public, stable, and use `https` where possible.
- [ ] Files are safe to host and do not contain secrets or private information.
- [ ] The resource id is unique and follows the slug format.
- [ ] Local file paths exist and are inside `resources/`.
- [ ] `npm run validate` passes.
- [ ] The top-level `updated` date is current.

If a resource is missing licensing or attribution, ask the contributor to clarify before
merging.

## Adding an approved resource

1. Create `resources/<category-id>/<resource-id>/` and add the approved files.
2. Add the resource object to `data/resources.json`.
3. Add each local file to the `files` array with a label, path, and optional type.
4. Add external links to the `links` array.
5. Update the top-level `updated` field.
6. Run:

   ```bash
   npm run validate
   ```

7. Commit the files and metadata together.

## Site development

The site is intentionally dependency-free:

- Shared styles: `assets/css/styles.css`
- Library search and rendering: `assets/js/app.js`
- Submission form and issue builder: `assets/js/submit.js`
- Shared navigation and utilities: `assets/js/site.js`
- Site and repository config: `assets/js/config.js`

Run locally:

```bash
npm run serve
```

Validate data:

```bash
npm run validate
```

Keep JavaScript compatible with current evergreen browsers. Do not add a build step,
external CDN dependency, analytics script, or tracking without discussion first.

## Pull requests

- Keep changes focused.
- Explain what changed and why.
- Include the validation command result in the pull request description.
- For resource additions, include the source issue or confirm the creator gave permission.
- Do not commit generated files, caches, or `node_modules`.

## Community expectations

Be direct, kind, and specific. Teams are at different experience levels, and a resource
that seems obvious to one team may be exactly what another team needs. Review the
submission, not the team.
