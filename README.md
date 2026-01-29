# Ynotsoft Dynamic Libraries

Welcome to the **Ynotsoft** monorepo. This workspace contains a suite of high-performance, declarative React component libraries designed to streamline UI development through configuration-driven patterns.

## 📂 Monorepo Structure

Click on a library name to view its specific documentation and API reference.

- **[📝 Dynamic Form Lib](packages/dynamic-form-lib/README.md)** — Core `ynotsoft-dynamic-form` package.
- **[📊 Dynamic Grid Lib](packages/dynamic-grid-lib/README.md)** — Core `ynotsoft-dynamic-grid` package.
- **[🚀 Example App](packages/example-app/README.md)** — Sandbox for local development and HMR testing.

---

## 🛠️ Install and Development Setup

This project uses **Bun** as the primary package manager and **Vite** with custom path aliasing for Hot Module Replacement (HMR) across the workspace.

### 1. Prerequisites

- **Bun** installed: [bun.sh](https://bun.com/docs/installation)
- **Node.js**: ^v22.7.0 (Required for NPM workspace compatibility)

### 2. Install Dependencies

From the root of the repository:

```bash
# Install all dependencies and create workspace symlinks
bun install

```

### 3. Initial Build

Because the library entry points point to `/dist`, you must run an initial build so the example app can resolve dependencies:

```bash
# Build all libraries via root script
npm run build

# OR build specifically via workspaces
npm build-form # npm run build --workspace ynotsoft-dynamic-form
npm build-grid # npm run build --workspace ynotsoft-dynamic-grid
```

### 4. Start the Example App

To launch the development sandbox with HMR:

```bash
npm run example
```

> **Note on HMR:** If HMR fails when editing library code, verify that `example-app/vite.config.js` is using **Path Aliasing** to point directly to the `/src` of the libraries.

---

## 🚀 Release Workflow

We use a strictly validated GitHub Actions workflow for NPM deployment.

### 1. Regular Development

```bash
git add .
git commit -m "feat: add new field type"
git push origin main

```

### 2. NPM Package Releases

To publish a new version to NPM:

1. **Update Version:** Go to `packages/[library]/package.json` and bump the version.
2. **Push:** `bash git push origin main `
3. **Validation:** GitHub Actions will verify if the version is unique. If you forget to bump the `package.json` version, the workflow will **fail** and prevent an overwrite.

---

## 🎨 Styling & Components

The libraries are built on **shadcn/ui** and **Tailwind CSS**.

### Card Container Colors

Available for fields using `containerStyle: 'card'`:
`green` | `blue` | `red` | `yellow` | `purple` | `indigo` | `gray` | `pink` | `orange`

### Header Sizes

`sm` | `md` | `lg` | `xl` (default) | `2xl` | `3xl` | `4xl`

---

## ⚖️ License

© 2026 Ynotsoft. All rights reserved.
