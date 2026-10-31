# FTC-Library

A centralized, community-maintained library of FTC engineering resources. Teams can
browse portfolios, CAD models, programming libraries, electronics guides, and
documentation, then submit their own work through GitHub.

The site is built with HTML, CSS, and vanilla JavaScript on GitHub Pages. Resource
metadata lives in JSON. There is no custom backend and no account system.

**Expected site URL once GitHub Pages is enabled:**
`https://ftc-team-15371-oaks.github.io/FTC-Library/`

## Features

- Browse resources by category, season, and team.
- Client-side search across names, descriptions, team numbers, seasons, categories,
  licenses, and tags.
- Shareable filter URLs and direct resource links.
- Resource detail view with attribution, license, links, and local files.
- Submission form that generates a prefilled GitHub issue and downloadable metadata JSON.
- Structured GitHub issue template for contributors who prefer GitHub directly.
- JSON validation in CI to catch broken references and missing files.
- No dependencies, no build step, no external fonts or trackers.

## Resource categories

- Engineering Portfolios
- CAD Models
- Programming
- Electronics
- Documentation
- Tools and Resources

## How a submission works

1. A contributor fills out `submit.html` or opens the GitHub issue form.
2. The site builds a GitHub issue with the metadata and opens it in a new tab.
3. The contributor attaches files to the issue or pastes public links.
4. A maintainer reviews attribution, licensing, category, and access links.
5. Approved files are committed under `resources/` and the resource is added to
   `data/resources.json`.
6. The library page reads the updated JSON and the resource becomes searchable.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full review and merge workflow.

## Project structure

```text
.
├── index.html                  # Searchable resource library
├── submit.html                 # Submission form and GitHub issue builder
├── about.html                  # Mission, workflow, and guidelines
├── data/
│   └── resources.json          # Categories and approved resource metadata
├── resources/                  # Approved local resource files
├── schema/
│   └── resources.schema.json   # JSON Schema for the library data
├── scripts/
│   └── validate-resources.mjs  # Dependency-free data and file validator
├── assets/
│   ├── css/styles.css
│   ├── img/favicon.svg
│   └── js/
│       ├── config.js           # Repository and fallback configuration
│       ├── site.js             # Shared navigation, toast, and copy helpers
│       ├── app.js              # Search, filters, cards, and resource dialog
│       └── submit.js           # Form preview, issue generation, JSON export
└── .github/
    ├── ISSUE_TEMPLATE/
    ├── PULL_REQUEST_TEMPLATE.md
    └── workflows/validate.yml
```

## Local development

The site fetches `data/resources.json`, so it must be served over HTTP rather than opened
as a `file://` URL.

```bash
npm run serve
# open http://localhost:8080
```

Validate the resource data and referenced local files:

```bash
npm run validate
```

There are no npm dependencies to install.

## Adding an approved resource

1. Put files in a folder named after the resource id:

   ```text
   resources/cad-models/team-15371-swerve-drive/robot.step
   resources/cad-models/team-15371-swerve-drive/robot.stl
   ```

2. Add the resource to `data/resources.json`:

   ```json
   {
     "id": "team-15371-swerve-drive",
     "name": "Swerve Drive CAD",
     "description": "A complete swerve module and chassis CAD package with a Bill of Materials and assembly notes.",
     "category": "cad-models",
     "season": "2025-26",
     "teamNumber": "15371",
     "teamName": "OAKS",
     "source": "https://github.com/example/project",
     "attribution": "Created by FTC Team 15371 OAKS",
     "license": "CC BY 4.0",
     "tags": ["swerve", "drivetrain", "cad"],
     "links": [
       {
         "label": "View build notes",
         "url": "https://example.com/build-notes"
       }
     ],
     "files": [
       {
         "name": "Robot assembly (STEP)",
         "path": "resources/cad-models/team-15371-swerve-drive/robot.step",
         "type": "STEP"
       }
     ],
     "addedAt": "2026-10-31"
   }
   ```

3. Update the top-level `updated` date if needed.
4. Run `npm run validate`.
5. Open a pull request.

The validator checks required fields, unique ids, valid categories, date formats, URL
protocols, local file paths, and unexpected keys. The same command runs in GitHub Actions.

## Data model

Each resource contains:

| Field | Required | Notes |
| --- | --- | --- |
| `id` | Yes | Lowercase slug, unique across the library. |
| `name` | Yes | Resource title. |
| `description` | Yes | 20-1000 characters. |
| `category` | Yes | Must match a category id in the same file. |
| `season` | Yes | For example `2025-26`, `Every season`, or `Multiple seasons`. |
| `teamNumber` | Yes | String of 1-6 digits, or `null` for an organization resource. |
| `teamName` | Yes | Team or organization name, or `null`. |
| `source` | Yes | Original source URL or `null`. |
| `attribution` | Yes | Credit for the creator or original source. |
| `license` | Yes | License name or terms. |
| `tags` | Yes | Up to 12 search tags. |
| `links` | Yes | Array of `{ "label", "url" }` objects. May be empty if files exist. |
| `files` | Yes | Array of `{ "name", "path", "type" }` objects. May be empty if links or source exist. |
| `addedAt` | Yes | `YYYY-MM-DD`. |

The full schema is in [`schema/resources.schema.json`](schema/resources.schema.json).

## Repository setup

Before the submission flow is fully wired up on GitHub:

1. Enable **Issues** under repository settings.
2. Create an issue label named `resource-submission`. The website and issue form apply it
   to new submissions.
3. Enable GitHub Pages using the deployment steps below.

## Deployment

The repository is designed to be served directly from the root of the `main` branch:

1. Open the repository settings on GitHub.
2. Go to **Pages**.
3. Set **Source** to **Deploy from a branch**.
4. Choose the `main` branch and the `/ (root)` folder.
5. Save.

The `.nojekyll` file tells GitHub Pages to serve the static files as-is. No build step or
environment variables are required.

The validation workflow runs on every push to `main` and every pull request. If validation
fails, check the workflow log and run `npm run validate` locally.

## Licensing and attribution

Site code is licensed under the [MIT License](LICENSE). Resources keep the licenses chosen
by their creators. The library does not relicense third-party work; it records attribution
and links to the original source where applicable.

FTC-Library is an independent community project. It is not affiliated with or endorsed by
FIRST.
