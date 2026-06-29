#!/usr/bin/env node
"use strict";

/*
 * PMP (Polygon Mesh Processing) — Node binding demo.
 *
 * Builds a 3D surface and runs several PMP algorithms on it, all through the
 * rosetta-generated `pmp` N-API addon. Mirrors example_python.py.
 *
 * Notes on the current binding surface:
 *   - The algorithm free functions carry NO default arguments (rosetta does not
 *     capture C++ default values), so every parameter must be passed explicitly.
 *   - `pmp::Point` (Eigen `Matrix<float,3,1>`) is not yet bound as a constructible
 *     type, so per-vertex coordinate access (`position`) and manual
 *     `add_vertex`/`add_triangle` construction aren't available from JS.
 *     We therefore *build* the surface with PMP's procedural shape generators.
 *   - Functions whose signature can't cross the N-API boundary (e.g. `geodesics`,
 *     which has a pointer out-parameter) are bound to a stub that throws if called.
 */

const path = require("path");

// The compiled addon lives under bindings/node/build/Release/.
const pmp = require(path.join(
    __dirname,
    "bindings",
    "node",
    "build",
    "Release",
    "pmp.node"
));

function describe(mesh, label) {
    // analyze() + scalar measures. volume() requires a closed triangle mesh;
    // quad meshes (e.g. torus) only report area. (PMP's triangulate() is
    // overloaded, so it isn't bound here.)
    const r = pmp.analyze(mesh);
    const vol = r.is_triangle_mesh ? pmp.volume(mesh).toFixed(4) : "n/a";
    console.log(
        `${label.padEnd(22)} ` +
            `V=${String(r.n_vertices).padEnd(6)} ` +
            `F=${String(r.n_faces).padEnd(6)} ` +
            `E=${String(r.n_edges).padEnd(6)} ` +
            `tri=${String(r.is_triangle_mesh).padEnd(5)} ` +
            `manifold=${String(r.is_manifold).padEnd(5)} ` +
            `comps=${r.n_components} | ` +
            `area=${pmp.surface_area(mesh).toFixed(4)} ` +
            `vol=${vol} ` +
            `mean_edge=${pmp.mean_edge_length(mesh).toFixed(4)}`
    );
}

function main() {
    const bar = "=".repeat(100);

    console.log(bar);
    console.log("1. Build a 3D surface procedurally");
    console.log(bar);

    // icosphere(n_subdivisions): a unit sphere built from a subdivided icosahedron.
    const mesh = pmp.icosphere(3);
    describe(mesh, "icosphere(3)");

    const box = pmp.bounds(mesh);
    console.log(
        `   bounding-box diagonal = ${box.size().toFixed(4)}, empty = ${box.is_empty()}`
    );

    console.log();
    console.log(bar);
    console.log("2. Differential geometry / analysis");
    console.log(bar);

    // Per-vertex and per-face normals (stored as mesh properties, computed in place).
    pmp.vertex_normals(mesh);
    pmp.face_normals(mesh);
    console.log("   computed vertex + face normals");

    // Mean curvature -> stored on the mesh.
    //   curvature(mesh, kind, smoothing_steps, use_tensor, use_2nd_order)
    pmp.curvature(mesh, pmp.Curvature.Mean, 1, true, true);
    console.log("   computed mean curvature");

    // Tag sharp edges as features (dihedral angle in degrees).
    const nFeatures = pmp.detect_features(mesh, 25.0);
    console.log(`   detect_features(25 deg) -> ${nFeatures} feature edges`);
    pmp.clear_features(mesh);

    console.log();
    console.log(bar);
    console.log("3. Apply mesh-processing algorithms");
    console.log(bar);

    // --- Smoothing (free function mutating the mesh in place via SurfaceMesh&) ---
    const s = pmp.icosphere(3);
    describe(s, "  before smoothing");
    //   explicit_smoothing(mesh, iterations, use_uniform_laplace)
    pmp.explicit_smoothing(s, 10, true);
    describe(s, "  after smoothing");

    // --- Remeshing ---
    const rm = pmp.icosphere(3);
    const target = pmp.mean_edge_length(rm) * 1.5;
    describe(rm, "  before remeshing");
    //   uniform_remeshing(mesh, target_edge_length, iterations, use_projection)
    pmp.uniform_remeshing(rm, target, 5, true);
    describe(rm, "  after remeshing");

    // --- Subdivision ---
    const sub = pmp.icosphere(1);
    describe(sub, "  before loop subdiv");
    //   loop_subdivision(mesh, boundary_handling)
    pmp.loop_subdivision(sub, pmp.BoundaryHandling.Interpolate);
    describe(sub, "  after loop subdiv");

    // --- Decimation ---
    const dec = pmp.icosphere(4);
    describe(dec, "  before decimation");
    //   decimate(mesh, n_vertices, aspect_ratio, edge_length, max_valence,
    //            normal_deviation, hausdorff_error, seam_threshold,
    //            seam_angle_deviation)
    pmp.decimate(dec, 500, 5.0, 0.0, 0, 0.0, 0.0, 0.0, 0.0);
    describe(dec, "  after decimation");

    console.log();
    console.log(bar);
    console.log("4. Same pipeline on a different primitive (torus)");
    console.log(bar);

    //   torus(radial_resolution, tubular_resolution, radius, thickness)
    const t = pmp.torus(20, 40, 1.0, 0.4);
    describe(t, "torus");
    pmp.explicit_smoothing(t, 5, true);
    describe(t, "  smoothed torus");

    console.log();
    console.log("Done.");
}

main();
