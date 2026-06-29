#!/usr/bin/env python3
"""PMP (Polygon Mesh Processing) — Python binding demo.

Builds a 3D surface and runs several PMP algorithms on it, all through the
rosetta-generated `pmp` module.

Notes on the current binding surface:
  * The algorithm free functions carry NO default arguments (rosetta does not
    capture C++ default values), so every parameter must be passed explicitly.
  * `pmp::Point` (Eigen `Matrix<float,3,1>`) is not yet bound as a constructible
    Python type, so per-vertex coordinate access (`position`) and manual
    `add_vertex`/`add_triangle` construction aren't available from Python.
    We therefore *build* the surface with PMP's procedural shape generators.
"""

import os
import sys

# The compiled `pmp` module lives in bindings/python/ (next to its .so).
sys.path.insert(
    0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "bindings", "python")
)

import pmp


def describe(mesh, label):
    """Print a one-line summary of a mesh using analyze() + scalar measures."""
    r = pmp.analyze(mesh)
    # volume() requires a closed triangle mesh; quad meshes (e.g. torus) only
    # report area. (PMP's triangulate() is overloaded, so it isn't bound here.)
    vol = f"{pmp.volume(mesh):.4f}" if r.is_triangle_mesh else "n/a"
    print(
        f"{label:<22} "
        f"V={r.n_vertices:<6d} F={r.n_faces:<6d} E={r.n_edges:<6d} "
        f"tri={str(r.is_triangle_mesh):<5} manifold={str(r.is_manifold):<5} "
        f"comps={r.n_components} | "
        f"area={pmp.surface_area(mesh):.4f} vol={vol} "
        f"mean_edge={pmp.mean_edge_length(mesh):.4f}"
    )


def main():
    print("=" * 100)
    print("1. Build a 3D surface procedurally")
    print("=" * 100)

    # icosphere(n_subdivisions): a unit sphere built from a subdivided icosahedron.
    mesh = pmp.icosphere(3)
    describe(mesh, "icosphere(3)")

    box = pmp.bounds(mesh)
    print(f"   bounding-box diagonal = {box.size():.4f}, empty = {box.is_empty()}")

    print()
    print("=" * 100)
    print("2. Differential geometry / analysis")
    print("=" * 100)

    # Per-vertex and per-face normals (stored as mesh properties, computed in place).
    pmp.vertex_normals(mesh)
    pmp.face_normals(mesh)
    print("   computed vertex + face normals")

    # Mean curvature -> stored on the mesh, optionally mapped to texture coords.
    #   curvature(mesh, kind, smoothing_steps, use_tensor, use_2nd_order)
    pmp.curvature(mesh, pmp.Curvature.Mean, 1, True, True)
    print("   computed mean curvature")

    # Tag sharp edges as features (dihedral angle in degrees).
    n_features = pmp.detect_features(mesh, 25.0)
    print(f"   detect_features(25 deg) -> {n_features} feature edges")
    pmp.clear_features(mesh)

    print()
    print("=" * 100)
    print("3. Apply mesh-processing algorithms")
    print("=" * 100)

    # --- Smoothing -------------------------------------------------------------
    s = pmp.icosphere(3)
    describe(s, "  before smoothing")
    #   explicit_smoothing(mesh, iterations, use_uniform_laplace)
    pmp.explicit_smoothing(s, 10, True)
    describe(s, "  after smoothing")

    # --- Remeshing -------------------------------------------------------------
    rm = pmp.icosphere(3)
    target = pmp.mean_edge_length(rm) * 1.5
    describe(rm, "  before remeshing")
    #   uniform_remeshing(mesh, target_edge_length, iterations, use_projection)
    pmp.uniform_remeshing(rm, target, 5, True)
    describe(rm, "  after remeshing")

    # --- Subdivision -----------------------------------------------------------
    sub = pmp.icosphere(1)
    describe(sub, "  before loop subdiv")
    #   loop_subdivision(mesh, boundary_handling)
    pmp.loop_subdivision(sub, pmp.BoundaryHandling.Interpolate)
    describe(sub, "  after loop subdiv")

    # --- Decimation ------------------------------------------------------------
    dec = pmp.icosphere(4)
    describe(dec, "  before decimation")
    #   decimate(mesh, n_vertices, aspect_ratio, edge_length, max_valence,
    #            normal_deviation, hausdorff_error, seam_threshold,
    #            seam_angle_deviation)
    pmp.decimate(dec, 500, 5.0, 0.0, 0, 0.0, 0.0, 0.0, 0.0)
    describe(dec, "  after decimation")

    print()
    print("=" * 100)
    print("4. Same pipeline on a different primitive (torus)")
    print("=" * 100)

    #   torus(radial_resolution, tubular_resolution, radius, thickness)
    t = pmp.torus(20, 40, 1.0, 0.4)
    describe(t, "torus")
    pmp.explicit_smoothing(t, 5, True)
    describe(t, "  smoothed torus")

    print()
    print("Done.")


if __name__ == "__main__":
    main()
