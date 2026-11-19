/* Test fixture for js/data/animations.js (fake entries, no real video). */
window.VG = window.VG || {};
VG.animTools = [
  { id: "manim", name: "Manim (fixture)", language: "Python", summary: "Fixture: math animation engine.", bestFor: ["math explainers", "graphs", "equations"],
    notGreatFor: ["photoreal footage"], difficulty: 2, cost: "Free (MIT)", needs: "Python, ffmpeg", howClaudeUsesIt: "Writes a Scene class and renders it.",
    setup: "pip install manim", url: "https://example.com", examplesUrl: "https://example.com/gallery", pros: ["Beautiful math"], cons: ["LaTeX setup"],
    demos: [{ id: "manim-equation", title: "Equation transform", file: "media/video/fixture-missing.mp4", poster: "media/video/fixture-missing.jpg", durationSec: 8,
      source: "tests/fixtures/sample_scene.py", sourceLang: "python", description: "Fixture demo description.", renderCmd: "manim -qm equation.py EquationScene" }] },
  { id: "remotion", name: "Remotion (fixture)", language: "TypeScript / React", summary: "Fixture: React for video.", bestFor: ["social shorts", "templates"],
    notGreatFor: ["3D"], difficulty: 3, cost: "Free for individuals", needs: "Node.js", howClaudeUsesIt: "Writes React components.", setup: "npx create-video@latest",
    url: "https://example.com", examplesUrl: "https://example.com", pros: ["Web skills"], cons: ["License for companies"],
    demos: [{ id: "remotion-captions-9x16", title: "Vertical captions", file: "media/video/fixture-missing-2.mp4", poster: null, durationSec: 10,
      source: "tests/fixtures/sample_comp.tsx", sourceLang: "tsx", description: "Fixture vertical demo.", renderCmd: "npx remotion render Captions" }] },
  { id: "blender", name: "Blender (fixture)", language: "Python (bpy)", summary: "Fixture tool without demos.", bestFor: ["3D"], notGreatFor: ["quick edits"],
    difficulty: 5, cost: "Free (GPL)", needs: "Blender", howClaudeUsesIt: "Writes bpy scripts.", setup: "winget install BlenderFoundation.Blender",
    url: "https://example.com", examplesUrl: "https://example.com/examples", pros: ["Powerful"], cons: ["Heavy"], demos: [] }
];
