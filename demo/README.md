# @plasius/gpu-physics Demo

The primary physics demo is now a browser-backed 3D harbor scene.

It validates:

- authoritative rigid-body ordering
- stable `worldSnapshot` handoff timing
- GLTF ship collision metadata
- downstream visual consumers such as cloth, fluid, and lighting

## Run the Browser Demo

```bash
npm run demo
```

Open `http://localhost:8000/gpu-physics/demo/`.

## Optional CLI Example

The original export sanity check remains available:

```bash
npm run build
node demo/example.mjs
```
