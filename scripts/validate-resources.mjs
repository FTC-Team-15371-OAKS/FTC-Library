import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = path.join(root, "data", "resources.json");
const allowedIcons = new Set([
  "portfolio",
  "cad",
  "programming",
  "electronics",
  "documentation",
  "tools",
]);
const resourceKeys = new Set([
  "id",
  "name",
  "description",
  "category",
  "season",
  "teamNumber",
  "teamName",
  "source",
  "attribution",
  "license",
  "tags",
  "links",
  "files",
  "addedAt",
]);
const categoryKeys = new Set(["id", "name", "icon", "description"]);
const errors = [];
const warnings = [];

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value, min = 1, max = Infinity) {
  return (
    typeof value === "string" &&
    value.trim().length >= min &&
    value.length <= max
  );
}

function isSlug(value, max = 96) {
  return (
    typeof value === "string" &&
    value.length <= max &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
  );
}

function isHttpUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

if (!fs.existsSync(dataFile)) {
  console.error(`Missing data file: ${path.relative(root, dataFile)}`);
  process.exit(1);
}

let library;
try {
  library = JSON.parse(fs.readFileSync(dataFile, "utf8"));
} catch (error) {
  console.error(`Could not parse ${path.relative(root, dataFile)} as JSON.`);
  console.error(error.message);
  process.exit(1);
}

if (!isObject(library)) {
  addError("The library root must be a JSON object.");
}

if (library?.schemaVersion !== 1) {
  addError("schemaVersion must be the integer 1.");
}

if (!isIsoDate(library?.updated)) {
  addError("updated must be a valid YYYY-MM-DD date.");
}

if (!Array.isArray(library?.categories) || library.categories.length === 0) {
  addError("categories must be a non-empty array.");
}

if (!Array.isArray(library?.resources)) {
  addError("resources must be an array.");
}

const categories = new Map();
if (Array.isArray(library?.categories)) {
  library.categories.forEach((category, index) => {
    const where = `categories[${index}]`;
    if (!isObject(category)) {
      addError(`${where} must be an object.`);
      return;
    }
    for (const key of Object.keys(category)) {
      if (!categoryKeys.has(key)) addWarning(`${where} has an unknown key "${key}".`);
    }
    if (!isSlug(category.id, 64)) {
      addError(`${where}.id must be a short lowercase slug.`);
    } else if (categories.has(category.id)) {
      addError(`${where}.id "${category.id}" is duplicated.`);
    }
    if (!isNonEmptyString(category.name, 1, 80)) {
      addError(`${where}.name must be 1-80 characters.`);
    }
    if (!allowedIcons.has(category.icon)) {
      addError(`${where}.icon must be one of: ${[...allowedIcons].join(", ")}.`);
    }
    if (!isNonEmptyString(category.description, 1, 240)) {
      addError(`${where}.description must be 1-240 characters.`);
    }
    if (category.id && !categories.has(category.id)) {
      categories.set(category.id, category);
    }
  });
}

if (!Array.isArray(library?.resources)) {
  report();
  process.exit(errors.length ? 1 : 0);
}

const resourceIds = new Set();
let localFileCount = 0;

library.resources.forEach((resource, index) => {
  const where = `resources[${index}]`;
  if (!isObject(resource)) {
    addError(`${where} must be an object.`);
    return;
  }

  for (const key of Object.keys(resource)) {
    if (!resourceKeys.has(key)) addWarning(`${where} has an unknown key "${key}".`);
  }

  for (const key of resourceKeys) {
    if (!(key in resource)) addError(`${where} is missing required key "${key}".`);
  }

  if (!isSlug(resource.id)) {
    addError(`${where}.id must be a lowercase slug of at most 96 characters.`);
  } else if (resourceIds.has(resource.id)) {
    addError(`${where}.id "${resource.id}" is duplicated.`);
  } else {
    resourceIds.add(resource.id);
  }

  if (!isNonEmptyString(resource.name, 1, 120)) {
    addError(`${where}.name must be 1-120 characters.`);
  }

  if (!isNonEmptyString(resource.description, 20, 1000)) {
    addError(`${where}.description must be 20-1000 characters.`);
  }

  if (!categories.has(resource.category)) {
    addError(`${where}.category "${resource.category}" does not match a category id.`);
  }

  if (!isNonEmptyString(resource.season, 1, 40)) {
    addError(`${where}.season must be 1-40 characters.`);
  }

  if (
    resource.teamNumber !== null &&
    (typeof resource.teamNumber !== "string" || !/^\d{1,6}$/.test(resource.teamNumber))
  ) {
    addError(`${where}.teamNumber must be null or a 1-6 digit string.`);
  }

  if (
    resource.teamName !== null &&
    !isNonEmptyString(resource.teamName, 1, 120)
  ) {
    addError(`${where}.teamName must be null or 1-120 characters.`);
  }

  if (resource.source !== null && !isHttpUrl(resource.source)) {
    addError(`${where}.source must be null or a valid http(s) URL.`);
  }

  if (!isNonEmptyString(resource.attribution, 1, 240)) {
    addError(`${where}.attribution must be 1-240 characters.`);
  }

  if (!isNonEmptyString(resource.license, 1, 120)) {
    addError(`${where}.license must be 1-120 characters.`);
  }

  if (!isIsoDate(resource.addedAt)) {
    addError(`${where}.addedAt must be a valid YYYY-MM-DD date.`);
  }

  if (!Array.isArray(resource.tags)) {
    addError(`${where}.tags must be an array.`);
  } else {
    if (resource.tags.length > 12) {
      addError(`${where}.tags must contain at most 12 items.`);
    }
    resource.tags.forEach((tag, tagIndex) => {
      if (!isNonEmptyString(tag, 1, 32)) {
        addError(`${where}.tags[${tagIndex}] must be 1-32 characters.`);
      }
    });
  }

  if (!Array.isArray(resource.links)) {
    addError(`${where}.links must be an array.`);
  } else {
    resource.links.forEach((link, linkIndex) => {
      const linkWhere = `${where}.links[${linkIndex}]`;
      if (!isObject(link)) {
        addError(`${linkWhere} must be an object.`);
        return;
      }
      if (!isNonEmptyString(link.label, 1, 80)) {
        addError(`${linkWhere}.label must be 1-80 characters.`);
      }
      if (!isHttpUrl(link.url)) {
        addError(`${linkWhere}.url must be a valid http(s) URL.`);
      }
    });
  }

  if (!Array.isArray(resource.files)) {
    addError(`${where}.files must be an array.`);
  } else {
    resource.files.forEach((file, fileIndex) => {
      const fileWhere = `${where}.files[${fileIndex}]`;
      if (!isObject(file)) {
        addError(`${fileWhere} must be an object.`);
        return;
      }
      if (!isNonEmptyString(file.name, 1, 120)) {
        addError(`${fileWhere}.name must be 1-120 characters.`);
      }
      if (!isNonEmptyString(file.path, 1)) {
        addError(`${fileWhere}.path must be a non-empty relative path.`);
        return;
      }
      if (path.isAbsolute(file.path) || file.path.split(/[\\/]/).includes("..")) {
        addError(`${fileWhere}.path must stay inside the repository.`);
        return;
      }
      if (!file.path.startsWith("resources/")) {
        addError(`${fileWhere}.path must start with "resources/".`);
        return;
      }
      const absoluteFile = path.resolve(root, file.path);
      if (!fs.existsSync(absoluteFile)) {
        addError(`${fileWhere}.path does not exist: ${file.path}`);
      } else if (!fs.statSync(absoluteFile).isFile()) {
        addError(`${fileWhere}.path is not a file: ${file.path}`);
      } else {
        localFileCount += 1;
      }
    });
  }

  const hasLink = Array.isArray(resource.links) && resource.links.length > 0;
  const hasFile = Array.isArray(resource.files) && resource.files.length > 0;
  if (!hasLink && !hasFile && !resource.source) {
    addError(`${where} needs at least one link, file, or source URL.`);
  }
});

report();

function report() {
  const resourceCount = Array.isArray(library?.resources) ? library.resources.length : 0;
  const categoryCount = Array.isArray(library?.categories) ? library.categories.length : 0;

  for (const warning of warnings) console.warn(`warning: ${warning}`);
  for (const error of errors) console.error(`error: ${error}`);

  if (errors.length) {
    console.error(
      `\nValidation failed with ${errors.length} error${errors.length === 1 ? "" : "s"}.`
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `Validated ${resourceCount} resources across ${categoryCount} categories (${localFileCount} local files).`
  );
  if (warnings.length) {
    console.log(`${warnings.length} warning${warnings.length === 1 ? "" : "s"} found.`);
  }
}
