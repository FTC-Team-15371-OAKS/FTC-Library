# Resource files

Approved resource files live here, organized by category and resource id:

```text
resources/<category-id>/<resource-id>/<file>
```

Categories:

- `engineering-portfolios`
- `cad-models`
- `programming`
- `electronics`
- `documentation`
- `tools-resources`

Every local file must be referenced by the `files` array for its resource in
`data/resources.json`:

```json
{
  "name": "Robot assembly (STEP)",
  "path": "resources/cad-models/team-15371-swerve-drive/robot.step",
  "type": "STEP"
}
```

Run `npm run validate` after adding or moving files. The validator checks that every path
exists, stays inside `resources/`, and matches the resource metadata.

For files larger than GitHub's practical repository limits, use a public release, drive,
or Onshape link in the resource's `links` array instead of committing the file. Do not use
Git LFS for files that must be served directly by GitHub Pages.
