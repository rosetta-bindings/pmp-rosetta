<h1 align="center">🧊 PMP&nbsp;×&nbsp;Rosetta</h1>

<p align="center">
  <em>Automatic, multi-language bindings for the Polygon Mesh Processing library — generated, not hand-written.</em>
</p>

<p align="center">
  <a href="https://github.com/pmp-library/pmp-library"><img src="https://img.shields.io/badge/library-PMP-2c7fb8.svg" alt="PMP"></a>
  <a href="https://github.com/xaliphostes/rosetta"><img src="https://img.shields.io/badge/generator-Rosetta-6a3d9a.svg" alt="Rosetta"></a>
  <img src="https://img.shields.io/badge/C%2B%2B-26%20(P2996)-blue.svg?logo=cplusplus" alt="C++26">
  <img src="https://img.shields.io/badge/bindings-Python%20%7C%20Node%20%7C%20…-green.svg" alt="Bindings">
</p>

---

This project points [**Rosetta**](https://github.com/xaliphostes/rosetta) at the [**PMP Library**](https://github.com/pmp-library/pmp-library) and, from a single [`manifest.json`](manifest.json), generates ready-to-build bindings for the `SurfaceMesh` data structure and the mesh-processing algorithms — **without touching a line of PMP's source**.

C++26 reflection (P2996) reads the unmodified PMP headers, a small generator is emitted and compiled, and running it produces one self-contained binding project per backend (Python, Node, WebAssembly, TypeScript, REST, …). The result: call PMP's remeshing, smoothing, subdivision, decimation and curvature algorithms straight from your language of choice — see [`example_python.py`](example_python.py) and [`example_node.js`](example_node.js).

### Fetch PMP and Rosetta

```sh
cmake -S . -B build && cmake --build build -j
```

### Generate the generator for PMP

```sh
extern/rosetta/bin/rosetta_gen manifest.json gen
cmake -S gen -B gen/build && cmake --build gen/build
```

### Generate the bindings

```sh
./generator bindings
```

### Compile the bindings

Example for Python:
```sh
cmake -S bindings/python -B bindings/python/build && cmake --build bindings/python/build -j
```

Example for nodejs:
```sh
cd bindings/node && npm i && npm run build && cd ../..
```
